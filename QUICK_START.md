# 🚀 TenderAI n8n Integration - Quick Start Guide

## Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available

## Quick Start (3 commands)

```bash
# 1. Make the startup script executable and run it
chmod +x start-local.sh
./start-local.sh

# 2. Wait for services to start (about 2-3 minutes on first run)

# 3. Access your application at http://localhost
```

## Manual Start (if script doesn't work)

```bash
# Stop any existing containers
docker-compose down

# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs if something isn't working
docker-compose logs -f
```

## Access Points

Once running, access these URLs in your browser:

- **🌐 Main Application**: http://localhost
- **🔧 n8n Workflow Interface**: http://localhost/n8n
  - Username: `admin`
  - Password: `secure_admin_password`
- **📖 API Documentation**: http://localhost/api/docs
- **📊 Grafana Monitoring**: http://localhost:3001
  - Username: `admin`
  - Password: `grafana_admin_password`

## Troubleshooting

### Error: "no such file or directory: frontend/Dockerfile"
✅ **FIXED** - Dockerfile moved to correct location

### Services won't start
```bash
# Check Docker is running
docker --version

# Reset everything
docker-compose down -v
docker system prune -f
./start-local.sh
```

### Port conflicts (ports already in use)
Edit `.env` file and change ports:
```
FRONTEND_PORT=3000
API_PORT=8000
N8N_PORT=5679
```

### Check service health
```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs n8n
docker-compose logs tenderai-api
docker-compose logs tenderai-frontend

# Check which services are running
docker-compose ps
```

### Reset everything
```bash
docker-compose down -v
docker system prune -f
rm -rf shared-files/* workflows/* credentials/*
./start-local.sh
```

## Testing the Integration

### Test API endpoints
```bash
# Health check
curl http://localhost/api/health

# Get tender data
curl http://localhost/api/tenders?limit=3

# Trigger workflow (will show timeout error if n8n not fully ready - that's normal)
curl -X POST http://localhost/api/trigger-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_type": "tender-analysis",
    "data": {"tender_id": "TEST-001", "title": "Test Tender"},
    "priority": "normal"
  }'
```

### Access n8n Interface
1. Go to http://localhost/n8n
2. Login with `admin` / `secure_admin_password`
3. Import the sample workflow from `/workflows/sample-tender-analysis.json`

## What's Running

Your application now includes:
- ✅ **React Frontend** - Modern UI for tender management
- ✅ **FastAPI Backend** - API with n8n integration
- ✅ **n8n Workflows** - Automation for tender analysis, portfolio management
- ✅ **PostgreSQL** - Database for n8n
- ✅ **Redis** - Caching layer
- ✅ **Nginx** - Reverse proxy
- ✅ **Prometheus** - Metrics collection
- ✅ **Grafana** - Monitoring dashboards

## Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove all data (full reset)
docker-compose down -v
```

---
🎉 **Success!** Your TenderAI application with n8n workflow automation is now running locally!