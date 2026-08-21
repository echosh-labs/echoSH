#!/usr/bin/env bash
set -e

PORT="${PORT:-3000}"
BASE_URL="http://localhost:$PORT"

CMD="$1"

case "$CMD" in
    send)
        NOTE_TEXT="$2"
        if [ -z "$NOTE_TEXT" ]; then
            echo "Usage: bash scripts/axismundi.sh send \"[EXECUTE] Your directive text #amra-exec\""
            exit 1
        fi
        echo "Ingesting note into Axis Mundi Amra Core via $BASE_URL/api/axismundi/ingest..."
        curl -s -X POST "$BASE_URL/api/axismundi/ingest" \
            -H "Content-Type: application/json" \
            -d "{\"title\":\"CLI Directive\",\"content\":\"$NOTE_TEXT\",\"source\":\"cli\"}" | jq . || curl -s -X POST "$BASE_URL/api/axismundi/ingest" -H "Content-Type: application/json" -d "{\"title\":\"CLI Directive\",\"content\":\"$NOTE_TEXT\",\"source\":\"cli\"}"
        echo ""
        ;;
    list)
        echo "=== Axis Mundi Registered Directives ==="
        curl -s "$BASE_URL/api/axismundi/directives" | jq . || curl -s "$BASE_URL/api/axismundi/directives"
        echo ""
        ;;
    pending)
        echo "=== Pending [EXECUTE] Directives (Queued for Agent) ==="
        curl -s "$BASE_URL/api/axismundi/directives/pending" | jq . || curl -s "$BASE_URL/api/axismundi/directives/pending"
        echo ""
        ;;
    complete)
        ID="$2"
        LOG="$3"
        if [ -z "$ID" ]; then
            echo "Usage: bash scripts/axismundi.sh complete <directive_id> \"<execution_log>\""
            exit 1
        fi
        curl -s -X POST "$BASE_URL/api/axismundi/directives/$ID/status" \
            -H "Content-Type: application/json" \
            -d "{\"status\":\"COMPLETED\",\"execution_log\":\"$LOG\"}" | jq . || true
        echo ""
        ;;
    *)
        echo "Axis Mundi Amra Core CLI"
        echo "Usage:"
        echo "  bash scripts/axismundi.sh send \"<note_text>\""
        echo "  bash scripts/axismundi.sh list"
        echo "  bash scripts/axismundi.sh pending"
        echo "  bash scripts/axismundi.sh complete <id> \"<log>\""
        ;;
esac