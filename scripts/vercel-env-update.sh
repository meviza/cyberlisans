#!/usr/bin/env bash
# Vercel env variable'ları verilen secret'larla güncelle
# Kullanım:
#   export VERCEL_TOKEN="..."
#   export SUPABASE_SERVICE_ROLE_KEY="..."
#   bash scripts/vercel-env-update.sh SHOPIER_API_KEY "value"
#
# Veya env ile:
#   ROTATE_SHOPIER_API_KEY="value" bash scripts/vercel-env-update.sh SHOPIER_API_KEY
#
# ⚠️ Vercel token sensitive — script log'a yazmaz.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ "$#" -lt 1 ]; then
  echo "Usage: bash scripts/vercel-env-update.sh <env_name> [value]" >&2
  echo "Env name: SHOPIER_API_KEY, SHOPIER_API_SECRET, vs." >&2
  exit 1
fi

ENV_NAME="$1"
shift

ENV_VALUE="${1:-${ROTATE_${ENV_NAME}:-}}"

if [ -z "$ENV_VALUE" ]; then
  echo "ERROR: No value for ${ENV_NAME}. Pass as arg or set ROTATE_${ENV_NAME} env." >&2
  exit 1
fi

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "ERROR: VERCEL_TOKEN not set. Get from https://vercel.com/account/tokens" >&2
  exit 1
fi

VERCEL_PROJECT="${VERCEL_PROJECT:-prj_UJlBBLXtEra8Y6TsOUh5XPxpeEsu}"
VERCEL_TEAM="${VERCEL_TEAM:-mevizas-projects}"

# vercel env add requires interactive — use API directly
# https://vercel.com/docs/rest-api/endpoints/projects#add-an-environment-variable

API_BASE="https://api.vercel.com"
PROJECT_URL="$API_BASE/v10/projects/$VERCEL_PROJECT/env"

ENV_ID=$(curl -sS -G "$PROJECT_URL" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  --data-urlencode "key=$ENV_NAME" \
  --data-urlencode "target=production" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('envs',[{}])[0].get('id','') if d.get('envs') else '')" 2>/dev/null)

if [ -n "$ENV_ID" ] && [ "$ENV_ID" != "None" ] && [ "$ENV_ID" != "null" ]; then
  # Update existing
  echo "[vercel] updating ${ENV_NAME}..."
  curl -sS -X POST "$PROJECT_URL/$ENV_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$(python3 -c "import json; print(json.dumps({'value': '$ENV_VALUE', 'target': ['production','preview','development'], 'type': 'encrypted'}))")" \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print('[vercel]', 'updated' if d.get('id') else 'failed')"
else
  # Create new
  echo "[vercel] creating ${ENV_NAME}..."
  curl -sS -X POST "$PROJECT_URL" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$(python3 -c "import json; print(json.dumps({'key': '$ENV_NAME', 'value': '$ENV_VALUE', 'target': ['production','preview','development'], 'type': 'encrypted'}))")" \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print('[vercel]', 'created' if d.get('id') else 'failed')"
fi

# Echo success (no values leaked)
echo "[done] ${ENV_NAME} rotated in Vercel"
echo "       timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"