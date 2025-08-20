# TenderMatch AI - Google Cloud Migration

A comprehensive fullstack tender discovery and matching platform built with React frontend, FastAPI backend, and Google Firestore database, deployed on Google Cloud Platform.

## 🏗️ Architecture

- **Frontend**: React 18 with Tailwind CSS, deployed on Cloud Run
- **Backend**: FastAPI with Pydantic models, deployed on Cloud Run
- **Database**: Google Firestore (NoSQL)
- **Hosting**: Google Cloud Run (containerized services)
- **CI/CD**: Google Cloud Build
- **Infrastructure**: Terraform (optional)

## 📁 Project Structure

```
/app/
├── backend/                 # FastAPI backend application
│   ├── server.py           # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile         # Backend container configuration
│   └── .env               # Backend environment variables
├── frontend/               # React frontend application
│   ├── src/               # React source code
│   │   ├── components/    # Reusable UI components
│   │   ├── entities/      # API client and data models
│   │   ├── lib/          # Utility functions
│   │   └── utils/        # Helper functions
│   ├── public/           # Static assets
│   ├── Dockerfile        # Frontend container configuration
│   ├── nginx.conf        # Nginx configuration for production
│   ├── package.json      # Node.js dependencies
│   └── .env              # Frontend environment variables
├── terraform/            # Infrastructure as Code
│   └── main.tf          # Terraform configuration
├── cloudbuild.yaml      # Cloud Build configuration
├── deploy.sh           # Deployment automation script
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Google Cloud Account**: Ensure you have a GCP account and project
2. **Google Cloud CLI**: Install and configure `gcloud` CLI
3. **Docker**: For local development (optional)
4. **Node.js & Yarn**: For frontend development
5. **Python 3.11+**: For backend development

### 1. Clone and Setup

```bash
# Set your Google Cloud Project ID
export PROJECT_ID="your-project-id"

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs (automated in deploy script)
gcloud services enable cloudbuild.googleapis.com run.googleapis.com firestore.googleapis.com
```

### 2. Deploy to Google Cloud

#### Option A: Automated Deployment (Recommended)

```bash
# Make the deployment script executable
chmod +x deploy.sh

# Deploy everything with one command
PROJECT_ID="your-project-id" ./deploy.sh
```

#### Option B: Manual Cloud Build Deployment

```bash
# Update frontend environment with your project ID
# Edit frontend/.env and set REACT_APP_BACKEND_URL

# Submit build to Cloud Build
gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID
```

#### Option C: Local Development

```bash
# Backend setup
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend setup (in another terminal)
cd frontend
yarn install
yarn start
```

### 3. Access Your Application

After deployment, you'll get two URLs:
- **Frontend**: `https://tendermatch-frontend-[hash]-uc.a.run.app`
- **Backend API**: `https://tendermatch-backend-[hash]-uc.a.run.app`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/app/service-account-key.json
API_HOST=0.0.0.0
API_PORT=8001
API_ENVIRONMENT=production
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://your-backend-service-url
REACT_APP_API_VERSION=v1
REACT_APP_ENVIRONMENT=production
```

### Service Account Permissions

The application requires a service account with the following roles:
- `roles/datastore.user` - For Firestore access

## 📊 Features

### Core Functionality
- **Dashboard**: Overview of tender matches and portfolio status
- **Portfolio Management**: Add, edit, and manage your business capabilities
- **Tender Discovery**: AI-powered tender matching and scoring
- **Opportunity Tracking**: Monitor tender status and deadlines
- **Integration Management**: Connect with external services
- **Analysis Tools**: Tender analysis and bid response generation

### Technical Features
- **Responsive Design**: Mobile-first Tailwind CSS interface
- **Real-time Updates**: Live data synchronization
- **Secure API**: FastAPI with proper CORS and validation
- **Scalable Architecture**: Cloud Run auto-scaling
- **Performance Optimized**: Container-based deployment

## 🛠️ Development

### Local Development Setup

1. **Start Backend**:
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

2. **Start Frontend**:
```bash
cd frontend
yarn install
yarn start
```

3. **Access Application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

### Adding New Features

1. **Backend**: Add new endpoints in `server.py`
2. **Frontend**: Create components in `src/components/`
3. **Entities**: Update API client in `src/entities/all.js`

## 🏗️ Infrastructure as Code (Optional)

Use Terraform for infrastructure management:

```bash
cd terraform
terraform init
terraform plan -var="project_id=your-project-id"
terraform apply -var="project_id=your-project-id"
```

## 📝 API Documentation

The FastAPI backend automatically generates interactive API documentation:
- **Swagger UI**: `https://your-backend-url/docs`
- **ReDoc**: `https://your-backend-url/redoc`

### Key Endpoints

- `GET /api/tenders` - List tenders with filtering
- `POST /api/tenders` - Create new tender
- `GET /api/portfolio` - List portfolio items
- `POST /api/portfolio` - Add portfolio item
- `GET /api/agent-config` - Get agent configuration
- `GET /health` - Health check endpoint

## 🔒 Security Considerations

- **CORS**: Configured for production domains
- **Environment Variables**: Sensitive data in environment variables
- **Service Accounts**: Minimal required permissions
- **HTTPS**: All communication over HTTPS in production
- **Input Validation**: Pydantic models for request validation

## 📈 Monitoring and Logging

Google Cloud provides built-in monitoring:
- **Cloud Logging**: Application logs
- **Cloud Monitoring**: Performance metrics
- **Error Reporting**: Automatic error tracking
- **Cloud Trace**: Request tracing

Access via Google Cloud Console:
```
https://console.cloud.google.com/
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Cloud Build logs in GCP Console
   - Verify Dockerfile syntax
   - Ensure all dependencies are listed

2. **Service Not Starting**:
   - Check Cloud Run logs
   - Verify environment variables
   - Check service account permissions

3. **Database Connection Issues**:
   - Ensure Firestore is enabled
   - Verify service account has datastore.user role
   - Check GOOGLE_CLOUD_PROJECT environment variable

### Debugging Commands

```bash
# Check service status
gcloud run services list --platform managed

# View service logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=tendermatch-backend" --limit 50

# Test API endpoints
curl https://your-backend-url/health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the troubleshooting section above
2. Review Google Cloud documentation
3. Check Cloud Build and Cloud Run logs
4. Open an issue in the repository

---

**Happy Deploying!** 🚀