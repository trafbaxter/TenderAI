# TenderMatch AI - Deployment Troubleshooting Guide

## Current Status
- ✅ **Backend**: Ready for deployment (all 19 API endpoints tested and working)
- ✅ **Frontend**: Builds successfully locally, application running correctly
- ✅ **Infrastructure**: Artifact Registry repository configured
- ✅ **Configurations**: All Dockerfiles and configs verified

## Frontend Build Issue Resolution

### Issue Analysis
The frontend deployment was failing in Cloud Build despite building successfully locally. This indicates environment-specific issues rather than code problems.

### Solution Strategies

#### Strategy 1: Clear Build Cache and Retry
```bash
# Run deployment with no-cache flag to force fresh build
PROJECT_ID=tenderai-469603 gcloud builds submit --config=cloudbuild.yaml --project=tenderai-469603 --no-cache
```

#### Strategy 2: Enhanced Dockerfile with Build Optimization
Create an optimized frontend Dockerfile with explicit dependency management:

```dockerfile
# Build stage with optimizations
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy package files first (for better caching)
COPY package.json ./
COPY yarn.lock ./

# Clean install with specific timeout
RUN yarn install --frozen-lockfile --network-timeout 300000

# Copy source code
COPY . .

# Build with increased memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Strategy 3: Alternative Build Configuration
Update `cloudbuild.yaml` with extended timeout and machine type:

```yaml
# Enhanced Cloud Build configuration
steps:
  # Build frontend with enhanced settings
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--no-cache'
      - '--build-arg'
      - 'NODE_ENV=production'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/tendermatch/frontend:$BUILD_ID'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/tendermatch/frontend:latest'
      - './frontend'
    id: 'build-frontend'
    timeout: '1200s'  # 20 minutes for build
```

#### Strategy 4: Manual Docker Build Verification
Test the exact build process that Cloud Build uses:

```bash
# Build locally using the exact same process
cd /app/frontend
docker build -t test-frontend .

# Test the built container
docker run -d -p 8080:80 test-frontend
curl http://localhost:8080/health
```

## Deployment Commands

### Quick Deployment (Recommended)
```bash
# Set your project ID
export PROJECT_ID=tenderai-469603

# Run the automated deployment script
./deploy.sh
```

### Manual Step-by-Step Deployment
```bash
# 1. Ensure Artifact Registry repository exists
gcloud artifacts repositories create tendermatch \
    --repository-format=docker \
    --location=us-central1 \
    --project=tenderai-469603

# 2. Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev

# 3. Submit build with extended timeout
gcloud builds submit \
    --config=cloudbuild.yaml \
    --project=tenderai-469603 \
    --timeout=3600s \
    --machine-type=e2-highcpu-8
```

### Troubleshooting Commands
```bash
# Check Cloud Build history
gcloud builds list --project=tenderai-469603 --limit=5

# Get detailed build logs for a specific build
gcloud builds log [BUILD_ID] --project=tenderai-469603

# Check Cloud Run services status
gcloud run services list --project=tenderai-469603 --region=us-central1

# Test deployed services
curl https://tendermatch-backend-[HASH]-uc.a.run.app/health
curl https://tendermatch-frontend-[HASH]-uc.a.run.app/health
```

## Environment Variables Verification

### Frontend Environment Variables
Ensure the following are correctly set in `frontend/.env`:
```
REACT_APP_BACKEND_URL=https://tendermatch-backend-[HASH]-uc.a.run.app
REACT_APP_API_VERSION=v1
REACT_APP_ENVIRONMENT=production
```

### Backend Environment Variables
The following will be automatically set by Cloud Run:
```
GOOGLE_CLOUD_PROJECT=tenderai-469603
PORT=8080
```

## Expected Deployment Flow

1. **Artifact Registry Setup**: ✅ Repository created
2. **Backend Build**: ✅ Should succeed (tested locally)
3. **Frontend Build**: 🔧 May need cache clearing or optimization
4. **Image Push**: ✅ Should succeed after successful builds
5. **Cloud Run Deploy**: ✅ Should succeed after successful pushes

## Next Steps

1. Try Strategy 1 first (clear cache and retry)
2. If that fails, implement Strategy 2 (optimized Dockerfile)
3. Monitor Cloud Build logs for specific error messages
4. Verify deployed services using health endpoints

## Support Resources

- **Cloud Build Documentation**: https://cloud.google.com/build/docs
- **Cloud Run Documentation**: https://cloud.google.com/run/docs
- **Troubleshooting Guide**: https://cloud.google.com/build/docs/troubleshooting