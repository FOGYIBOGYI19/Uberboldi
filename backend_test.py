
import requests
import sys
import json
from datetime import datetime

class CarpoolingAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_authenticated = False

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            
            status_success = response.status_code == expected_status
            
            if status_success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                    return False, response.json()
                except:
                    return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_get_settings(self):
        """Test getting public settings"""
        print("\n📋 Testing GET /api/settings")
        success, response = self.run_test(
            "Get Public Settings",
            "GET",
            "api/settings",
            200
        )
        
        if success:
            print(f"Rate per km: {response.get('rate_per_km')}")
            print(f"Payment info: {response.get('payment_info')}")
        
        return success, response

    def test_admin_login(self, password):
        """Test admin login"""
        print("\n🔐 Testing POST /api/admin/login")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/admin/login",
            200,
            data={"password": password}
        )
        
        if success:
            self.admin_authenticated = True
            print("Admin login successful")
        else:
            print("Admin login failed")
        
        return success

    def test_get_admin_settings(self):
        """Test getting admin settings"""
        print("\n⚙️ Testing GET /api/admin/settings")
        success, response = self.run_test(
            "Get Admin Settings",
            "GET",
            "api/admin/settings",
            200
        )
        
        if success:
            print(f"Admin settings: {json.dumps(response, indent=2)}")
        
        return success, response

    def test_create_trip(self, start_location, end_location, distance_km, passengers, payment_method):
        """Test creating a new trip"""
        print("\n🚗 Testing POST /api/trips")
        
        trip_data = {
            "start_location": start_location,
            "end_location": end_location,
            "distance_km": distance_km,
            "passengers": passengers,
            "payment_method": payment_method
        }
        
        success, response = self.run_test(
            "Create Trip",
            "POST",
            "api/trips",
            200,
            data=trip_data
        )
        
        if success:
            print(f"Trip created with ID: {response.get('id')}")
            print(f"Total cost: {response.get('total_cost')}")
            print(f"Cost per person: {response.get('cost_per_person')}")
        
        return success, response

    def test_get_trips(self):
        """Test getting all trips"""
        print("\n📋 Testing GET /api/trips")
        success, response = self.run_test(
            "Get Trips",
            "GET",
            "api/trips",
            200
        )
        
        if success:
            print(f"Retrieved {len(response)} trips")
            if len(response) > 0:
                print(f"Most recent trip: {json.dumps(response[0], indent=2)}")
        
        return success, response

    def test_get_passenger_summary(self):
        """Test getting passenger summary"""
        print("\n👥 Testing GET /api/passengers/summary")
        success, response = self.run_test(
            "Get Passenger Summary",
            "GET",
            "api/passengers/summary",
            200
        )
        
        if success:
            print(f"Passenger summary: {json.dumps(response, indent=2)}")
        
        return success, response

    def test_get_admin_trips(self):
        """Test getting all trips as admin"""
        print("\n📋 Testing GET /api/admin/trips")
        success, response = self.run_test(
            "Get Admin Trips",
            "GET",
            "api/admin/trips",
            200
        )
        
        if success:
            print(f"Retrieved {len(response)} trips as admin")
        
        return success, response

    def test_mark_trip_paid(self, trip_id, paid=True):
        """Test marking a trip as paid/unpaid"""
        print(f"\n💰 Testing PUT /api/admin/trip/{trip_id}/paid")
        success, response = self.run_test(
            "Mark Trip Paid",
            "PUT",
            f"api/admin/trip/{trip_id}/paid",
            200,
            data={"paid": paid}
        )
        
        if success:
            print(f"Trip {trip_id} marked as {'paid' if paid else 'unpaid'}")
        
        return success, response

    def test_update_admin_settings(self, rate_per_km, payment_info, admin_password):
        """Test updating admin settings"""
        print("\n⚙️ Testing PUT /api/admin/settings")
        success, response = self.run_test(
            "Update Admin Settings",
            "PUT",
            "api/admin/settings",
            200,
            data={
                "rate_per_km": rate_per_km,
                "payment_info": payment_info,
                "admin_password": admin_password
            }
        )
        
        if success:
            print(f"Admin settings updated successfully")
        
        return success, response

def main():
    # Get the backend URL from the frontend .env file
    backend_url = "https://31f6d24d-05cf-4aec-8ca9-2d356dd4f0be.preview.emergentagent.com"
    
    print(f"🔌 Testing API at: {backend_url}")
    tester = CarpoolingAPITester(backend_url)
    
    # Test 1: Get public settings
    settings_success, settings = tester.test_get_settings()
    if not settings_success:
        print("❌ Failed to get settings, stopping tests")
        return 1
    
    # Test 2: Admin login
    admin_login_success = tester.test_admin_login("admin123")
    if not admin_login_success:
        print("❌ Admin login failed, continuing with user tests only")
    
    # Test 3: Get admin settings (if logged in)
    if admin_login_success:
        admin_settings_success, admin_settings = tester.test_get_admin_settings()
    
    # Test 4: Create a trip
    start_location = {"address": "Home", "lat": 40.7128, "lng": -74.0060}
    end_location = {"address": "Work", "lat": 40.7138, "lng": -74.0070}
    distance_km = 15.5
    passengers = ["John", "Jane"]
    payment_method = "card"
    
    trip_success, trip = tester.test_create_trip(
        start_location, 
        end_location, 
        distance_km, 
        passengers, 
        payment_method
    )
    
    if not trip_success:
        print("❌ Failed to create trip")
    
    # Test 5: Get all trips
    trips_success, trips = tester.test_get_trips()
    
    # Test 6: Get passenger summary
    summary_success, summary = tester.test_get_passenger_summary()
    
    # Admin tests (if logged in)
    if admin_login_success:
        # Test 7: Get all trips as admin
        admin_trips_success, admin_trips = tester.test_get_admin_trips()
        
        # Test 8: Mark a trip as paid (if we have trips)
        if trips_success and len(trips) > 0:
            trip_id = trips[0]["id"]
            mark_paid_success, _ = tester.test_mark_trip_paid(trip_id, True)
            
            # Test 9: Update admin settings
            if settings_success:
                current_rate = settings.get("rate_per_km", 0.5)
                current_payment_info = settings.get("payment_info", "")
                
                # Slightly modify the rate to test update
                new_rate = current_rate + 0.1
                update_settings_success, _ = tester.test_update_admin_settings(
                    new_rate,
                    current_payment_info,
                    "admin123"
                )
                
                # Verify the update worked
                if update_settings_success:
                    verify_success, updated_settings = tester.test_get_settings()
                    if verify_success:
                        if abs(updated_settings.get("rate_per_km", 0) - new_rate) < 0.001:
                            print("✅ Settings update verified")
                        else:
                            print("❌ Settings update verification failed")
                
                # Restore original settings
                tester.test_update_admin_settings(
                    current_rate,
                    current_payment_info,
                    "admin123"
                )
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
