#!/usr/bin/env bash
# Bootstrap CyberLisans on Netlify after `netlify login`.
# Usage (from repo root):
#   ./scripts/netlify-bootstrap.sh
# Optional:
#   SITE_NAME=cyberlisans ./scripts/netlify-bootstrap.sh
#   SKIP_DEPLOY=1 ./scripts/netlify-bootstrap.sh   # link + env only

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SITE_NAME="${SITE_NAME:-cyberlisans}"
ENV_FILE="${ENV_FILE:-$ROOT/.env.netlify}"
SKIP_DEPLOY="${SKIP_DEPLOY:-0}"

if ! command -v netlify >/dev/null 2>&1; then
  echo "netlify CLI missing. Install: npm i -g netlify-cli"
  exit 1
fi

if ! netlify status >/dev/null 2>&1; then
  echo "Not logged in. Run: netlify login"
  echo "Then re-run this script."
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  echo "Create it from Vercel: vercel env pull .env.netlify --environment=production"
  echo "Then strip VERCEL_*/TURBO_* keys (or re-run the agent setup)."
  exit 1
fi

# Link existing site or create a new one
if [[ -f "$ROOT/.netlify/state.json" ]]; then
  echo "Already linked (.netlify/state.json present)."
  netlify status || true
else
  echo "Creating / linking site: $SITE_NAME"
  # Non-interactive create when possible
  if netlify sites:list --json 2>/dev/null | grep -q "\"name\":\"$SITE_NAME\""; then
    SITE_ID="$(netlify sites:list --json | python3 -c "import sys,json; sites=json.load(sys.stdin); print(next(s['id'] for s in sites if s.get('name')=='$SITE_NAME'))")"
    netlify link --id "$SITE_ID"
  else
    netlify sites:create --name "$SITE_NAME" --disable-linking || true
    netlify link --name "$SITE_NAME" || netlify init --manual <<EOF || true
EOF
  fi
fi

echo "Importing env vars from $ENV_FILE (production + deploy-preview)..."
# Import key=value lines (skip comments/empty). Does not print values.
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  [[ "$line" != *"="* ]] && continue
  key="${line%%=*}"
  val="${line#*=}"
  # strip surrounding quotes
  if [[ "$val" =~ ^\".*\"$ ]]; then val="${val:1:${#val}-2}"; fi
  if [[ "$val" =~ ^\'.*\'$ ]]; then val="${val:1:${#val}-2}"; fi
  # skip platform junk if still present
  case "$key" in
    VERCEL*|TURBO_*|NX_*) continue ;;
  esac
  netlify env:set "$key" "$val" --context production deploy-preview --force >/dev/null
  echo "  set $key"
done < "$ENV_FILE"

# Point public URLs at Netlify after first site exists
SITE_URL="$(netlify status --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('site',{}).get('url') or d.get('siteData',{}).get('url') or '')" 2>/dev/null || true)"
if [[ -n "${SITE_URL:-}" ]]; then
  echo "Updating NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_API_URL → $SITE_URL"
  netlify env:set NEXT_PUBLIC_APP_URL "$SITE_URL" --context production --force >/dev/null
  netlify env:set NEXT_PUBLIC_API_URL "$SITE_URL" --context production --force >/dev/null
  # Same-origin API routes under Next (/api/*) — INTERNAL can stay relative or site URL
  netlify env:set INTERNAL_API_URL "$SITE_URL" --context production --force >/dev/null || true
fi

if [[ "$SKIP_DEPLOY" == "1" ]]; then
  echo "SKIP_DEPLOY=1 — env/link only. Done."
  exit 0
fi

echo "Triggering production deploy..."
netlify deploy --build --prod

echo "Done. Check: netlify open:site"
