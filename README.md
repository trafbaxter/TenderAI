# TenderAI Frontend - Google Cloud Deployment

A React-based frontend application for intelligent tender discovery and management, optimized for Google Cloud deployment.

## 🚀 Features

- **Modern React Architecture**: Built with React 18, Vite, and Tailwind CSS
- **Intelligent Dashboard**: Real-time tender matching and analytics
- **Portfolio Management**: Track capabilities and project history
- **AI Integrations**: Support for multiple AI model providers
- **Responsive Design**: Works seamlessly across all device sizes
- **Cloud-Optimized**: Ready for Google Cloud Run deployment

## 🏗️ Architecture

```
TenderAI Frontend
├── React 18 + Vite
├── Tailwind CSS + shadcn/ui
├── React Router for navigation
├── Lucide React icons
└── Cloud-optimized Nginx serving
```

## 📦 Google Cloud Deployment

### Prerequisites

1. **Google Cloud SDK** installed and configured
2. **Docker** installed locally
3. **Project setup** in Google Cloud Console
4. **APIs enabled**: Cloud Run, Cloud Build, Container Registry

### Quick Deploy

1. **Set your Google Cloud project:**
   ```bash
   export PROJECT_ID=your-project-id
   gcloud config set project $PROJECT_ID
   ```

2. **Enable required APIs:**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **Deploy using Cloud Build:**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

### Manual Docker Build & Deploy

1. **Build the Docker image:**
   ```bash
   docker build -t gcr.io/$PROJECT_ID/tenderai-frontend .
   ```

2. **Push to Google Container Registry:**
   ```bash
   docker push gcr.io/$PROJECT_ID/tenderai-frontend
   ```

3. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy tenderai-frontend \
     --image gcr.io/$PROJECT_ID/tenderai-frontend \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --port 8080 \
     --memory 512Mi \
     --cpu 1
   ```

## 🔧 Local Development

1. **Install dependencies:**
   ```bash
   cd frontend
   yarn install
   ```

2. **Start development server:**
   ```bash
   yarn dev
   ```

3. **Build for production:**
   ```bash
   yarn build
   ```

## 🌐 Production Configuration

### Environment Variables

- `NODE_ENV=production` (automatically set in Cloud Run)

### Nginx Configuration

- **Port**: 8080 (Google Cloud Run requirement)
- **Health Check**: `/healthz` endpoint
- **SPA Support**: Client-side routing enabled
- **Compression**: Gzip enabled for static assets
- **Security Headers**: Standard security headers applied
- **Caching**: Optimized cache headers for static assets

### Resource Limits

- **Memory**: 512Mi
- **CPU**: 1 vCPU
- **Concurrency**: 80 requests per instance
- **Timeout**: 300 seconds
- **Scaling**: 0-10 instances (auto-scaling)

## 📊 Monitoring & Health Checks

- **Health Endpoint**: `GET /healthz`
- **Liveness Probe**: Every 30 seconds
- **Readiness Probe**: Every 10 seconds
- **Logging**: Structured JSON logs via Cloud Logging

## 🛡️ Security Features

- **Non-root container**: Runs as nginx user (UID 1001)
- **Security headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Hidden file protection**: Denies access to dotfiles
- **Minimal attack surface**: Alpine-based multi-stage build

## 📝 Application Features

### Dashboard
- Real-time tender statistics
- High-match opportunity alerts
- Agent activity monitoring
- Portfolio summary

### Integrations (Planned)
- AI model connections (OpenAI, Claude, Gemini)
- Database integrations
- Communication platforms
- Project management tools

### Analysis Tools (Planned)
- AI-powered tender analysis
- Risk assessment
- Bid response generation
- Technical requirement extraction

## 🔄 CI/CD Pipeline

The included `cloudbuild.yaml` provides:

1. **Automated builds** on code changes
2. **Multi-stage Docker builds** for optimization
3. **Automatic deployment** to Cloud Run
4. **Container registry** management
5. **Blue-green deployments** with traffic splitting

## 💡 Cost Optimization

- **Pay-per-use**: Cloud Run charges only for actual usage
- **Auto-scaling**: Scales to zero when not in use
- **Efficient caching**: Reduces bandwidth and improves performance
- **Optimized builds**: Multi-stage Docker builds minimize image size

## 🔗 URLs After Deployment

After successful deployment, your application will be available at:
- **Cloud Run URL**: `https://tenderai-frontend-[hash]-uc.a.run.app`
- **Health Check**: `https://your-url/healthz`

## 📞 Support

For deployment issues or questions:
1. Check Cloud Run logs: `gcloud logs read --service=tenderai-frontend`
2. Verify health checks: `curl https://your-url/healthz`
3. Monitor in Google Cloud Console

---

**Note**: This frontend is designed to work with a backend API. Update the API endpoints in the entity classes when connecting to your backend services.

## 🛠️ Troubleshooting

### Common Issues

#### Dockerfile Parse Error
If you encounter `unknown instruction: SERVER` error, ensure you're using the corrected Dockerfile that properly copies the nginx.conf file instead of using heredoc syntax.

#### Build Verification
Run the verification script to check all components:
```bash
./verify-build.sh
```

#### Cloud Build Failures
- Verify all required files are present: `Dockerfile`, `nginx.conf`, `frontend/package.json`
- Check that the build completes locally first
- Ensure the GitHub repository has the latest changes committed