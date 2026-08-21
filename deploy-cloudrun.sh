#!/bin/bash
# file: deploy-cloudrun.sh
# description: Builds container image via Cloud Build and deploys Mercury Dasha to Cloud Run.

set -euo pipefail

# Configuration
PROJECT_ID="${GCP_PROJECT:-amra-core}"
REGION="${GCP_REGION:-northamerica-northeast1}"
REPO_NAME="${ARTIFACT_REPO:-axis-repo}"
SERVICE_NAME="${SERVICE_NAME:-echosh-labs}"
IMAGE_NAME="mercury-dasha"
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}:latest"

echo "=========================================================="
echo "?? Deploying Mercury Dasha (with Archive) to Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo "Service: $SERVICE_NAME"
echo "Image:   $IMAGE_URI"
echo "=========================================================="

# 1. Check or Create Artifact Registry Repository
echo "?? Checking for Artifact Registry repository '$REPO_NAME'..."
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION --project=$PROJECT_ID >/dev/null 2>&1; then
    echo "Creating repository '$REPO_NAME'..."
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker repository for echoSH and Mercury Dasha images" \
        --project=$PROJECT_ID
else
    echo "Repository '$REPO_NAME' exists."
fi

# 2. Build and Push Image using Google Cloud Build
echo "?? Building and pushing image via Google Cloud Build..."
gcloud builds submit --tag $IMAGE_URI --project $PROJECT_ID

# 3. Deploy to Cloud Run (Scale-to-zero for true $0.00 / month cost)
echo "? Deploying to Cloud Run service '$SERVICE_NAME'..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_URI \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --memory=256Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=1 \
    --concurrency=80 \
    --port=8080

echo "=========================================================="
echo "? Deployment successful!"
echo "Live service URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format 'value(status.url)'
echo "=========================================================="