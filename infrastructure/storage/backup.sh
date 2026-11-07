#!/usr/bin/env bash
# Backup MongoDB dump (+ optional MinIO mirror) into ./backups/<timestamp>
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${BACKUP_DIR:-$ROOT/backups}/$STAMP"
mkdir -p "$OUT"

# Prefer host mongodump against MONGODB_URI (matches Nest local .env).
# Set USE_DOCKER_MONGO=1 to dump the Compose mongodb service instead.
load_dotenv() {
  local file="$ROOT/.env"
  [[ -f "$file" ]] || return 0
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    if [[ "$line" =~ ^(MONGODB_URI|STORAGE_ENDPOINT|STORAGE_BUCKET|STORAGE_ACCESS_KEY|STORAGE_SECRET_KEY)= ]]; then
      export "$line"
    fi
  done < "$file"
}
load_dotenv

MONGO_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/fornix}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.yml}"
MONGO_SERVICE="${MONGO_SERVICE:-mongodb}"
MINIO_ENDPOINT="${STORAGE_ENDPOINT:-http://localhost:9000}"
BUCKET="${STORAGE_BUCKET:-fornix}"
ACCESS_KEY="${STORAGE_ACCESS_KEY:-minioadmin}"
SECRET_KEY="${STORAGE_SECRET_KEY:-minioadmin}"

echo "Backing up MongoDB → $OUT/mongo.archive.gz"
if [[ "${USE_DOCKER_MONGO:-0}" == "1" ]]; then
  docker compose -f "$COMPOSE_FILE" exec -T "$MONGO_SERVICE" \
    mongodump --archive --gzip --db fornix > "$OUT/mongo.archive.gz"
elif command -v mongodump >/dev/null 2>&1; then
  mongodump --uri="$MONGO_URI" --archive="$OUT/mongo.archive.gz" --gzip
else
  echo "mongodump not found on PATH; falling back to Compose service '$MONGO_SERVICE'"
  docker compose -f "$COMPOSE_FILE" exec -T "$MONGO_SERVICE" \
    mongodump --archive --gzip --db fornix > "$OUT/mongo.archive.gz"
fi

SIZE="$(wc -c < "$OUT/mongo.archive.gz" | tr -d ' ')"
if [[ "$SIZE" -lt 200 ]]; then
  echo "Backup archive looks empty (${SIZE} bytes). Aborting." >&2
  exit 1
fi

echo "Backing up MinIO bucket $BUCKET → $OUT/minio"
if command -v mc >/dev/null 2>&1; then
  mc alias set fornix-backup "$MINIO_ENDPOINT" "$ACCESS_KEY" "$SECRET_KEY" >/dev/null
  mc mirror --overwrite "fornix-backup/$BUCKET" "$OUT/minio"
else
  echo "mc (MinIO client) not found; wrote Mongo dump only."
  echo "Install mc and re-run to include object storage." > "$OUT/minio-SKIPPED.txt"
fi

echo "Backup complete: $OUT ($SIZE bytes mongo archive)"
echo "$OUT" > "$ROOT/backups/LATEST"
