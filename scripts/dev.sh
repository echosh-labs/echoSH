#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo " [DEV] Starting Mercury Dasha Live Development Environment"
echo " (Go Unified Server on :8080 + Next.js Hot Reload on :3000)"
echo "=========================================================="

# Ensure clean slate
killall -9 mercury-dasha-server 2>/dev/null || true

# Start Go backend
echo "[1/2] Starting Go backend on http://localhost:8080..."
go run . -port 8080 &
GO_PID=$!

trap "echo ''; echo 'Shutting down Go backend (PID: $GO_PID)...'; kill -9 $GO_PID 2>/dev/null || true; exit" SIGINT SIGTERM EXIT

# Start Next.js frontend
echo "[2/2] Starting Next.js frontend on http://localhost:3000..."
cd frontend && pnpm dev --port 3000