#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo " [BUILD] Compiling Mercury Dasha Unified System"
echo "=========================================================="

# 1. Clean previous build artifacts
bash scripts/clean.sh

# 2. Build Next.js Static Production Export
echo ""
echo "[1/2] Building Next.js static presentation shell..."
cd frontend
pnpm build
cd ..

# 3. Compile Singular Go Binary
echo ""
echo "[2/2] Compiling singular unified Go binary (embedded UI + migrations)..."
go build -ldflags="-s -w" -o mercury-dasha-server .

echo ""
echo "=========================================================="
echo "✅ Build Successful! Executable ready at ./mercury-dasha-server"
echo "   Run directly via: ./mercury-dasha-server -port 3000"
echo "   Or via Makefile:  make run"
echo "=========================================================="