#!/bin/bash
# Vercel helper wrapper — MCP yerine Bash tool için

case "$1" in
  deploy)   vercel deploy --prod --yes 2>&1 | tail -10 ;;
  env:ls)   vercel env ls 2>&1 ;;
  logs)     vercel logs --follow --production 2>&1 | head -50 ;;
  alias)    vercel alias ls 2>&1 ;;
  inspect)  vercel inspect 2>&1 | head -20 ;;
  domains)  vercel domains ls 2>&1 ;;
  project)  vercel project ls 2>&1 ;;
  *)
    echo "Usage: $0 {deploy|env:ls|logs|alias|inspect|domains|project}"
    exit 1
    ;;
esac