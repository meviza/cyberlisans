#!/bin/bash
# Production health check — login + kritik endpoint'ler

BASE=${1:-https://cyberlisans.vercel.app}
set -e

echo "→ Health check: $BASE"
curl -sS -o /dev/null -w "  /health           %{http_code} (%{time_total}s)\n" $BASE/api/health
curl -sS -X POST -o /dev/null -w "  /auth/login       %{http_code} (%{time_total}s)\n" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@cyberlisans.com","password":"Alice!2026Safe"}' \
  $BASE/api/auth/login
curl -sS -o /dev/null -w "  /sellers/public   %{http_code} (%{time_total}s)\n" \
  $BASE/api/sellers/alice-gaming-keys/public
curl -sS -o /dev/null -w "  /                 %{http_code} (%{time_total}s)\n" $BASE/

echo "✓ All checks passed"