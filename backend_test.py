#!/usr/bin/env python3
"""
Comprehensive Backend Testing for TenderMatch AI FastAPI Application
Tests all CRUD operations and API endpoints
"""

import requests
import json
import sys
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
import uuid

# Configuration
BASE_URL = "http://localhost:8002"
API_BASE = f"{BASE_URL}/api"

class TenderMatchAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
        self.created_resources = {
            'agent_configs': [],
            'tenders': [],
            'portfolio': [],
            'meetings': []
        }

    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'response_data': response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def test_health_endpoints(self):
        """Test health and status endpoints"""
        print("=== Testing Health and Status Endpoints ===")
        
        # Test root endpoint
        try:
            response = self.session.get(BASE_URL)
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "TenderMatch AI API" in data["message"]:
                    self.log_test("GET / (root endpoint)", True, f"Status: {response.status_code}, Message: {data.get('message')}")
                else:
                    self.log_test("GET / (root endpoint)", False, f"Unexpected response format", data)
            else:
                self.log_test("GET / (root endpoint)", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET / (root endpoint)", False, f"Exception: {str(e)}")

        # Test health endpoint
        try:
            response = self.session.get(f"{BASE_URL}/health")
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_test("GET /health", True, f"Status: {response.status_code}, Health: {data.get('status')}")
                else:
                    self.log_test("GET /health", False, f"Unexpected health status", data)
            else:
                self.log_test("GET /health", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /health", False, f"Exception: {str(e)}")

    def test_agent_config_endpoints(self):
        """Test Agent Config CRUD operations"""
        print("=== Testing Agent Config Endpoints ===")
        
        # Test data for agent config
        agent_config_data = {
            "search_keywords": ["construction", "infrastructure", "building"],
            "preferred_categories": ["construction", "consulting"],
            "min_budget": 50000.0,
            "max_budget": 500000.0,
            "preferred_locations": ["New York", "California", "Texas"],
            "scraping_frequency": "daily",
            "minimum_match_score": 75.0
        }

        # Test POST /api/agent-config
        try:
            response = self.session.post(f"{API_BASE}/agent-config", json=agent_config_data)
            if response.status_code == 200:
                data = response.json()
                if "id" in data:
                    self.created_resources['agent_configs'].append(data["id"])
                    self.log_test("POST /api/agent-config", True, f"Created config with ID: {data['id']}")
                    config_id = data["id"]
                else:
                    self.log_test("POST /api/agent-config", False, "No ID in response", data)
                    config_id = None
            else:
                self.log_test("POST /api/agent-config", False, f"Status: {response.status_code}", response.text)
                config_id = None
        except Exception as e:
            self.log_test("POST /api/agent-config", False, f"Exception: {str(e)}")
            config_id = None

        # Test GET /api/agent-config (list all)
        try:
            response = self.session.get(f"{API_BASE}/agent-config")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/agent-config (list)", True, f"Retrieved {len(data)} configs")
                else:
                    self.log_test("GET /api/agent-config (list)", False, "Response is not a list", data)
            else:
                self.log_test("GET /api/agent-config (list)", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /api/agent-config (list)", False, f"Exception: {str(e)}")

        # Test GET /api/agent-config/{id} (get specific)
        if config_id:
            try:
                response = self.session.get(f"{API_BASE}/agent-config/{config_id}")
                if response.status_code == 200:
                    data = response.json()
                    if data.get("id") == config_id:
                        self.log_test("GET /api/agent-config/{id}", True, f"Retrieved config {config_id}")
                    else:
                        self.log_test("GET /api/agent-config/{id}", False, "ID mismatch", data)
                else:
                    self.log_test("GET /api/agent-config/{id}", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_test("GET /api/agent-config/{id}", False, f"Exception: {str(e)}")

    def test_tender_endpoints(self):
        """Test Tender CRUD operations"""
        print("=== Testing Tender Endpoints ===")
        
        # Test data for tender
        tender_data = {
            "title": "Smart City Infrastructure Development",
            "description": "Comprehensive smart city infrastructure project including IoT sensors, traffic management systems, and public WiFi deployment across downtown area.",
            "organization": "Metropolitan City Council",
            "category": "construction",
            "budget_min": 2000000.0,
            "budget_max": 5000000.0,
            "deadline": (date.today() + timedelta(days=60)).isoformat(),
            "location": "Downtown Metropolitan Area",
            "requirements": [
                "Experience with IoT implementations",
                "Traffic management system expertise",
                "Public infrastructure projects",
                "5+ years in smart city solutions"
            ],
            "source_url": "https://city.gov/tenders/smart-infrastructure-2024",
            "match_score": 85.5,
            "matched_portfolio_items": [],
            "status": "active"
        }

        # Test POST /api/tenders
        try:
            response = self.session.post(f"{API_BASE}/tenders", json=tender_data)
            if response.status_code == 200:
                data = response.json()
                if "id" in data:
                    self.created_resources['tenders'].append(data["id"])
                    self.log_test("POST /api/tenders", True, f"Created tender with ID: {data['id']}")
                    tender_id = data["id"]
                else:
                    self.log_test("POST /api/tenders", False, "No ID in response", data)
                    tender_id = None
            else:
                self.log_test("POST /api/tenders", False, f"Status: {response.status_code}", response.text)
                tender_id = None
        except Exception as e:
            self.log_test("POST /api/tenders", False, f"Exception: {str(e)}")
            tender_id = None

        # Test GET /api/tenders (list all)
        try:
            response = self.session.get(f"{API_BASE}/tenders")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/tenders (list)", True, f"Retrieved {len(data)} tenders")
                else:
                    self.log_test("GET /api/tenders (list)", False, "Response is not a list", data)
            else:
                self.log_test("GET /api/tenders (list)", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /api/tenders (list)", False, f"Exception: {str(e)}")

        # Test GET /api/tenders with filters
        try:
            response = self.session.get(f"{API_BASE}/tenders?status=active&min_match_score=80")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/tenders (with filters)", True, f"Retrieved {len(data)} filtered tenders")
                else:
                    self.log_test("GET /api/tenders (with filters)", False, "Response is not a list", data)
            else:
                self.log_test("GET /api/tenders (with filters)", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /api/tenders (with filters)", False, f"Exception: {str(e)}")

        # Test GET /api/tenders/{id}
        if tender_id:
            try:
                response = self.session.get(f"{API_BASE}/tenders/{tender_id}")
                if response.status_code == 200:
                    data = response.json()
                    if data.get("id") == tender_id:
                        self.log_test("GET /api/tenders/{id}", True, f"Retrieved tender {tender_id}")
                    else:
                        self.log_test("GET /api/tenders/{id}", False, "ID mismatch", data)
                else:
                    self.log_test("GET /api/tenders/{id}", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_test("GET /api/tenders/{id}", False, f"Exception: {str(e)}")

        # Test PUT /api/tenders/{id}
        if tender_id:
            updated_tender_data = tender_data.copy()
            updated_tender_data["status"] = "interested"
            updated_tender_data["match_score"] = 90.0
            
            try:
                response = self.session.put(f"{API_BASE}/tenders/{tender_id}", json=updated_tender_data)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "interested":
                        self.log_test("PUT /api/tenders/{id}", True, f"Updated tender {tender_id}")
                    else:
                        self.log_test("PUT /api/tenders/{id}", False, "Update not reflected", data)
                else:
                    self.log_test("PUT /api/tenders/{id}", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_test("PUT /api/tenders/{id}", False, f"Exception: {str(e)}")

    def test_portfolio_endpoints(self):
        """Test Portfolio CRUD operations"""
        print("=== Testing Portfolio Endpoints ===")
        
        # Test data for portfolio
        portfolio_data = {
            "title": "Enterprise Cloud Migration Project",
            "description": "Successfully migrated a Fortune 500 company's entire infrastructure to Google Cloud Platform, including 200+ applications, databases, and microservices with zero downtime.",
            "category": "technology",
            "tags": ["cloud-migration", "gcp", "enterprise", "microservices", "zero-downtime"],
            "project_value": 1500000.0,
            "completion_date": (date.today() - timedelta(days=90)).isoformat(),
            "client_name": "TechCorp Industries",
            "status": "completed"
        }

        # Test POST /api/portfolio
        try:
            response = self.session.post(f"{API_BASE}/portfolio", json=portfolio_data)
            if response.status_code == 200:
                data = response.json()
                if "id" in data:
                    self.created_resources['portfolio'].append(data["id"])
                    self.log_test("POST /api/portfolio", True, f"Created portfolio item with ID: {data['id']}")
                    portfolio_id = data["id"]
                else:
                    self.log_test("POST /api/portfolio", False, "No ID in response", data)
                    portfolio_id = None
            else:
                self.log_test("POST /api/portfolio", False, f"Status: {response.status_code}", response.text)
                portfolio_id = None
        except Exception as e:
            self.log_test("POST /api/portfolio", False, f"Exception: {str(e)}")
            portfolio_id = None

        # Test GET /api/portfolio (list all)
        try:
            response = self.session.get(f"{API_BASE}/portfolio")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/portfolio (list)", True, f"Retrieved {len(data)} portfolio items")
                else:
                    self.log_test("GET /api/portfolio (list)", False, "Response is not a list", data)
            else:
                self.log_test("GET /api/portfolio (list)", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /api/portfolio (list)", False, f"Exception: {str(e)}")

        # Test GET /api/portfolio with filters
        try:
            response = self.session.get(f"{API_BASE}/portfolio?category=technology&status=completed")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/portfolio (with filters)", True, f"Retrieved {len(data)} filtered portfolio items")
                else:
                    self.log_test("GET /api/portfolio (with filters)", False, "Response is not a list", data)
            else:
                self.log_test("GET /api/portfolio (with filters)", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /api/portfolio (with filters)", False, f"Exception: {str(e)}")

        # Test GET /api/portfolio/{id}
        if portfolio_id:
            try:
                response = self.session.get(f"{API_BASE}/portfolio/{portfolio_id}")
                if response.status_code == 200:
                    data = response.json()
                    if data.get("id") == portfolio_id:
                        self.log_test("GET /api/portfolio/{id}", True, f"Retrieved portfolio item {portfolio_id}")
                    else:
                        self.log_test("GET /api/portfolio/{id}", False, "ID mismatch", data)
                else:
                    self.log_test("GET /api/portfolio/{id}", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_test("GET /api/portfolio/{id}", False, f"Exception: {str(e)}")

        # Test PUT /api/portfolio/{id}
        if portfolio_id:
            updated_portfolio_data = portfolio_data.copy()
            updated_portfolio_data["project_value"] = 1750000.0
            updated_portfolio_data["tags"].append("award-winning")
            
            try:
                response = self.session.put(f"{API_BASE}/portfolio/{portfolio_id}", json=updated_portfolio_data)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("project_value") == 1750000.0:
                        self.log_test("PUT /api/portfolio/{id}", True, f"Updated portfolio item {portfolio_id}")
                    else:
                        self.log_test("PUT /api/portfolio/{id}", False, "Update not reflected", data)
                else:
                    self.log_test("PUT /api/portfolio/{id}", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_test("PUT /api/portfolio/{id}", False, f"Exception: {str(e)}")

        # Test DELETE /api/portfolio/{id}
        if portfolio_id:
            try:
                response = self.session.delete(f"{API_BASE}/portfolio/{portfolio_id}")
                if response.status_code == 200:
                    data = response.json()
                    if "message" in data and "deleted" in data["message"].lower():
                        self.log_test("DELETE /api/portfolio/{id}", True, f"Deleted portfolio item {portfolio_id}")
                        # Remove from created resources since it's deleted
                        if portfolio_id in self.created_resources['portfolio']:
                            self.created_resources['portfolio'].remove(portfolio_id)
                    else:
                        self.log_test("DELETE /api/portfolio/{id}", False, "Unexpected delete response", data)
                else:
                    self.log_test("DELETE /api/portfolio/{id}", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_test("DELETE /api/portfolio/{id}", False, f"Exception: {str(e)}")

    def test_meeting_endpoints(self):
        """Test Meeting CRUD operations"""
        print("=== Testing Meeting Endpoints ===")
        
        # Test data for meeting
        start_time = datetime.now() + timedelta(days=7)
        end_time = start_time + timedelta(hours=1)
        
        meeting_data = {
            "tender_id": self.created_resources['tenders'][0] if self.created_resources['tenders'] else None,
            "title": "Smart City Project Kickoff Meeting",
            "description": "Initial project discussion and requirements gathering for the smart city infrastructure development project.",
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "platform": "zoom",
            "meeting_url": "https://zoom.us/j/1234567890",
            "attendees": [
                "project.manager@city.gov",
                "tech.lead@contractor.com",
                "stakeholder@city.gov"
            ],
            "agenda": "1. Project overview\n2. Technical requirements\n3. Timeline discussion\n4. Next steps",
            "status": "scheduled"
        }

        # Test POST /api/meetings
        try:
            response = self.session.post(f"{API_BASE}/meetings", json=meeting_data)
            if response.status_code == 200:
                data = response.json()
                if "id" in data:
                    self.created_resources['meetings'].append(data["id"])
                    self.log_test("POST /api/meetings", True, f"Created meeting with ID: {data['id']}")
                    meeting_id = data["id"]
                else:
                    self.log_test("POST /api/meetings", False, "No ID in response", data)
                    meeting_id = None
            else:
                self.log_test("POST /api/meetings", False, f"Status: {response.status_code}", response.text)
                meeting_id = None
        except Exception as e:
            self.log_test("POST /api/meetings", False, f"Exception: {str(e)}")
            meeting_id = None

        # Test GET /api/meetings (list all)
        try:
            response = self.session.get(f"{API_BASE}/meetings")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/meetings (list)", True, f"Retrieved {len(data)} meetings")
                else:
                    self.log_test("GET /api/meetings (list)", False, "Response is not a list", data)
            else:
                self.log_test("GET /api/meetings (list)", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET /api/meetings (list)", False, f"Exception: {str(e)}")

        # Test GET /api/meetings with tender_id filter
        if meeting_data["tender_id"]:
            try:
                response = self.session.get(f"{API_BASE}/meetings?tender_id={meeting_data['tender_id']}")
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        self.log_test("GET /api/meetings (with tender_id filter)", True, f"Retrieved {len(data)} meetings for tender")
                    else:
                        self.log_test("GET /api/meetings (with tender_id filter)", False, "Response is not a list", data)
                else:
                    self.log_test("GET /api/meetings (with tender_id filter)", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_test("GET /api/meetings (with tender_id filter)", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting TenderMatch AI Backend API Tests")
        print(f"Testing against: {BASE_URL}")
        print("=" * 60)
        
        self.test_health_endpoints()
        self.test_agent_config_endpoints()
        self.test_tender_endpoints()
        self.test_portfolio_endpoints()
        self.test_meeting_endpoints()
        
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        print("\n📊 CREATED RESOURCES:")
        for resource_type, ids in self.created_resources.items():
            if ids:
                print(f"  - {resource_type}: {len(ids)} items")
        
        print("\n" + "=" * 60)

if __name__ == "__main__":
    tester = TenderMatchAPITester()
    tester.run_all_tests()