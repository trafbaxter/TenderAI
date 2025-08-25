#!/bin/bash

# TenderAI Frontend - Google Cloud Deployment Script
# This script builds and deploys the TenderAI React frontend to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${PROJECT_ID:-"your-project-id"}
SERVICE_NAME="tenderai-frontend"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo -e "${BLUE}🚀 TenderAI Frontend Deployment Script${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if PROJECT_ID is set
if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo -e "${RED}❌ Please set your PROJECT_ID environment variable:${NC}"
    echo -e "${YELLOW}   export PROJECT_ID=your-google-cloud-project-id${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "   Project ID: ${GREEN}$PROJECT_ID${NC}"
echo -e "   Service Name: ${GREEN}$SERVICE_NAME${NC}"
echo -e "   Region: ${GREEN}$REGION${NC}"
echo -e "   Image: ${GREEN}$IMAGE_NAME${NC}"
echo ""

# Step 1: Build the application
echo -e "${BLUE}🔨 Step 1: Building React application...${NC}"
cd frontend
yarn install --frozen-lockfile
yarn build
cd ..
echo -e "${GREEN}✅ Build completed${NC}"
echo ""

# Step 2: Build Docker image
echo -e "${BLUE}🐳 Step 2: Building Docker image...${NC}"
docker build -t $IMAGE_NAME:latest .
echo -e "${GREEN}✅ Docker image built${NC}"
echo ""

# Step 3: Push to Google Container Registry
echo -e "${BLUE}📤 Step 3: Pushing to Google Container Registry...${NC}"
docker push $IMAGE_NAME:latest
echo -e "${GREEN}✅ Image pushed to GCR${NC}"
echo ""

# Step 4: Deploy to Cloud Run
echo -e "${BLUE}☁️  Step 4: Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME:latest \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1000m \
    --max-instances 10 \
    --min-instances 0 \
    --concurrency 80 \
    --timeout 300 \
    --set-env-vars NODE_ENV=production

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""

# Get the service URL
echo -e "${BLUE}🌐 Getting service URL...${NC}"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
echo -e "${GREEN}🎉 TenderAI Frontend is now live at: $SERVICE_URL${NC}"
echo ""

# Health check
echo -e "${BLUE}🔍 Running health check...${NC}"
if curl -f "$SERVICE_URL/healthz" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed - service might still be starting${NC}"
fi

echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo -e "   🌐 Application URL: ${GREEN}$SERVICE_URL${NC}"
echo -e "   ❤️  Health Check: ${GREEN}$SERVICE_URL/healthz${NC}"
echo -e "   📊 Logs: ${YELLOW}gcloud logs read --service=$SERVICE_NAME${NC}"
echo -e "   ⚙️  Console: ${YELLOW}https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME${NC}"
echo ""
echo -e "${GREEN}🎊 Deployment completed successfully!${NC}"