#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COLLECTION="$ROOT_DIR/postman/cyberlisans.postman_collection.json"
ENVIRONMENT="${1:-$ROOT_DIR/postman/environments/production.postman_environment.json}"
REPORT_DIR="$ROOT_DIR/postman/reports"
REPORT_HTML="$REPORT_DIR/newman-report.html"

if [[ ! -f "$COLLECTION" ]]; then
  echo "Collection not found: $COLLECTION" >&2
  exit 1
fi

if [[ ! -f "$ENVIRONMENT" ]]; then
  echo "Environment not found: $ENVIRONMENT" >&2
  exit 1
fi

mkdir -p "$REPORT_DIR"

echo "Running Newman collection:"
echo "  Collection : $COLLECTION"
echo "  Environment: $ENVIRONMENT"
echo "  Report     : $REPORT_HTML"

# Prefer global newman; fall back to npx.
if command -v newman >/dev/null 2>&1; then
  NEWMAN_BIN="newman"
else
  NEWMAN_BIN="npx --yes newman"
fi

$NEWMAN_BIN run "$COLLECTION" \
  --environment "$ENVIRONMENT" \
  --reporters cli,html \
  --reporter-html-export "$REPORT_HTML" \
  --color off \
  --disable-unicode

status=$?
if [[ $status -ne 0 ]]; then
  echo "Newman run failed with status $status" >&2
  exit "$status"
fi

echo "Newman run completed. Report: $REPORT_HTML"