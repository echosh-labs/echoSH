#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo " [TEST] Running Automated Mercury Dasha Test Suite"
echo "=========================================================="

# 1. Kill any existing instances to avoid BoltDB lock collision
killall -9 mercury-dasha-server 2>/dev/null || true

# 2. Ensure executable binary is compiled
if [ ! -f "./mercury-dasha-server" ]; then
    echo "Executable binary not found. Running build pipeline..."
    bash scripts/build.sh
fi

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

echo ""
echo "--- Executing HTTP Route Assertions ---"

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
assert_endpoint "/archive/axis-mundi/" 200 "Axis Mundi Embedded Archive"
assert_endpoint "/archive/foundations/" 200 "Foundations Embedded Archive"
assert_endpoint "/" 200 "Next.js Static SPA Root"

echo ""
echo "=========================================================="
echo "✅ All 11 Automated Tests Passed Successfully!"
echo "   Zero lingering processes. Environment is quiescent."
echo "=========================================================="