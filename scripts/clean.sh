#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo " [CLEAN] Purging stale processes and build artifacts"
echo "=========================================================="

# Kill any running server instances to release ports and BoltDB locks
killall -9 mercury-dasha-server 2>/dev/null || true

# Clean build artifacts
rm -f mercury-dasha-server
rm -rf frontend/out frontend/.next

echo "✅ Environment cleaned and file locks released."