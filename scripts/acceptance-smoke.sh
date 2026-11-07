#!/usr/bin/env bash
# End-to-end acceptance smoke for Phase 1 criteria (API-level).
set -euo pipefail

API="${API_BASE_URL:-http://localhost:3000/api/v1}"
EMAIL="accept_$(date +%s)@example.com"
PASS="password123"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

json() { node -pe "JSON.parse(require('fs').readFileSync(0,'utf8'))$1"; }

echo "== health =="
curl -sf "$API/health" | grep -q '"status"'

echo "== register/login =="
REG=$(curl -sf -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"displayName\":\"Accept User\",\"password\":\"$PASS\"}" \
  "$API/auth/register")
TOKEN=$(printf '%s' "$REG" | json '.accessToken')
AUTH="Authorization: Bearer $TOKEN"

echo "== research + project =="
R=$(curl -sf -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"title":"AC Research","description":"accept-token-alpha","category":"Firmware"}' \
  "$API/research")
RID=$(printf '%s' "$R" | json '._id')

P=$(curl -sf -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"title":"AC Project","description":"project body","category":"Software"}' \
  "$API/projects")
PID=$(printf '%s' "$P" | json '._id')

echo "== checkpoints + entries + progress =="
CP=$(curl -sf -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"parentType\":\"research\",\"parentId\":\"$RID\",\"title\":\"CP1\",\"mode\":\"detailed\",\"objective\":\"Validate dump\",\"status\":\"In Progress\",\"progress\":40,\"weight\":1}" \
  "$API/checkpoints")
CPID=$(printf '%s' "$CP" | json '._id')

curl -sf -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"title":"Entry 1","content":"observed signal","entryType":"Finding"}' \
  "$API/checkpoints/$CPID/entries" >/dev/null

curl -sf -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"parentType\":\"research\",\"parentId\":\"$RID\",\"title\":\"CP2\",\"mode\":\"quick\",\"status\":\"Completed\",\"progress\":100,\"weight\":1}" \
  "$API/checkpoints" >/dev/null



R2=$(curl -sf -H "$AUTH" "$API/research/$RID")
PROGRESS=$(printf '%s' "$R2" | json '.progress')
node -e "const p=Number(process.argv[1]); if(!(p>=60 && p<=80)) process.exit(1)" "$PROGRESS"

echo "== documentation =="
DOC=$(curl -sf -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"title\":\"AC Doc\",\"parentType\":\"research\",\"parentId\":\"$RID\",\"status\":\"Draft\",\"content\":{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"code block ready accept-token-alpha\"}]}]}}" \
  "$API/documentations")
DOCID=$(printf '%s' "$DOC" | json '._id')
curl -sf -H "$AUTH" -H 'Content-Type: application/json' \
  -X PATCH -d "{\"content\":{\"type\":\"doc\",\"content\":[{\"type\":\"codeBlock\",\"attrs\":{\"language\":\"bash\"},\"content\":[{\"type\":\"text\",\"text\":\"echo hi\"}]}]},\"baseUpdatedAt\":\"$(printf '%s' "$DOC" | json '.updatedAt')\"}" \
  "$API/documentations/$DOCID" >/dev/null


echo "== attachments =="
echo 'accept file body' > "$TMP/note.txt"
UP=$(curl -sf -H "$AUTH" -F "parentType=research" -F "parentId=$RID" -F "file=@$TMP/note.txt;type=text/plain" \
  "$API/attachments")
AID=$(printf '%s' "$UP" | json '._id')
curl -sf -H "$AUTH" -o "$TMP/dl.txt" "$API/attachments/$AID/download"
grep -q 'accept file body' "$TMP/dl.txt"

echo "== search =="
SEARCH=$(curl -sf -H "$AUTH" "$API/search?q=accept-token-alpha")
TOTAL=$(printf '%s' "$SEARCH" | json '.total')
node -e "if(Number(process.argv[1])<1) process.exit(1)" "$TOTAL"

echo "== archive =="
curl -sf -H "$AUTH" -X POST "$API/research/$RID/archive" >/dev/null
curl -sf -H "$AUTH" "$API/research?archived=true" | grep -q "$RID"

echo "Acceptance smoke OK ($EMAIL)"
