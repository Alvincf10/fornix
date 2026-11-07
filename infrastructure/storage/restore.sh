#!/usr/bin/env bash
# Restore from a backup directory created by backup.sh
# Usage: ./restore.sh [backup-dir]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="${1:-}"
if [[ -z "$SRC" && -f "$ROOT/backups/LATEST" ]]; then
  SRC="$(cat "$ROOT/backups/LATEST")"
fi
if [[ -z "$SRC" || ! -d "$SRC" ]]; then
  echo "Usage: $0 /path/to/backups/<timestamp>" >&2
  exit 1
fi

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

if [[ ! -f "$SRC/mongo.archive.gz" ]]; then
  echo "Missing $SRC/mongo.archive.gz" >&2
  exit 1
fi

SIZE="$(wc -c < "$SRC/mongo.archive.gz" | tr -d ' ')"
if [[ "$SIZE" -lt 200 ]]; then
  echo "Refusing to restore tiny archive (${SIZE} bytes)." >&2
  exit 1
fi

echo "Restoring MongoDB from $SRC/mongo.archive.gz"
if [[ "${USE_DOCKER_MONGO:-0}" == "1" ]]; then
  docker compose -f "$COMPOSE_FILE" exec -T "$MONGO_SERVICE" \
    mongorestore --archive --gzip --drop --nsInclude='fornix.*' < "$SRC/mongo.archive.gz"
elif command -v mongorestore >/dev/null 2>&1; then
  mongorestore --uri="$MONGO_URI" --archive="$SRC/mongo.archive.gz" --gzip --drop
else
  echo "mongorestore not found on PATH; falling back to Compose service '$MONGO_SERVICE'"
  docker compose -f "$COMPOSE_FILE" exec -T "$MONGO_SERVICE" \
    mongorestore --archive --gzip --drop --nsInclude='fornix.*' < "$SRC/mongo.archive.gz"
fi

if [[ -d "$SRC/minio" ]] && command -v mc >/dev/null 2>&1; then
  echo "Restoring MinIO bucket $BUCKET"
  mc alias set fornix-restore "$MINIO_ENDPOINT" "$ACCESS_KEY" "$SECRET_KEY" >/dev/null
  mc mb --ignore-existing "fornix-restore/$BUCKET"
  mc mirror --overwrite "$SRC/minio" "fornix-restore/$BUCKET"
else
  echo "Skipping MinIO restore (no ./minio dir or mc missing)."
fi

echo "Restore complete from $SRC"
