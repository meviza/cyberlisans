#!/usr/bin/env bash
# Newman test ortamını deterministik hale getirir:
# - Test kullanıcıları için 2FA'yı kapatır
# - Daha önceki koşulardan kalan test seller ürünlerini siler
# - Postman env'deki token alanlarını sıfırlar

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_ENV="$REPO_ROOT/apps/api/.env"
ENV_FILE="$REPO_ROOT/postman/environments/local.postman_environment.json"
ENV_RESET="/tmp/cyberlisans-env-reset.json"

if [ ! -f "$API_ENV" ]; then
  echo "[setup] .env bulunamadı: $API_ENV" >&2
  exit 1
fi

SUPABASE_URL=$(grep -E '^SUPABASE_URL=' "$API_ENV" | head -1 | cut -d'"' -f2)
SUPABASE_KEY=$(grep -E '^SUPABASE_SERVICE_ROLE_KEY=' "$API_ENV" | head -1 | cut -d'"' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "[setup] Supabase URL/key eksik" >&2
  exit 1
fi

HDR=( -H "apikey: $SUPABASE_KEY" -H "Authorization: Bearer $SUPABASE_KEY" )
BASE="$SUPABASE_URL/rest/v1"

echo "[setup] user ids alınıyor (admin/alice/bob)..."
USER_IDS=$(curl -s "$BASE/users?select=id&email=in.(admin@cyberlisans.com,alice@cyberlisans.com,bob@cyberlisans.com)" "${HDR[@]}")
USER_ID_LIST=$(echo "$USER_IDS" | python3 -c "import json,sys; ids=[u['id'] for u in json.load(sys.stdin)]; print(','.join('\"'+i+'\"' for i in ids))")
echo "       $USER_ID_LIST"

echo "[setup] user_two_factors siliniyor..."
curl -s -X DELETE "$BASE/user_two_factors?userId=in.($USER_ID_LIST)" "${HDR[@]}" -w "  -> HTTP %{http_code}\n" -o /dev/null

echo "[setup] Önceki test seller ürünleri (test-*) siliniyor..."
SELLER_IDS=$(curl -s "$BASE/sellers?select=id" "${HDR[@]}")
SELLER_ID_LIST=$(echo "$SELLER_IDS" | python3 -c "import json,sys; ids=[s['id'] for s in json.load(sys.stdin)]; print(','.join('\"'+i+'\"' for i in ids))")
if [ -n "$SELLER_ID_LIST" ]; then
  curl -s -X DELETE "$BASE/products?listingType=eq.SELLER&sellerId=in.($SELLER_ID_LIST)&slug=like.test-*" "${HDR[@]}" -w "  -> HTTP %{http_code}\n" -o /dev/null
fi

echo "[setup] Test order için mevcut escrow/dispute siliniyor..."
TEST_ORDER="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
ESCROW_IDS=$(curl -s "$BASE/escrow_transactions?select=id&orderId=eq.$TEST_ORDER" "${HDR[@]}" | python3 -c "import json,sys; ids=[r['id'] for r in json.load(sys.stdin)]; print(','.join('\"'+i+'\"' for i in ids))")
if [ -n "$ESCROW_IDS" ]; then
  echo "       escrow ids: $ESCROW_IDS"
  curl -s -X DELETE "$BASE/disputes?escrowId=in.($ESCROW_IDS)" "${HDR[@]}" -w "  -> disputes %{http_code}\n" -o /dev/null
  curl -s -X DELETE "$BASE/escrow_transactions?id=in.($ESCROW_IDS)" "${HDR[@]}" -w "  -> escrow    %{http_code}\n" -o /dev/null
fi

echo "[setup] Postman env token alanları sıfırlanıyor..."
jq '.values |= map(
  if .key | test("_token$") then .value = ""
  elif .key == "test_order_id" then .value = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
  else . end
)' "$ENV_FILE" > "$ENV_RESET"
echo "       -> $ENV_RESET"

echo "[setup] Tamam."