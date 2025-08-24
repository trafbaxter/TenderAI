# Artifact Registry Setup Guide

## Current Issue
The Cloud Build deployment is failing because the `tendermatch` Artifact Registry repository doesn't exist in `us-central1`. This repository is required to store the Docker images before deploying to Cloud Run.

**Error**: `name unknown: Repository "tendermatch" not found`

## Quick Fix Options

### Option 1: Use Updated Deploy Script (Recommended)
The deploy script has been updated to automatically create the repository:

```bash
PROJECT_ID=tenderai-469603 ./deploy.sh
```

This will:
- Create the `tendermatch` Artifact Registry repository
- Configure Docker authentication
- Deploy both frontend and backend services

### Option 2: Manual Creation via gcloud CLI
If you prefer to create the repository manually:

```bash
# Set your project ID
export PROJECT_ID=tenderai-469603
export REGION=us-central1

# Create the Artifact Registry repository
gcloud artifacts repositories create tendermatch \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for TenderMatch AI application images" \
    --project=$PROJECT_ID

# Configure Docker authentication
gcloud auth configure-docker ${REGION}-docker.pkg.dev --project=$PROJECT_ID

# Then run the Cloud Build
gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID
```

### Option 3: Use Terraform Infrastructure as Code
Apply the updated terraform configuration:

```bash
cd terraform

# Initialize terraform (first time only)
terraform init

# Plan the changes
terraform plan -var="project_id=tenderai-469603"

# Apply the changes
terraform apply -var="project_id=tenderai-469603"
```

## Verification
After creating the repository, verify it exists:

```bash
gcloud artifacts repositories list --location=us-central1 --project=tenderai-469603
```

You should see the `tendermatch` repository listed.

## Next Steps
Once the repository is created:

1. Run the Cloud Build deployment:
   ```bash
   gcloud builds submit --config=cloudbuild.yaml --project=tenderai-469603
   ```

2. Verify services are deployed:
   ```bash
   gcloud run services list --region=us-central1 --project=tenderai-469603
   ```

3. Test the deployed applications using the provided URLs

## Repository Structure
The `tendermatch` repository will contain:
- `backend:latest` - FastAPI backend image
- `frontend:latest` - React frontend with Nginx image
- Tagged versions with build IDs for each deployment