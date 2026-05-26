#!/usr/bin/env python3
"""
Le Marche Backend API Testing Suite
Tests all backend endpoints for the e-commerce platform
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class LeMarceAPITester:
    def __init__(self, base_url="https://le-marche-shop.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.user_id = None
        self.admin_id = None
        self.test_product_id = None
        self.test_order_id = None

    def log(self, message: str, level: str = "INFO"):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, headers: Optional[Dict] = None, 
                 params: Optional[Dict] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        # Default headers
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        # Add auth token if available
        if self.token and 'Authorization' not in default_headers:
            default_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, params=params, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, params=params, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, params=params, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200] if response.text else 'No response body'
                })

            # Try to parse JSON response
            try:
                response_data = response.json() if response.text else {}
            except json.JSONDecodeError:
                response_data = {'raw_response': response.text}

            return success, response_data

        except requests.exceptions.RequestException as e:
            self.log(f"❌ {name} - Network Error: {str(e)}", "ERROR")
            self.failed_tests.append({
                'name': name,
                'error': str(e),
                'type': 'network_error'
            })
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        self.log("=== Testing Health Endpoints ===")
        
        # Test root endpoint
        self.run_test("Root Endpoint", "GET", "", 200)
        
        # Test health check
        self.run_test("Health Check", "GET", "health", 200)

    def test_user_registration(self):
        """Test user registration"""
        self.log("=== Testing User Registration ===")
        
        # Test user registration
        user_data = {
            "name": "Test User",
            "email": f"testuser_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "testpass123"
        }
        
        success, response = self.run_test(
            "User Registration", "POST", "auth/register", 200, data=user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user', {}).get('id')
            self.log(f"✅ User registered with ID: {self.user_id}")
        
        # Test duplicate email registration
        self.run_test(
            "Duplicate Email Registration", "POST", "auth/register", 400, data=user_data
        )

    def test_admin_login(self):
        """Test admin login"""
        self.log("=== Testing Admin Login ===")
        
        admin_credentials = {
            "email": "admin@lemarche.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login", "POST", "auth/login", 200, data=admin_credentials
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.admin_id = response.get('user', {}).get('id')
            self.log(f"✅ Admin logged in with ID: {self.admin_id}")

    def test_user_login(self):
        """Test user login with wrong credentials"""
        self.log("=== Testing User Login ===")
        
        # Test invalid login
        invalid_credentials = {
            "email": "nonexistent@example.com",
            "password": "wrongpass"
        }
        
        self.run_test(
            "Invalid Login", "POST", "auth/login", 401, data=invalid_credentials
        )

    def test_user_profile(self):
        """Test user profile endpoints"""
        if not self.token:
            self.log("⚠️ Skipping profile tests - no user token")
            return
            
        self.log("=== Testing User Profile ===")
        
        # Get current user profile
        self.run_test("Get User Profile", "GET", "auth/me", 200)
        
        # Update user profile
        update_data = {
            "phone": "+91 9876543210",
            "address": "Test Address",
            "city": "Test City",
            "pincode": "123456"
        }
        
        self.run_test(
            "Update User Profile", "PUT", "auth/profile", 200, data=update_data
        )

    def test_products_endpoints(self):
        """Test product-related endpoints"""
        self.log("=== Testing Product Endpoints ===")
        
        # Get all products
        success, response = self.run_test("Get All Products", "GET", "products", 200)
        
        if success and response and len(response) > 0:
            self.test_product_id = response[0]['id']
            self.log(f"✅ Found {len(response)} products, using {self.test_product_id} for tests")
        
        # Get product categories
        self.run_test("Get Categories", "GET", "products/categories", 200)
        
        # Test product filters
        self.run_test(
            "Filter by Category", "GET", "products", 200, 
            params={"category": "Cheese & Dairy"}
        )
        
        self.run_test(
            "Search Products", "GET", "products", 200, 
            params={"search": "cheese"}
        )
        
        self.run_test(
            "Sort Products", "GET", "products", 200, 
            params={"sort_by": "price_asc"}
        )
        
        # Get single product
        if self.test_product_id:
            self.run_test(
                "Get Single Product", "GET", f"products/{self.test_product_id}", 200
            )
        
        # Test non-existent product
        self.run_test(
            "Get Non-existent Product", "GET", "products/nonexistent", 404
        )

    def test_cart_functionality(self):
        """Test cart endpoints"""
        if not self.token or not self.test_product_id:
            self.log("⚠️ Skipping cart tests - no user token or product ID")
            return
            
        self.log("=== Testing Cart Functionality ===")
        
        # Get empty cart
        self.run_test("Get Empty Cart", "GET", "cart", 200)
        
        # Add item to cart
        cart_item = {
            "product_id": self.test_product_id,
            "quantity": 2
        }
        
        self.run_test("Add to Cart", "POST", "cart/add", 200, data=cart_item)
        
        # Get cart with items
        self.run_test("Get Cart with Items", "GET", "cart", 200)
        
        # Update cart item
        update_item = {
            "product_id": self.test_product_id,
            "quantity": 3
        }
        
        self.run_test("Update Cart Item", "PUT", "cart/update", 200, data=update_item)
        
        # Add invalid product to cart
        invalid_item = {
            "product_id": "nonexistent",
            "quantity": 1
        }
        
        self.run_test("Add Invalid Product", "POST", "cart/add", 404, data=invalid_item)

    def test_order_functionality(self):
        """Test order endpoints"""
        if not self.token:
            self.log("⚠️ Skipping order tests - no user token")
            return
            
        self.log("=== Testing Order Functionality ===")
        
        # Create order from cart
        order_data = {
            "address": {
                "name": "Test User",
                "phone": "+91 9876543210",
                "address": "123 Test Street",
                "city": "Test City",
                "pincode": "123456"
            }
        }
        
        success, response = self.run_test(
            "Create Order", "POST", "orders", 201, data=order_data
        )
        
        if success and 'id' in response:
            self.test_order_id = response['id']
            self.log(f"✅ Order created with ID: {self.test_order_id}")
        
        # Get user orders
        self.run_test("Get User Orders", "GET", "orders", 200)
        
        # Get specific order
        if self.test_order_id:
            self.run_test(
                "Get Specific Order", "GET", f"orders/{self.test_order_id}", 200
            )
        
        # Try to create order with empty cart
        self.run_test("Create Order Empty Cart", "POST", "orders", 400, data=order_data)

    def test_admin_functionality(self):
        """Test admin endpoints"""
        if not self.admin_token:
            self.log("⚠️ Skipping admin tests - no admin token")
            return
            
        self.log("=== Testing Admin Functionality ===")
        
        # Switch to admin token
        original_token = self.token
        self.token = self.admin_token
        
        # Get admin stats
        self.run_test("Get Admin Stats", "GET", "admin/stats", 200)
        
        # Get all orders (admin)
        self.run_test("Get All Orders (Admin)", "GET", "admin/orders", 200)
        
        # Update order status
        if self.test_order_id:
            status_update = {"status": "confirmed"}
            self.run_test(
                "Update Order Status", "PUT", f"admin/orders/{self.test_order_id}/status", 
                200, data=status_update
            )
        
        # Test product management
        new_product = {
            "name": "Test Product",
            "description": "A test product for API testing",
            "price": 999,
            "category": "Pantry",
            "image": "https://example.com/test.jpg",
            "stock": 50,
            "rating": 4.0,
            "origin": "Test Origin",
            "weight": "500g",
            "tags": ["test", "api"]
        }
        
        success, response = self.run_test(
            "Create Product (Admin)", "POST", "products", 200, data=new_product
        )
        
        created_product_id = None
        if success and 'id' in response:
            created_product_id = response['id']
        
        # Update product
        if created_product_id:
            update_product = {"price": 1299}
            self.run_test(
                "Update Product (Admin)", "PUT", f"products/{created_product_id}", 
                200, data=update_product
            )
            
            # Delete product
            self.run_test(
                "Delete Product (Admin)", "DELETE", f"products/{created_product_id}", 200
            )
        
        # Test unauthorized access (switch back to user token)
        self.token = original_token
        if original_token:
            self.run_test("Unauthorized Admin Access", "GET", "admin/stats", 403)

    def test_seed_endpoint(self):
        """Test database seeding"""
        self.log("=== Testing Seed Endpoint ===")
        
        # Test seed endpoint (should already be seeded)
        self.run_test("Seed Database", "POST", "seed", 200)

    def run_all_tests(self):
        """Run all test suites"""
        self.log("🚀 Starting Le Marche API Test Suite")
        self.log(f"Testing against: {self.base_url}")
        
        try:
            # Run test suites in order
            self.test_health_check()
            self.test_seed_endpoint()
            self.test_user_registration()
            self.test_admin_login()
            self.test_user_login()
            self.test_user_profile()
            self.test_products_endpoints()
            self.test_cart_functionality()
            self.test_order_functionality()
            self.test_admin_functionality()
            
        except Exception as e:
            self.log(f"❌ Test suite failed with error: {str(e)}", "ERROR")
        
        # Print summary
        self.print_summary()
        
        return self.tests_passed == self.tests_run

    def print_summary(self):
        """Print test results summary"""
        self.log("=" * 50)
        self.log("📊 TEST SUMMARY")
        self.log("=" * 50)
        self.log(f"Total Tests: {self.tests_run}")
        self.log(f"Passed: {self.tests_passed}")
        self.log(f"Failed: {len(self.failed_tests)}")
        
        if self.failed_tests:
            self.log("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                self.log(f"  • {test['name']}")
                if 'expected' in test:
                    self.log(f"    Expected: {test['expected']}, Got: {test['actual']}")
                if 'error' in test:
                    self.log(f"    Error: {test['error']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"\n✅ Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            self.log("🎉 Excellent! API is working well.")
        elif success_rate >= 70:
            self.log("⚠️ Good, but some issues need attention.")
        else:
            self.log("🚨 Critical issues found. Immediate attention required.")

def main():
    """Main test runner"""
    tester = LeMarceAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())