# TenderAI with n8n Workflow Automation Setup

## Overview
This setup integrates n8n workflow automation platform with the existing TenderAI React frontend application, creating a powerful multi-container architecture for automated tender management and portfolio workflows.

## Architecture
- **Frontend**: React application (Port 8080)
- **Backend**: FastAPI with n8n integration (Port 8001)
- **n8n**: Workflow automation platform (Port 5678)
- **PostgreSQL**: Database for n8n (Internal)
- **Redis**: Caching and session management (Internal)
- **Nginx**: Reverse proxy (Port 80)
- **Prometheus**: Metrics collection (Port 9090)
- **Grafana**: Monitoring dashboards (Port 3001)

## Quick Start

### 1. Environment Setup
Review and update the `.env` file with your specific configuration:

```bash
# Copy the default environment file
cp .env .env.local

# Edit the environment variables
# Pay special attention to:
# - N8N_AUTH_PASSWORD (n8n admin password)
# - Database credentials
# - API keys
```

### 2. Start Services
```bash
# Start all services in development mode
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Access Services
- **Frontend**: http://localhost (via nginx)
- **n8n Interface**: http://localhost/n8n
- **API Documentation**: http://localhost/api/docs
- **Grafana Dashboard**: http://localhost:3001
- **Prometheus**: http://localhost:9090

### 4. Initial n8n Setup
1. Access n8n at http://localhost/n8n
2. Login with credentials from `.env` file
3. Import sample workflows from `/workflows` directory
4. Configure webhook URLs for TenderAI integration

## n8n Integration Features

### Workflow Types
1. **Tender Analysis Workflow** (`tender-analysis`)
   - Automated tender evaluation
   - AI-powered matching
   - Risk assessment
   - Recommendation generation

2. **Portfolio Update Workflow** (`portfolio-update`)
   - Portfolio performance analysis
   - Risk threshold monitoring
   - Automated reporting

3. **Company Capabilities Management** (`capabilities-management`)
   - Skills inventory updates
   - Capability gap analysis
   - Resource allocation optimization

### API Endpoints

#### Trigger Workflows
```bash
POST /api/trigger-workflow
{
  "workflow_type": "tender-analysis",
  "data": {
    "tender_id": "TENDER-001",
    "title": "Software Development Project",
    "category": "IT Services",
    "value": 250000
  },
  "priority": "high",
  "callback_url": "http://localhost:8001/api/callback"
}
```

#### Get Tender Data
```bash
GET /api/tenders?limit=50&category=IT
```

#### Get Portfolio Data
```bash
GET /api/portfolio/{portfolio_id}
```

#### Webhook Handler
```bash
POST /api/n8n-webhook
{
  "event_type": "tender_analysis_complete",
  "workflow_id": "workflow-123",
  "execution_id": "exec-456",
  "status": "success",
  "result_data": {
    "tender_id": "TENDER-001",
    "score": 85.5,
    "recommendations": ["Apply", "Request clarification"]
  }
}
```

## Development Workflow

### Adding New Workflows
1. Create workflow in n8n interface
2. Export workflow JSON
3. Save to `/workflows` directory
4. Test webhook integration with FastAPI backend

### Testing Integration
```bash
# Test workflow trigger
curl -X POST http://localhost/api/trigger-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_type": "tender-analysis",
    "data": {"tender_id": "TEST-001", "title": "Test Tender"},
    "priority": "normal"
  }'

# Check health
curl http://localhost/health
```

### Monitoring
- View metrics in Grafana: http://localhost:3001
- Check Prometheus targets: http://localhost:9090
- Monitor logs: `docker-compose logs -f tenderai-api n8n`

## Production Deployment

### Google Cloud Setup
1. Update environment variables for production
2. Configure Google Secret Manager for sensitive data
3. Deploy using Cloud Build:
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

### Environment Variables for Production
```bash
# Update .env for production
ENVIRONMENT=production
N8N_BASIC_AUTH_ACTIVE=true
DATABASE_URL=postgresql://user:pass@db-host:5432/tenderai
REDIS_PASSWORD=secure_redis_password
GOOGLE_CLOUD_PROJECT=your-project-id
```

## Troubleshooting

### Common Issues
1. **n8n can't connect to database**
   - Check PostgreSQL container status
   - Verify database credentials in environment

2. **Workflow triggers fail**
   - Verify n8n service is healthy
   - Check network connectivity between containers
   - Review API authentication

3. **Frontend can't reach API**
   - Confirm nginx configuration
   - Check container networking
   - Verify service dependencies

### Debug Commands
```bash
# Check container health
docker-compose ps

# View service logs
docker-compose logs n8n
docker-compose logs tenderai-api

# Test internal connectivity
docker-compose exec tenderai-api curl http://n8n:5678/healthz

# Restart services
docker-compose restart n8n tenderai-api
```

## Security Considerations
- Change default passwords in production
- Use Google Secret Manager for sensitive data
- Configure proper network security groups
- Enable HTTPS with proper SSL certificates
- Implement API rate limiting and authentication

## Next Steps
1. Create custom n8n workflows for your specific use cases
2. Set up monitoring and alerting
3. Configure automated backups
4. Implement CI/CD pipelines
5. Scale services based on load requirements