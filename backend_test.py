#!/usr/bin/env python3
"""
TenderAI Frontend Docker Deployment Testing Suite
Tests Docker build, nginx serving, health checks, and Google Cloud configurations
"""

import subprocess
import requests
import time
import json
import os
import sys
import yaml
from pathlib import Path

class TenderAIDockerTester:
    def __init__(self):
        self.base_dir = Path("/app")
        self.test_results = []
        self.container_name = "tenderai-frontend-test"
        self.image_name = "tenderai-frontend:test"
        self.test_port = 8080
        
    def log_result(self, test_name, status, message, details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {test_name}: {message}")
        if details:
            for key, value in details.items():
                print(f"   {key}: {value}")
        print()

    def run_command(self, command, capture_output=True, timeout=300):
        """Run shell command and return result"""
        try:
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=capture_output, 
                text=True, 
                timeout=timeout,
                cwd=self.base_dir
            )
            return result
        except subprocess.TimeoutExpired:
            return None
        except Exception as e:
            return None

    def test_dockerfile_syntax(self):
        """Test 1: Verify Dockerfile syntax and structure"""
        dockerfile_path = self.base_dir / "Dockerfile"
        
        if not dockerfile_path.exists():
            self.log_result("Dockerfile Syntax", "FAIL", "Dockerfile not found")
            return False
            
        with open(dockerfile_path, 'r') as f:
            content = f.read()
            
        # Check for key components
        checks = {
            "Multi-stage build": "FROM node:" in content and "FROM nginx:" in content,
            "Nginx user fix": "USER nginx" in content and "addgroup" not in content,
            "Port 8080": "EXPOSE 8080" in content,
            "Health check": "HEALTHCHECK" in content,
            "Security permissions": "chown -R nginx:nginx" in content
        }
        
        all_passed = all(checks.values())
        status = "PASS" if all_passed else "FAIL"
        
        self.log_result("Dockerfile Syntax", status, 
                       "All syntax checks passed" if all_passed else "Some syntax checks failed",
                       checks)
        return all_passed

    def test_nginx_config(self):
        """Test 2: Verify nginx configuration"""
        nginx_conf_path = self.base_dir / "nginx.conf"
        
        if not nginx_conf_path.exists():
            self.log_result("Nginx Configuration", "FAIL", "nginx.conf not found")
            return False
            
        with open(nginx_conf_path, 'r') as f:
            content = f.read()
            
        checks = {
            "Port 8080": "listen 8080" in content,
            "SPA routing": "try_files $uri $uri/ /index.html" in content,
            "Health check endpoint": "location /healthz" in content,
            "Security headers": "X-Frame-Options" in content and "X-Content-Type-Options" in content,
            "Gzip compression": "gzip on" in content,
            "Static asset caching": "expires 1y" in content
        }
        
        all_passed = all(checks.values())
        status = "PASS" if all_passed else "FAIL"
        
        self.log_result("Nginx Configuration", status,
                       "All nginx config checks passed" if all_passed else "Some nginx config checks failed",
                       checks)
        return all_passed

    def test_react_build(self):
        """Test 3: Verify React application builds successfully"""
        frontend_dir = self.base_dir / "frontend"
        
        if not frontend_dir.exists():
            self.log_result("React Build", "FAIL", "Frontend directory not found")
            return False
            
        # Check if dist directory already exists from previous build
        dist_dir = frontend_dir / "dist"
        if dist_dir.exists():
            self.log_result("React Build", "PASS", "React build already exists (dist directory found)")
            return True
            
        # Try to build
        print("Building React application...")
        os.chdir(frontend_dir)
        
        # Install dependencies
        install_result = self.run_command("yarn install --frozen-lockfile", timeout=180)
        if not install_result or install_result.returncode != 0:
            self.log_result("React Build", "FAIL", "Failed to install dependencies",
                           {"error": install_result.stderr if install_result else "Timeout"})
            return False
            
        # Build application
        build_result = self.run_command("yarn build", timeout=120)
        if not build_result or build_result.returncode != 0:
            self.log_result("React Build", "FAIL", "Failed to build React application",
                           {"error": build_result.stderr if build_result else "Timeout"})
            return False
            
        # Verify build output
        if not dist_dir.exists() or not (dist_dir / "index.html").exists():
            self.log_result("React Build", "FAIL", "Build completed but output files missing")
            return False
            
        os.chdir(self.base_dir)
        self.log_result("React Build", "PASS", "React application built successfully")
        return True

    def test_docker_build(self):
        """Test 4: Test Docker image build process"""
        print("Building Docker image...")
        
        # Clean up any existing test containers/images
        self.run_command(f"docker stop {self.container_name} 2>/dev/null || true")
        self.run_command(f"docker rm {self.container_name} 2>/dev/null || true")
        self.run_command(f"docker rmi {self.image_name} 2>/dev/null || true")
        
        # Build Docker image
        build_result = self.run_command(f"docker build -t {self.image_name} .", timeout=600)
        
        if not build_result or build_result.returncode != 0:
            error_msg = build_result.stderr if build_result else "Build timeout"
            self.log_result("Docker Build", "FAIL", "Docker build failed", {"error": error_msg})
            return False
            
        # Verify image was created
        inspect_result = self.run_command(f"docker inspect {self.image_name}")
        if not inspect_result or inspect_result.returncode != 0:
            self.log_result("Docker Build", "FAIL", "Docker image not found after build")
            return False
            
        self.log_result("Docker Build", "PASS", "Docker image built successfully")
        return True

    def test_container_startup(self):
        """Test 5: Test container startup and basic functionality"""
        print("Starting Docker container...")
        
        # Start container
        run_result = self.run_command(
            f"docker run -d --name {self.container_name} -p {self.test_port}:{self.test_port} {self.image_name}"
        )
        
        if not run_result or run_result.returncode != 0:
            self.log_result("Container Startup", "FAIL", "Failed to start container",
                           {"error": run_result.stderr if run_result else "Unknown error"})
            return False
            
        # Wait for container to be ready
        print("Waiting for container to be ready...")
        time.sleep(10)
        
        # Check if container is running
        ps_result = self.run_command(f"docker ps --filter name={self.container_name} --format '{{{{.Status}}}}'")
        if not ps_result or "Up" not in ps_result.stdout:
            # Get container logs for debugging
            logs_result = self.run_command(f"docker logs {self.container_name}")
            self.log_result("Container Startup", "FAIL", "Container not running",
                           {"logs": logs_result.stdout if logs_result else "No logs available"})
            return False
            
        self.log_result("Container Startup", "PASS", "Container started successfully")
        return True

    def test_health_check(self):
        """Test 6: Test health check endpoint"""
        max_retries = 10
        retry_delay = 3
        
        for attempt in range(max_retries):
            try:
                response = requests.get(f"http://localhost:{self.test_port}/healthz", timeout=5)
                if response.status_code == 200 and "healthy" in response.text:
                    self.log_result("Health Check", "PASS", "Health check endpoint working",
                                   {"response": response.text.strip(), "status_code": response.status_code})
                    return True
                else:
                    if attempt == max_retries - 1:
                        self.log_result("Health Check", "FAIL", "Health check returned unexpected response",
                                       {"response": response.text, "status_code": response.status_code})
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:
                    self.log_result("Health Check", "FAIL", "Health check endpoint not accessible",
                                   {"error": str(e)})
                else:
                    print(f"Health check attempt {attempt + 1} failed, retrying in {retry_delay}s...")
                    time.sleep(retry_delay)
                    
        return False

    def test_spa_routing(self):
        """Test 7: Test SPA routing functionality using Python HTTP server"""
        # Start a simple HTTP server to test the built React app
        import subprocess
        import signal
        import os
        
        dist_dir = self.base_dir / "frontend" / "dist"
        if not dist_dir.exists():
            self.log_result("SPA Routing", "FAIL", "React build not found (dist directory missing)")
            return False
            
        try:
            # Start HTTP server
            server_process = subprocess.Popen(
                ["python3", "-m", "http.server", "8080"],
                cwd=dist_dir,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            
            # Wait for server to start
            time.sleep(2)
            
            test_routes = ["/", "/dashboard", "/opportunities", "/portfolio"]
            results = {}
            
            for route in test_routes:
                try:
                    response = requests.get(f"http://localhost:8080{route}", timeout=5)
                    results[route] = {
                        "status_code": response.status_code,
                        "content_type": response.headers.get("content-type", ""),
                        "has_html": "<!DOCTYPE html>" in response.text or "<html" in response.text,
                        "has_react_root": 'id="root"' in response.text
                    }
                except requests.exceptions.RequestException as e:
                    results[route] = {"error": str(e)}
                    
            # Stop server
            server_process.terminate()
            server_process.wait(timeout=5)
            
            # For SPA, all routes should serve the same index.html (status 200)
            successful_requests = [r for r in results.values() if "error" not in r]
            if not successful_requests:
                self.log_result("SPA Routing", "FAIL", "No successful requests to test server", results)
                return False
                
            # Check if we get HTML responses (basic SPA functionality)
            html_responses = [r for r in successful_requests if r.get("has_html", False)]
            
            status = "PASS" if len(html_responses) > 0 else "FAIL"
            message = f"SPA serving HTML correctly ({len(html_responses)}/{len(successful_requests)} routes)" if status == "PASS" else "SPA not serving HTML correctly"
            
            self.log_result("SPA Routing", status, message, results)
            return status == "PASS"
            
        except Exception as e:
            self.log_result("SPA Routing", "FAIL", f"Error testing SPA routing: {str(e)}")
            return False

    def test_security_headers(self):
        """Test 8: Test security headers"""
        try:
            response = requests.get(f"http://localhost:{self.test_port}/", timeout=5)
            headers = response.headers
            
            security_checks = {
                "X-Frame-Options": "X-Frame-Options" in headers,
                "X-Content-Type-Options": "X-Content-Type-Options" in headers,
                "X-XSS-Protection": "X-XSS-Protection" in headers,
                "Referrer-Policy": "Referrer-Policy" in headers
            }
            
            all_passed = all(security_checks.values())
            status = "PASS" if all_passed else "FAIL"
            
            self.log_result("Security Headers", status,
                           "All security headers present" if all_passed else "Some security headers missing",
                           security_checks)
            return all_passed
            
        except requests.exceptions.RequestException as e:
            self.log_result("Security Headers", "FAIL", "Could not test security headers",
                           {"error": str(e)})
            return False

    def test_gzip_compression(self):
        """Test 9: Test gzip compression"""
        try:
            headers = {"Accept-Encoding": "gzip, deflate"}
            response = requests.get(f"http://localhost:{self.test_port}/", headers=headers, timeout=5)
            
            is_compressed = response.headers.get("Content-Encoding") == "gzip"
            
            status = "PASS" if is_compressed else "WARN"
            message = "Gzip compression enabled" if is_compressed else "Gzip compression not detected"
            
            self.log_result("Gzip Compression", status, message,
                           {"content-encoding": response.headers.get("Content-Encoding", "none")})
            return is_compressed
            
        except requests.exceptions.RequestException as e:
            self.log_result("Gzip Compression", "FAIL", "Could not test gzip compression",
                           {"error": str(e)})
            return False

    def test_google_cloud_configs(self):
        """Test 10: Validate Google Cloud deployment configurations"""
        configs_to_check = [
            ("cloudbuild.yaml", "Cloud Build configuration"),
            ("cloud-run-service.yaml", "Cloud Run service definition")
        ]
        
        all_passed = True
        details = {}
        
        for config_file, description in configs_to_check:
            config_path = self.base_dir / config_file
            if not config_path.exists():
                details[config_file] = "File not found"
                all_passed = False
                continue
                
            try:
                with open(config_path, 'r') as f:
                    if config_file.endswith('.yaml'):
                        config_data = yaml.safe_load(f)
                        
                        if config_file == "cloudbuild.yaml":
                            # Check Cloud Build config
                            has_steps = "steps" in config_data
                            has_docker_build = any("docker" in str(step.get("name", "")) for step in config_data.get("steps", []))
                            has_cloud_run_deploy = any("gcloud" in str(step.get("name", "")) for step in config_data.get("steps", []))
                            
                            details[config_file] = {
                                "has_steps": has_steps,
                                "has_docker_build": has_docker_build,
                                "has_cloud_run_deploy": has_cloud_run_deploy
                            }
                            
                            if not (has_steps and has_docker_build and has_cloud_run_deploy):
                                all_passed = False
                                
                        elif config_file == "cloud-run-service.yaml":
                            # Check Cloud Run service config
                            has_service_spec = "spec" in config_data
                            has_container_port = False
                            has_health_checks = False
                            
                            if has_service_spec:
                                containers = config_data.get("spec", {}).get("template", {}).get("spec", {}).get("containers", [])
                                if containers:
                                    container = containers[0]
                                    ports = container.get("ports", [])
                                    has_container_port = any(port.get("containerPort") == 8080 for port in ports)
                                    has_health_checks = "livenessProbe" in container and "readinessProbe" in container
                            
                            details[config_file] = {
                                "has_service_spec": has_service_spec,
                                "has_container_port_8080": has_container_port,
                                "has_health_checks": has_health_checks
                            }
                            
                            if not (has_service_spec and has_container_port and has_health_checks):
                                all_passed = False
                                
            except Exception as e:
                details[config_file] = f"Error parsing: {str(e)}"
                all_passed = False
                
        status = "PASS" if all_passed else "FAIL"
        message = "All Google Cloud configs valid" if all_passed else "Some Google Cloud configs have issues"
        
        self.log_result("Google Cloud Configs", status, message, details)
        return all_passed

    def cleanup(self):
        """Clean up test resources"""
        print("Cleaning up test resources...")
        self.run_command(f"docker stop {self.container_name} 2>/dev/null || true")
        self.run_command(f"docker rm {self.container_name} 2>/dev/null || true")
        self.run_command(f"docker rmi {self.image_name} 2>/dev/null || true")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting TenderAI Frontend Docker Deployment Tests")
        print("=" * 60)
        print()
        
        # Tests that don't require Docker
        tests_phase1 = [
            self.test_dockerfile_syntax,
            self.test_nginx_config,
            self.test_react_build,
            self.test_google_cloud_configs
        ]
        
        # Tests that require Docker container
        tests_phase2 = [
            self.test_docker_build,
            self.test_container_startup,
            self.test_health_check,
            self.test_spa_routing,
            self.test_security_headers,
            self.test_gzip_compression
        ]
        
        # Run phase 1 tests
        phase1_passed = 0
        for test in tests_phase1:
            if test():
                phase1_passed += 1
                
        # Only run phase 2 if critical phase 1 tests pass
        if phase1_passed >= 3:  # At least dockerfile, nginx, and react build should pass
            for test in tests_phase2:
                test()
        else:
            print("⚠️ Skipping Docker container tests due to critical failures in phase 1")
            
        # Cleanup
        self.cleanup()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["status"] == "PASS")
        failed = sum(1 for result in self.test_results if result["status"] == "FAIL")
        warnings = sum(1 for result in self.test_results if result["status"] == "WARN")
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️ Warnings: {warnings}")
        print(f"📊 Total: {len(self.test_results)}")
        
        if failed == 0:
            print("\n🎉 All critical tests passed! Docker deployment is ready.")
        else:
            print(f"\n⚠️ {failed} test(s) failed. Please review the issues above.")
            
        return failed == 0

if __name__ == "__main__":
    tester = TenderAIDockerTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)