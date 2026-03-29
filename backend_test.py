#!/usr/bin/env python3
"""
LorkERP Backend API Testing Suite
Tests all backend endpoints for the Arabic accounting system
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class LorkERPTester:
    def __init__(self, base_url: str = "https://payroll-verify-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test data storage
        self.cycle_id = None
        self.fund_id = None
        self.client_id = None
        self.agency_id = None
        self.company_id = None

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"name": name, "details": details})

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request and return success status and response data"""
        url = f"{self.base_url}/api/{endpoint}"
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text, "status_code": response.status_code}
            
            if not success:
                print(f"    Expected {expected_status}, got {response.status_code}")
                if response_data:
                    print(f"    Response: {response_data}")
            
            return success, response_data
            
        except Exception as e:
            print(f"    Request failed: {str(e)}")
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test health endpoint"""
        success, data = self.make_request('GET', 'health')
        self.log_test("Health Check", success, f"Status: {data.get('status', 'unknown')}")
        return success

    def test_admin_login(self):
        """Test admin login with credentials from test_credentials.md"""
        login_data = {
            "email": "admin@lorkerp.com",
            "password": "Admin@123456"
        }
        
        success, data = self.make_request('POST', 'auth/login', login_data)
        
        if success and data.get('_id'):
            self.user_data = data
            # Extract cookies for session
            print(f"    Logged in as: {data.get('name', 'Unknown')} ({data.get('role', 'user')})")
        
        self.log_test("Admin Login", success, f"User ID: {data.get('_id', 'N/A')}")
        return success

    def test_get_current_user(self):
        """Test getting current user info"""
        success, data = self.make_request('GET', 'auth/me')
        self.log_test("Get Current User", success, f"Email: {data.get('email', 'N/A')}")
        return success

    def test_create_financial_cycle(self):
        """Test creating a financial cycle"""
        cycle_data = {
            "name": f"Test Cycle {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "notes": "Test cycle for automated testing"
        }
        
        success, data = self.make_request('POST', 'cycles', cycle_data, 200)
        
        if success and data.get('_id'):
            self.cycle_id = data['_id']
            print(f"    Created cycle: {data.get('name')} (ID: {self.cycle_id})")
        
        self.log_test("Create Financial Cycle", success, f"Cycle ID: {data.get('_id', 'N/A')}")
        return success

    def test_get_cycles(self):
        """Test getting financial cycles"""
        success, data = self.make_request('GET', 'cycles')
        cycle_count = len(data) if isinstance(data, list) else 0
        self.log_test("Get Financial Cycles", success, f"Found {cycle_count} cycles")
        return success

    def test_create_fund(self):
        """Test creating a fund"""
        fund_data = {
            "name": "Test Main Fund",
            "is_main": True,
            "initial_balance": 10000.0
        }
        
        success, data = self.make_request('POST', 'funds', fund_data, 200)
        
        if success and data.get('_id'):
            self.fund_id = data['_id']
            print(f"    Created fund: {data.get('name')} (Balance: {data.get('balance', 0)})")
        
        self.log_test("Create Fund", success, f"Fund ID: {data.get('_id', 'N/A')}")
        return success

    def test_get_funds(self):
        """Test getting funds"""
        success, data = self.make_request('GET', 'funds')
        fund_count = len(data) if isinstance(data, list) else 0
        self.log_test("Get Funds", success, f"Found {fund_count} funds")
        return success

    def test_create_client(self):
        """Test creating a client"""
        client_data = {
            "name": "Test Client",
            "phone": "+966501234567",
            "email": "testclient@example.com",
            "address": "Test Address, Riyadh",
            "notes": "Test client for automated testing"
        }
        
        success, data = self.make_request('POST', 'clients', client_data, 200)
        
        if success and data.get('_id'):
            self.client_id = data['_id']
            print(f"    Created client: {data.get('name')} (ID: {self.client_id})")
        
        self.log_test("Create Client", success, f"Client ID: {data.get('_id', 'N/A')}")
        return success

    def test_get_clients(self):
        """Test getting clients"""
        success, data = self.make_request('GET', 'clients')
        client_count = len(data) if isinstance(data, list) else 0
        self.log_test("Get Clients", success, f"Found {client_count} clients")
        return success

    def test_create_sub_agency(self):
        """Test creating a sub agency"""
        agency_data = {
            "name": "Test Sub Agency",
            "code": "TSA001",
            "initial_balance": 5000.0,
            "company_percent": 85.0
        }
        
        success, data = self.make_request('POST', 'sub-agencies', agency_data, 200)
        
        if success and data.get('_id'):
            self.agency_id = data['_id']
            print(f"    Created agency: {data.get('name')} (Balance: {data.get('balance', 0)})")
        
        self.log_test("Create Sub Agency", success, f"Agency ID: {data.get('_id', 'N/A')}")
        return success

    def test_get_sub_agencies(self):
        """Test getting sub agencies"""
        success, data = self.make_request('GET', 'sub-agencies')
        agency_count = len(data) if isinstance(data, list) else 0
        self.log_test("Get Sub Agencies", success, f"Found {agency_count} agencies")
        return success

    def test_create_transfer_company(self):
        """Test creating a transfer company"""
        company_data = {
            "name": "Test Transfer Company",
            "code": "TTC001",
            "initial_balance": 15000.0
        }
        
        success, data = self.make_request('POST', 'transfer-companies', company_data, 200)
        
        if success and data.get('_id'):
            self.company_id = data['_id']
            print(f"    Created company: {data.get('name')} (Balance: {data.get('balance', 0)})")
        
        self.log_test("Create Transfer Company", success, f"Company ID: {data.get('_id', 'N/A')}")
        return success

    def test_get_transfer_companies(self):
        """Test getting transfer companies"""
        success, data = self.make_request('GET', 'transfer-companies')
        company_count = len(data) if isinstance(data, list) else 0
        self.log_test("Get Transfer Companies", success, f"Found {company_count} companies")
        return success

    def test_dashboard_summary(self):
        """Test dashboard summary endpoint"""
        success, data = self.make_request('GET', 'dashboard/summary')
        
        if success:
            cycle_name = data.get('cycle', {}).get('name', 'No active cycle') if data.get('cycle') else 'No active cycle'
            main_balance = data.get('main_fund_balance', 0)
            print(f"    Active cycle: {cycle_name}")
            print(f"    Main fund balance: {main_balance}")
        
        self.log_test("Dashboard Summary", success, f"Main fund balance: {data.get('main_fund_balance', 0)}")
        return success

    def test_create_expense(self):
        """Test creating an expense"""
        expense_data = {
            "amount": 500.0,
            "description": "Test expense for office supplies",
            "category": "Office",
            "deduct_from_main": True
        }
        
        success, data = self.make_request('POST', 'expenses', expense_data, 200)
        self.log_test("Create Expense", success, f"Amount: {data.get('amount', 0)}")
        return success

    def test_get_expenses(self):
        """Test getting expenses"""
        success, data = self.make_request('GET', 'expenses')
        expense_count = len(data) if isinstance(data, list) else 0
        self.log_test("Get Expenses", success, f"Found {expense_count} expenses")
        return success

    def test_get_debts(self):
        """Test getting debts"""
        success, data = self.make_request('GET', 'debts')
        debt_count = len(data) if isinstance(data, list) else 0
        self.log_test("Get Debts", success, f"Found {debt_count} debts")
        return success

    def test_search_functionality(self):
        """Test search functionality"""
        success, data = self.make_request('GET', 'search?q=Test')
        result_count = len(data) if isinstance(data, list) else 0
        self.log_test("Search Functionality", success, f"Found {result_count} results")
        return success

    def test_logout(self):
        """Test logout"""
        success, data = self.make_request('POST', 'auth/logout')
        self.log_test("Logout", success, f"Message: {data.get('message', 'N/A')}")
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting LorkERP Backend API Tests")
        print("=" * 50)
        
        # Health check
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
        
        # Authentication tests
        if not self.test_admin_login():
            print("❌ Admin login failed - stopping tests")
            return False
        
        self.test_get_current_user()
        
        # Core functionality tests
        self.test_create_financial_cycle()
        self.test_get_cycles()
        
        self.test_create_fund()
        self.test_get_funds()
        
        self.test_create_client()
        self.test_get_clients()
        
        self.test_create_sub_agency()
        self.test_get_sub_agencies()
        
        self.test_create_transfer_company()
        self.test_get_transfer_companies()
        
        # Dashboard and reporting
        self.test_dashboard_summary()
        
        # Financial operations
        self.test_create_expense()
        self.test_get_expenses()
        self.test_get_debts()
        
        # Search functionality
        self.test_search_functionality()
        
        # Logout
        self.test_logout()
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  - {test['name']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = LorkERPTester()
    
    try:
        success = tester.run_all_tests()
        all_passed = tester.print_summary()
        
        return 0 if all_passed else 1
        
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())