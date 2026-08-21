#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo " Starting Mercury Dasha Development Environment"
echo " (Go Unified Server + Next.js Hot Reload UI)"
echo "=========================================================="

# Build and start Go server
echo "[1/2] Starting Go backend on http://localhost:8080..."
go run . -port 8080 &
GO_PID=$!

trap "kill $GO_PID 2>/dev/null || true; exit" SIGINT SIGTERM EXIT

# Start Next.js dev server
echo "[2/2] Starting Next.js frontend on http://localhost:3000..."
cd frontend && pnpm dev --port 3000
