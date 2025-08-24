#!/bin/bash

# TenderMatch AI - Google Cloud Deployment Script
# This script automates the deployment process to Google Cloud Platform

set -e  # Exit on any error

# Configuration
PROJECT_ID="${PROJECT_ID:-}"  # Use environment variable if set, otherwise empty
REGION="us-central1"
FRONTEND_SERVICE="tendermatch-frontend"
BACKEND_SERVICE="tendermatch-backend"

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

# Check if gcloud CLI is installed
check_gcloud() {
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
}

# Check if project ID is set
check_project_id() {
    if [ -z "$PROJECT_ID" ]; then
        print_error "Please set PROJECT_ID in this script or pass it as an environment variable."
        exit 1
    fi
}

# Enable required APIs
enable_apis() {
    print_status "Enabling required Google Cloud APIs..."
    
    apis=(
        "cloudbuild.googleapis.com"
        "run.googleapis.com"
        "firestore.googleapis.com"
        "containerregistry.googleapis.com"
        "artifactregistry.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        print_status "Enabling $api..."
        gcloud services enable "$api" --project="$PROJECT_ID"
    done
    
    print_success "All required APIs enabled"
}

# Set up Firestore database
setup_firestore() {
    print_status "Setting up Firestore database..."
    
    # Check if Firestore database already exists
    if gcloud firestore databases describe --database="(default)" --project="$PROJECT_ID" &> /dev/null; then
        print_warning "Firestore database already exists"
    else
        print_status "Creating Firestore database..."
        gcloud firestore databases create --database="(default)" --location="$REGION" --project="$PROJECT_ID"
        print_success "Firestore database created"
    fi
}

# Set up Artifact Registry repository
setup_artifact_registry() {
    print_status "Setting up Artifact Registry repository..."
    
    REPO_NAME="tendermatch"
    
    # Check if repository already exists
    if gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" --project="$PROJECT_ID" &> /dev/null; then
        print_warning "Artifact Registry repository already exists"
    else
        print_status "Creating Artifact Registry repository..."
        gcloud artifacts repositories create "$REPO_NAME" \
            --repository-format=docker \
            --location="$REGION" \
            --description="Docker repository for TenderMatch AI application images" \
            --project="$PROJECT_ID"
        print_success "Artifact Registry repository created"
    fi
    
    # Configure Docker authentication
    print_status "Configuring Docker authentication..."
    gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet --project="$PROJECT_ID"
    print_success "Docker authentication configured"
}

# Build and deploy using Cloud Build
deploy_with_cloud_build() {
    print_status "Starting Cloud Build deployment..."
    
    # Update frontend environment variables
    print_status "Updating frontend environment variables..."
    
    # Get the backend service URL (will be available after first deployment)
    BACKEND_URL="https://${BACKEND_SERVICE}-$(echo $PROJECT_ID | tr ':' '-' | tr '.' '-')-uc.a.run.app"
    
    # Update frontend .env file
    cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=$BACKEND_URL
REACT_APP_API_VERSION=v1
REACT_APP_ENVIRONMENT=production
EOF
    
    print_status "Submitting build to Cloud Build..."
    gcloud builds submit --config=cloudbuild.yaml --project="$PROJECT_ID"
    
    print_success "Deployment completed successfully!"
}

# Get service URLs
get_service_urls() {
    print_status "Getting service URLs..."
    
    BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" --region="$REGION" --project="$PROJECT_ID" --format="value(status.url)" 2>/dev/null || echo "Not deployed")
    FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" --region="$REGION" --project="$PROJECT_ID" --format="value(status.url)" 2>/dev/null || echo "Not deployed")
    
    echo ""
    echo "==================================="
    echo "           SERVICE URLS            "
    echo "==================================="
    echo "Frontend:  $FRONTEND_URL"
    echo "Backend:   $BACKEND_URL"
    echo "==================================="
    echo ""
}

# Create service account and set up permissions
setup_service_account() {
    print_status "Setting up service account..."
    
    SERVICE_ACCOUNT="tendermatch-app@${PROJECT_ID}.iam.gserviceaccount.com"
    
    # Create service account if it doesn't exist
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
}

# Main deployment function
main() {
    print_status "Starting TenderMatch AI deployment to Google Cloud..."
    
    # Check prerequisites
    check_gcloud
    check_project_id
    
    # Set the project
    print_status "Setting project to $PROJECT_ID..."
    gcloud config set project "$PROJECT_ID"
    
    # Enable APIs
    enable_apis
    
    # Set up service account
    setup_service_account
    
    # Set up Firestore
    setup_firestore
    
    # Set up Artifact Registry
    setup_artifact_registry
    
    # Deploy with Cloud Build
    deploy_with_cloud_build
    
    # Get service URLs
    get_service_urls
    
    print_success "TenderMatch AI has been successfully deployed to Google Cloud!"
    print_status "You can now access your application using the URLs above."
}

# Help function
show_help() {
    echo "TenderMatch AI - Google Cloud Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Environment Variables:"
    echo "  PROJECT_ID    Your Google Cloud Project ID (required)"
    echo ""
    echo "Options:"
    echo "  -h, --help    Show this help message"
    echo "  urls          Show current service URLs"
    echo ""
    echo "Examples:"
    echo "  PROJECT_ID=my-project-id $0"
    echo "  $0 urls"
}

# Handle command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    urls)
        check_gcloud
        check_project_id
        get_service_urls
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac