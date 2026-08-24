#!/bin/bash
# file: scripts/deploy.sh
# description: Runs pre-flight verification tests and syncs compiled static assets to GCS.

set -euo pipefail

BUCKET="gs://echosh-labs.com"
PROJECT_DIR="$(pwd)"

echo "=========================================================="
echo " 🚀 Deploying Mercury Dasha Dossier to Root GCS"
echo "=========================================================="

cd "$PROJECT_DIR"

echo "🧪 Running full pre-flight verification & test suite..."
bash scripts/verify.sh

echo "☁️ Syncing static artifacts to $BUCKET (and deleting legacy files)..."
gcloud storage rsync ./out $BUCKET --recursive --delete-unmatched-destination-objects

echo "⚡ Applying Cache-Control headers for HTML entry points..."
gcloud storage objects update $BUCKET/index.html --cache-control="no-store, no-cache, must-revalidate" || true
gcloud storage objects update $BUCKET/compendium.html --cache-control="no-store, no-cache, must-revalidate" || true
gcloud storage objects update $BUCKET/foundations.html --cache-control="no-store, no-cache, must-revalidate" || true
gcloud storage objects update $BUCKET/axis-mundi.html --cache-control="no-store, no-cache, must-revalidate" || true
gcloud storage objects update $BUCKET/echosh.html --cache-control="no-store, no-cache, must-revalidate" || true

echo "=========================================================="
echo " ✅ Production Deployment complete!"
echo " 🌐 Live at: https://echosh-labs.com"
echo "=========================================================="
