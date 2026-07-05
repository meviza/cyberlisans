#!/bin/bash
# Her deploy öncesi koşacak: lint + typecheck + build + health sim

set -e
cd /Users/keremcelik/Projects/cyberlisans

echo "→ Typecheck API"
pnpm --filter @cyberlisans/api typecheck

echo "→ Typecheck Web"
pnpm --filter @cyberlisans/web typecheck

echo "→ Build web"
pnpm --filter @cyberlisans/web build

echo "→ Health check (production)"
./scripts/health-check.sh

echo "✓ Deploy safe"