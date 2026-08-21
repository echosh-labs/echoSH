#!/usr/bin/env bash
# ==============================================================================
# scripts/axismundi_watchdog.sh
# Zero-Token Autonomous Watchdog Daemon for Axis Mundi Amra Core
# ==============================================================================
# Listens to Axis Mundi SSE event stream (/api/stream/events) at 0 AI token cost.
# When an [EXECUTE] directive is queued, it extracts the instruction payload
# and displays an urgent execution alert block for agentic processing.
# ==============================================================================

set -euo pipefail

PORT="${1:-3000}"
BASE_URL="http://localhost:$PORT"
STREAM_URL="$BASE_URL/api/stream/events"
POLL_URL="$BASE_URL/api/axismundi/directives/pending"

echo "=========================================================="
echo " 👁️  AXIS MUNDI ZERO-TOKEN AGENT WATCHDOG ACTIVE"
echo "    Listening on: $STREAM_URL"
echo "    AI Token Consumption: 0 Tokens (Passive Listener)"
echo "=========================================================="

# Check server connectivity
if ! curl -s -f "$BASE_URL/api/health" > /dev/null; then
    echo "❌ Axis Mundi server is not reachable at $BASE_URL. Start it first via 'make run'."
    exit 1
fi

echo "✅ Server connection verified. Waiting for [EXECUTE] directives from Google Keep..."
echo ""

# Stream listener loop with auto-reconnection
while true; do
    curl -N -s "$STREAM_URL" | while read -r line; do
        if [[ "$line" == event:*axismundi_execute_alert* ]]; then
            read -r data_line
            payload="${data_line#data: }"
            
            echo ""
            echo "=========================================================="
            echo "⚡ [AXIS MUNDI EXECUTE DIRECTIVE DETECTED] ⚡"
            echo "=========================================================="
            echo "Payload: $payload"
            echo "Time: $(date -u '+%Y-%m-%d %H:%M:%SZ')"
            echo "=========================================================="
            echo ""
        fi
    done || true

    # Fallback / short sleep if stream dropped
    sleep 3
done