#!/bin/bash

# TenderMatch AI - Google Cloud Setup Script
# This script sets up the GCP environment properly for deployment

set -e  # Exit on any error

# Configuration
PROJECT_ID="tenderai-469603"
REGION="us-central1"
REPOSITORY_NAME="tendermatch"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Set the project
print_status "Setting project to $PROJECT_ID..."
gcloud config set project "$PROJECT_ID"

# Enable required APIs
print_status "Enabling required Google Cloud APIs..."
apis=(
    "cloudbuild.googleapis.com"
    "run.googleapis.com"
    "firestore.googleapis.com"
    "artifactregistry.googleapis.com"
)

for api in "${apis[@]}"; do
    print_status "Enabling $api..."
    gcloud services enable "$api" --project="$PROJECT_ID"
done

print_success "All required APIs enabled"

# Create Artifact Registry repository
print_status "Creating Artifact Registry repository..."
gcloud artifacts repositories create "$REPOSITORY_NAME" \
    --repository-format=docker \
    --location="$REGION" \
    --description="TenderMatch AI Docker images" \
    --project="$PROJECT_ID" || print_warning "Repository might already exist"

# Configure Docker authentication
print_status "Configuring Docker authentication..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# Set up Firestore database
print_status "Setting up Firestore database..."
if gcloud firestore databases describe --database="(default)" --project="$PROJECT_ID" &> /dev/null; then
    print_warning "Firestore database already exists"
else
    print_status "Creating Firestore database..."
    gcloud firestore databases create --database="(default)" --location="$REGION" --project="$PROJECT_ID"
    print_success "Firestore database created"
fi

# Create service account
print_status "Setting up service account..."
SERVICE_ACCOUNT="tendermatch-app@${PROJECT_ID}.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe "$SERVICE_ACCOUNT" --project="$PROJECT_ID" &> /dev/null; then
    print_status "Creating service account..."
    gcloud iam service-accounts create tendermatch-app \
        --display-name="TenderMatch AI Application" \
        --description="Service account for TenderMatch AI application" \
        --project="$PROJECT_ID"
else
    print_warning "Service account already exists"
fi

# Grant Firestore permissions
print_status "Granting Firestore permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/datastore.user"

print_success "Service account configured"

# Show current setup
print_status "Current setup:"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Artifact Registry: ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_NAME}"
echo "Service Account: $SERVICE_ACCOUNT"

print_success "GCP environment setup completed!"
print_status "You can now run the deployment using Cloud Build:"
echo ""
echo "gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID"
echo ""