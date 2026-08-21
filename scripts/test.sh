#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo " [TEST] Running Automated Mercury Dasha Multi-Tier Test Suite"
echo "=========================================================="

# 1. Kill any existing instances to avoid BoltDB lock collision
killall -9 mercury-dasha-server 2>/dev/null || true

# --- STAGE 1: Go Backend Unit & Concurrency Tests ---
echo ""
echo "=== STAGE 1/3: Go Backend Unit & Race Tests ==="
go test -v -race ./...

# --- STAGE 2: Frontend Typecheck, Unit Tests & Lint ---
echo ""
echo "=== STAGE 2/3: Frontend Tests & Linting ==="
cd frontend
pnpm typecheck
pnpm test
pnpm lint
cd ..

# --- STAGE 3: Ephemeral Binary HTTP Route Assertions ---
echo ""
echo "=== STAGE 3/3: Ephemeral HTTP Contract Assertions ==="

# Ensure executable binary is compiled with latest Go source
echo "Compiling latest Go binary for ephemeral testing..."
go build -o ./mercury-dasha-server .

TEST_PORT=3099
echo "Launching ephemeral test server on http://localhost:$TEST_PORT..."
./mercury-dasha-server -port $TEST_PORT > /dev/null 2>&1 &
SERVER_PID=$!

# Ensure cleanup on any exit
cleanup() {
    echo ""
    echo "Terminating test server (PID: $SERVER_PID)..."
    kill -9 $SERVER_PID 2>/dev/null || true
    sleep 0.5
}
trap cleanup EXIT

# Wait for server to boot
sleep 1.2

assert_endpoint() {
    local route="$1"
    local expected_code="$2"
    local name="$3"
    
    local start_time=$(date +%s%N)
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$TEST_PORT$route")
    local end_time=$(date +%s%N)
    local duration_ms=$(( (end_time - start_time) / 1000000 ))

    if [ "$http_code" -eq "$expected_code" ]; then
        echo "  ✅ [PASS] $name ($route) -> HTTP $http_code (${duration_ms}ms)"
    else
        echo "  ❌ [FAIL] $name ($route) -> Expected HTTP $expected_code, Got $http_code"
        exit 1
    fi
}

assert_endpoint "/api/health" 200 "Health & Engine Status"
assert_endpoint "/api/manifesto" 200 "Fundamental Manifesto"
assert_endpoint "/api/foundations/narrative" 200 "Foundations Narrative Staircase"
assert_endpoint "/api/audio/presets" 200 "Synesthetic Audio Presets"
assert_endpoint "/api/dasha" 200 "17-Year Dasha Chronology"
assert_endpoint "/api/nakshatras" 200 "27 Nakshatras Mandala"
assert_endpoint "/api/alchemical" 200 "Alchemical Crucible"
assert_endpoint "/api/author" 200 "Author Opus & Essays"
assert_endpoint "/api/axismundi/directives" 200 "Axis Mundi Directives Registry"
assert_endpoint "/api/axismundi/directives/pending" 200 "Axis Mundi Pending Directives"
assert_endpoint "/archive/axis-mundi/" 200 "Axis Mundi Embedded Archive"
assert_endpoint "/archive/foundations/" 200 "Foundations Embedded Archive"
assert_endpoint "/foundations" 200 "Dedicated Foundations Story Route"
assert_endpoint "/" 200 "Next.js Static SPA Root"

echo ""
echo "=========================================================="
echo "✅ All Backend, Frontend, and HTTP Integration Tests PASSED!"
echo "   Zero lingering processes. Environment is quiescent."
echo "=========================================================="