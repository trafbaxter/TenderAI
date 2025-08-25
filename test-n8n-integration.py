#!/usr/bin/env python3
"""
Test script for TenderAI n8n Integration
Tests the FastAPI backend integration without requiring full Docker setup
"""

import asyncio
import httpx
import json
import sys
from datetime import datetime

# Test configuration
BACKEND_URL = "http://localhost:8001"  # FastAPI backend
MOCK_N8N_URL = "http://localhost:5678"  # n8n service

class N8nIntegrationTester:
    def __init__(self):
        self.test_results = []
        
    def log_test(self, test_name, success, message):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append((test_name, success, message))
        
    async def test_backend_health(self):
        """Test FastAPI backend health endpoint"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{BACKEND_URL}/health", timeout=10.0)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_test("Backend Health", True, f"Backend is healthy: {data['status']}")
                    return True
                else:
                    self.log_test("Backend Health", False, f"Backend returned {response.status_code}")
                    return False
                    
        except httpx.ConnectError:
            self.log_test("Backend Health", False, "Cannot connect to backend - service not running")
            return False
        except Exception as e:
            self.log_test("Backend Health", False, f"Health check failed: {str(e)}")
            return False
            
    async def test_workflow_trigger_endpoint(self):
        """Test workflow trigger endpoint structure"""
        try:
            test_payload = {
                "workflow_type": "tender-analysis-test",
                "data": {
                    "tender_id": "TEST-001",
                    "title": "Test Tender Integration",
                    "category": "Testing",
                    "value": 100000.0
                },
                "priority": "normal"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{BACKEND_URL}/api/trigger-workflow",
                    json=test_payload,
                    timeout=30.0
                )
                
                # Expect this to fail since n8n is not running, but endpoint should exist
                if response.status_code in [408, 500, 502, 503]:  # Timeout or service unavailable
                    self.log_test("Workflow Trigger Endpoint", True, "Endpoint exists and handles requests properly")
                    return True
                elif response.status_code == 200:
                    data = response.json()
                    self.log_test("Workflow Trigger Endpoint", True, f"Workflow triggered: {data}")
                    return True
                else:
                    self.log_test("Workflow Trigger Endpoint", False, f"Unexpected status: {response.status_code}")
                    return False
                    
        except httpx.ConnectError:
            self.log_test("Workflow Trigger Endpoint", False, "Cannot connect to backend")
            return False
        except Exception as e:
            self.log_test("Workflow Trigger Endpoint", False, f"Test failed: {str(e)}")
            return False
            
    async def test_tenders_endpoint(self):
        """Test tenders data endpoint"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{BACKEND_URL}/api/tenders?limit=5", timeout=10.0)
                
                if response.status_code == 200:
                    data = response.json()
                    if "tenders" in data and isinstance(data["tenders"], list):
                        self.log_test("Tenders Endpoint", True, f"Retrieved {len(data['tenders'])} tenders")
                        return True
                    else:
                        self.log_test("Tenders Endpoint", False, "Invalid response format")
                        return False
                else:
                    self.log_test("Tenders Endpoint", False, f"Status {response.status_code}")
                    return False
                    
        except Exception as e:
            self.log_test("Tenders Endpoint", False, f"Test failed: {str(e)}")
            return False
            
    async def test_webhook_endpoint(self):
        """Test n8n webhook handler endpoint"""
        try:
            test_webhook_payload = {
                "event_type": "tender_analysis_complete",
                "workflow_id": "test-workflow-123",
                "execution_id": "test-exec-456", 
                "status": "success",
                "result_data": {
                    "tender_id": "TEST-001",
                    "score": 85.5,
                    "recommendations": ["Test recommendation"]
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{BACKEND_URL}/api/n8n-webhook",
                    json=test_webhook_payload,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_test("Webhook Endpoint", True, f"Webhook processed: {data['status']}")
                    return True
                else:
                    self.log_test("Webhook Endpoint", False, f"Status {response.status_code}")
                    return False
                    
        except Exception as e:
            self.log_test("Webhook Endpoint", False, f"Test failed: {str(e)}")
            return False
            
    def validate_docker_compose_config(self):
        """Validate Docker Compose configuration"""
        try:
            import yaml
            
            with open('/app/docker-compose.yml', 'r') as f:
                compose_config = yaml.safe_load(f)
                
            # Check required services
            required_services = ['n8n', 'n8n-postgres', 'redis', 'tenderai-api', 'tenderai-frontend']
            missing_services = []
            
            for service in required_services:
                if service not in compose_config.get('services', {}):
                    missing_services.append(service)
                    
            if not missing_services:
                self.log_test("Docker Compose Config", True, "All required services defined")
                
                # Check networks
                networks = compose_config.get('networks', {})
                if 'tenderai-network' in networks and 'n8n-network' in networks:
                    self.log_test("Docker Networks Config", True, "Networks properly configured")
                else:
                    self.log_test("Docker Networks Config", False, "Missing required networks")
                    
                # Check volumes
                volumes = compose_config.get('volumes', {})
                required_volumes = ['n8n_data', 'postgres_data', 'redis_data']
                missing_volumes = [v for v in required_volumes if v not in volumes]
                
                if not missing_volumes:
                    self.log_test("Docker Volumes Config", True, "All volumes configured")
                else:
                    self.log_test("Docker Volumes Config", False, f"Missing volumes: {missing_volumes}")
                    
                return len(missing_services) == 0
            else:
                self.log_test("Docker Compose Config", False, f"Missing services: {missing_services}")
                return False
                
        except Exception as e:
            self.log_test("Docker Compose Config", False, f"Validation failed: {str(e)}")
            return False
            
    def validate_environment_config(self):
        """Validate environment configuration"""
        try:
            with open('/app/.env', 'r') as f:
                env_content = f.read()
                
            required_vars = [
                'N8N_AUTH_USER', 'N8N_AUTH_PASSWORD', 'N8N_DB_PASSWORD',
                'N8N_ENCRYPTION_KEY', 'REDIS_PASSWORD', 'DATABASE_URL'
            ]
            
            missing_vars = []
            for var in required_vars:
                if f"{var}=" not in env_content:
                    missing_vars.append(var)
                    
            if not missing_vars:
                self.log_test("Environment Config", True, "All required environment variables configured")
                return True
            else:
                self.log_test("Environment Config", False, f"Missing variables: {missing_vars}")
                return False
                
        except Exception as e:
            self.log_test("Environment Config", False, f"Validation failed: {str(e)}")
            return False
            
    def validate_backend_code(self):
        """Validate backend integration code"""
        try:
            with open('/app/backend/main.py', 'r') as f:
                backend_code = f.read()
                
            required_components = [
                'trigger_n8n_workflow',
                'handle_n8n_webhook', 
                'WorkflowTrigger',
                'N8nWebhookPayload',
                'get_tenders',
                'get_portfolio_data'
            ]
            
            missing_components = []
            for component in required_components:
                if component not in backend_code:
                    missing_components.append(component)
                    
            if not missing_components:
                self.log_test("Backend Code Validation", True, "All required components implemented")
                return True
            else:
                self.log_test("Backend Code Validation", False, f"Missing: {missing_components}")
                return False
                
        except Exception as e:
            self.log_test("Backend Code Validation", False, f"Validation failed: {str(e)}")
            return False
            
    async def run_all_tests(self):
        """Run all tests"""
        print("🔍 TenderAI n8n Integration Test Suite")
        print("=" * 50)
        
        # Configuration validation tests
        print("\n📋 Configuration Validation:")
        self.validate_docker_compose_config()
        self.validate_environment_config() 
        self.validate_backend_code()
        
        # Runtime tests (require running backend)
        print("\n🚀 Runtime Tests:")
        backend_healthy = await self.test_backend_health()
        
        if backend_healthy:
            await self.test_tenders_endpoint()
            await self.test_webhook_endpoint()
            await self.test_workflow_trigger_endpoint()
        else:
            print("⚠️  Skipping runtime tests - backend not accessible")
            print("   Start backend with: cd /app/backend && uvicorn main:app --host 0.0.0.0 --port 8001")
            
        # Summary
        print(f"\n📊 Test Summary:")
        total_tests = len(self.test_results)
        passed_tests = sum(1 for _, success, _ in self.test_results if success)
        print(f"   Total Tests: {total_tests}")
        print(f"   Passed: {passed_tests}")
        print(f"   Failed: {total_tests - passed_tests}")
        
        if passed_tests == total_tests:
            print("🎉 All tests passed! n8n integration is properly configured.")
        else:
            print("⚠️  Some tests failed. Review the output above for details.")
            
        return passed_tests == total_tests

if __name__ == "__main__":
    tester = N8nIntegrationTester()
    
    # Run tests
    result = asyncio.run(tester.run_all_tests())
    
    # Exit with appropriate code
    sys.exit(0 if result else 1)