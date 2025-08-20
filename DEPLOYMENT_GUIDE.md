# TenderMatch AI - Google Cloud Deployment Guide

This guide provides step-by-step instructions for deploying TenderMatch AI to Google Cloud Platform.

## 🚀 Deployment Options

Choose one of the following deployment methods:

### Option 1: Automated Deployment (Recommended)

```bash
# 1. Set your project ID
export PROJECT_ID="your-gcp-project-id"

# 2. Run the automated deployment script
chmod +x deploy.sh
PROJECT_ID=$PROJECT_ID ./deploy.sh
```

### Option 2: Manual Step-by-Step Deployment

#### Step 1: Prerequisites Setup

```bash
# Install Google Cloud CLI if not already installed
# Visit: https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Set your project ID
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID

# Enable billing for your project (required)
# Visit: https://console.cloud.google.com/billing
```

#### Step 2: Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

#### Step 3: Create Firestore Database

```bash
# Create Firestore database in native mode
gcloud firestore databases create --database="(default)" --location="us-central1"
```

#### Step 4: Set Up Service Account

```bash
# Create service account
gcloud iam service-accounts create tendermatch-app \
    --display-name="TenderMatch AI Application" \
    --description="Service account for TenderMatch AI"

# Grant Firestore permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:tendermatch-app@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/datastore.user"
```

#### Step 5: Update Configuration

```bash
# Update backend environment variables
# Edit backend/.env and set:
# GOOGLE_CLOUD_PROJECT=your-project-id

# Update frontend environment variables
# Edit frontend/.env and set:
# REACT_APP_BACKEND_URL=https://tendermatch-backend-[hash]-uc.a.run.app
# (You'll get the actual URL after backend deployment)
```

#### Step 6: Deploy with Cloud Build

```bash
# Submit the build
gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID
```

#### Step 7: Get Service URLs

```bash
# Get backend URL
gcloud run services describe tendermatch-backend \
    --region=us-central1 \
    --format="value(status.url)"

# Get frontend URL  
gcloud run services describe tendermatch-frontend \
    --region=us-central1 \
    --format="value(status.url)"
```

#### Step 8: Update Frontend Configuration

```bash
# Update frontend/.env with the actual backend URL
# Then redeploy frontend
gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID
```

## 🔧 Configuration Details

### Required Environment Variables

#### Backend (`backend/.env`)
```env
GOOGLE_CLOUD_PROJECT=your-project-id
API_HOST=0.0.0.0
API_PORT=8001
API_ENVIRONMENT=production
```

#### Frontend (`frontend/.env`)
```env
REACT_APP_BACKEND_URL=https://your-backend-url
REACT_APP_API_VERSION=v1
REACT_APP_ENVIRONMENT=production
```

### Cloud Run Configuration

The application is deployed with the following Cloud Run settings:

#### Backend Service
- **Memory**: 2Gi
- **CPU**: 2
- **Port**: 8001
- **Max Instances**: 10
- **Authentication**: Allow unauthenticated

#### Frontend Service
- **Memory**: 512Mi
- **CPU**: 1
- **Port**: 80
- **Max Instances**: 5
- **Authentication**: Allow unauthenticated

## 🧪 Testing the Deployment

### Health Check Endpoints

```bash
# Test backend health
curl https://your-backend-url/health

# Test frontend
curl https://your-frontend-url/health
```

### API Testing

```bash
# Test API endpoints
curl https://your-backend-url/api/tenders
curl https://your-backend-url/docs  # Swagger UI
```

### Frontend Testing

Visit your frontend URL in a browser to test:
1. Dashboard loads correctly
2. Navigation works
3. API calls are successful (check browser dev tools)

## 🔍 Monitoring and Logging

### View Logs

```bash
# Backend logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=tendermatch-backend" --limit=50

# Frontend logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=tendermatch-frontend" --limit=50

# Build logs
gcloud builds list --limit=10
```

### Monitor Performance

Visit Google Cloud Console:
- **Cloud Run**: Monitor service performance
- **Cloud Build**: View build history
- **Firestore**: Monitor database usage
- **Logging**: View application logs

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures

**Problem**: Cloud Build fails with dependency errors
```bash
# Check build logs
gcloud builds list --limit=5
gcloud builds log [BUILD_ID]
```

**Solution**: 
- Verify all dependencies are listed in requirements.txt/package.json
- Check Dockerfile syntax
- Ensure base images are available

#### 2. Service Won't Start

**Problem**: Cloud Run service fails to start
```bash
# Check service logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=tendermatch-backend" --limit=20
```

**Solutions**:
- Verify environment variables are set correctly
- Check service account has required permissions
- Ensure Firestore database exists
- Verify port configuration (8001 for backend, 80 for frontend)

#### 3. API Connection Issues

**Problem**: Frontend can't connect to backend
- Check CORS configuration in backend
- Verify REACT_APP_BACKEND_URL is correct
- Ensure both services are deployed and running

#### 4. Database Connection Issues

**Problem**: Backend can't connect to Firestore
- Verify GOOGLE_CLOUD_PROJECT environment variable
- Check service account permissions
- Ensure Firestore database is created

#### 5. Permission Denied Errors

```bash
# Check service account permissions
gcloud projects get-iam-policy $PROJECT_ID

# Add missing permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:tendermatch-app@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/datastore.user"
```

### Debugging Commands

```bash
# Service status
gcloud run services list --platform=managed

# Service details
gcloud run services describe tendermatch-backend --region=us-central1

# Recent deployments
gcloud run revisions list --service=tendermatch-backend --region=us-central1

# Test connectivity
curl -I https://your-service-url/health
```

## 🔄 Updates and Redeployment

### Code Updates

```bash
# After making code changes, redeploy with:
gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID
```

### Configuration Updates

```bash
# Update environment variables
gcloud run services update tendermatch-backend \
    --region=us-central1 \
    --set-env-vars="NEW_VAR=value"
```

### Scaling Configuration

```bash
# Update resource limits
gcloud run services update tendermatch-backend \
    --region=us-central1 \
    --memory=4Gi \
    --cpu=4 \
    --max-instances=20
```

## 💰 Cost Optimization

### Monitoring Costs

- Visit [Cloud Billing Console](https://console.cloud.google.com/billing)
- Set up billing alerts
- Monitor Cloud Run usage

### Optimization Tips

1. **Right-size resources**: Start with minimum specs and scale up as needed
2. **Set max instances**: Prevent runaway costs with instance limits
3. **Monitor usage**: Regular review of service metrics
4. **Use regional resources**: Keep services in same region to reduce data transfer costs

## 📊 Next Steps

After successful deployment:

1. **Custom Domain**: Set up custom domain for your services
2. **SSL Certificates**: Configure SSL (automatic with Cloud Run)
3. **CI/CD Pipeline**: Set up GitHub/GitLab integration
4. **Monitoring**: Set up alerts and monitoring dashboards
5. **Backup Strategy**: Implement Firestore backup procedures

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Google Cloud documentation
3. Check service logs for specific error messages
4. Verify all prerequisites are met
5. Open an issue in the project repository

---

**Deployment Complete!** 🎉

Your TenderMatch AI application is now running on Google Cloud Platform with:
- ✅ Scalable containerized services
- ✅ Managed database (Firestore)
- ✅ Automatic HTTPS
- ✅ Built-in monitoring and logging
- ✅ Auto-scaling based on demand