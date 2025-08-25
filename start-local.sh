#!/bin/bash

echo "🚀 Starting TenderAI with n8n Integration locally..."
echo "=================================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker is running"
echo "✅ Docker Compose is available"
echo ""

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p shared-files workflows credentials monitoring/grafana/{dashboards,datasources}

# Stop any existing services
echo "🛑 Stopping any existing services..."
docker-compose down

# Build and start services
echo "🏗️  Building and starting services..."
echo "This may take a few minutes on first run..."
docker-compose up -d

# Wait a moment for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🎉 TenderAI is starting up!"
echo ""
echo "📱 Access your application:"
echo "   🌐 Main App:      http://localhost"
echo "   🔧 n8n Interface: http://localhost/n8n (admin/secure_admin_password)"
echo "   📖 API Docs:      http://localhost/api/docs"
echo "   📊 Grafana:       http://localhost:3001 (admin/grafana_admin_password)"
echo "   📈 Prometheus:    http://localhost:9090"
echo ""
echo "🔍 Check logs with:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services with:"
echo "   docker-compose down"
echo ""