import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [currentView, setCurrentView] = useState('user'); // 'user' or 'admin'
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">🚗 Carpool Tracker</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentView('user')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                User View
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'admin' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'user' ? (
          <UserInterface />
        ) : (
          <AdminInterface 
            isAuthenticated={isAdminAuthenticated}
            setIsAuthenticated={setIsAdminAuthenticated}
          />
        )}
      </main>
    </div>
  );
}

function UserInterface() {
  const [trips, setTrips] = useState([]);
  const [settings, setSettings] = useState(null);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [passengerSummary, setPassengerSummary] = useState({});

  useEffect(() => {
    fetchSettings();
    fetchTrips();
    fetchPassengerSummary();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/settings`);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/trips`);
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const fetchPassengerSummary = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/passengers/summary`);
      const data = await response.json();
      setPassengerSummary(data);
    } catch (error) {
      console.error('Error fetching passenger summary:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Plan Your Trip</h2>
            <p className="text-gray-600 mt-1">
              Current rate: ${settings?.rate_per_km || 0}/km
            </p>
          </div>
          <button
            onClick={() => setShowCreateTrip(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + New Trip
          </button>
        </div>
      </div>

      {/* Passenger Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Friend Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(passengerSummary).map(([name, data]) => (
            <div key={name} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800">{name}</h4>
              <div className="text-sm text-gray-600 space-y-1 mt-2">
                <div>Total Distance: {data.total_distance.toFixed(1)} km</div>
                <div>Total Cost: ${data.total_cost.toFixed(2)}</div>
                <div>Trips: {data.trip_count}</div>
                {data.unpaid_cost > 0 && (
                  <div className="text-red-600 font-medium">
                    Unpaid: ${data.unpaid_cost.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trips */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Trips</h3>
        <div className="space-y-3">
          {trips.slice(0, 5).map((trip) => (
            <div key={trip.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-800">
                    {trip.start_location.address || 'Start'} → {trip.end_location.address || 'End'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {trip.distance_km.toFixed(1)} km • {trip.passengers.join(', ')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {trip.payment_method} • {new Date(trip.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    ${trip.cost_per_person.toFixed(2)}/person
                  </div>
                  <div className="text-sm text-gray-500">
                    Total: ${trip.total_cost.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Trip Modal */}
      {showCreateTrip && (
        <CreateTripModal
          settings={settings}
          onClose={() => setShowCreateTrip(false)}
          onTripCreated={() => {
            fetchTrips();
            fetchPassengerSummary();
            setShowCreateTrip(false);
          }}
        />
      )}
    </div>
  );
}

function CreateTripModal({ settings, onClose, onTripCreated }) {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [distance, setDistance] = useState('');
  const [passengers, setPassengers] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startAddress || !endAddress || !distance) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const passengerList = passengers.split(',').map(p => p.trim()).filter(p => p);
      
      const tripData = {
        start_location: { address: startAddress, lat: 0, lng: 0 },
        end_location: { address: endAddress, lat: 0, lng: 0 },
        distance_km: parseFloat(distance),
        passengers: passengerList,
        payment_method: paymentMethod
      };

      const response = await fetch(`${BACKEND_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData)
      });

      if (response.ok) {
        onTripCreated();
      } else {
        alert('Error creating trip');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Error creating trip');
    } finally {
      setLoading(false);
    }
  };

  const estimatedCost = distance && settings ? 
    (parseFloat(distance) * settings.rate_per_km).toFixed(2) : '0.00';
  
  const passengerCount = passengers.split(',').filter(p => p.trim()).length || 1;
  const costPerPerson = estimatedCost > 0 ? (parseFloat(estimatedCost) / passengerCount).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Create New Trip</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From *
            </label>
            <input
              type="text"
              value={startAddress}
              onChange={(e) => setStartAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Start location"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To *
            </label>
            <input
              type="text"
              value={endAddress}
              onChange={(e) => setEndAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="End location"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distance (km) *
            </label>
            <input
              type="number"
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Distance in kilometers"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passengers
            </label>
            <input
              type="text"
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John, Jane, Bob (comma separated)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </div>

          {/* Cost Preview */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">
              <div>Total Cost: ${estimatedCost}</div>
              <div>Cost per person: ${costPerPerson}</div>
              {paymentMethod === 'card' && settings && (
                <div className="mt-2 text-xs text-blue-600">
                  Payment Info: {settings.payment_info}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminInterface({ isAuthenticated, setIsAuthenticated }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        alert('Invalid password');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard setIsAuthenticated={setIsAuthenticated} />;
}

function AdminDashboard({ setIsAuthenticated }) {
  const [settings, setSettings] = useState(null);
  const [trips, setTrips] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchTrips();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/settings`);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/trips`);
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const toggleTripPaid = async (tripId, currentStatus) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/trip/${tripId}/paid`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: !currentStatus })
      });

      if (response.ok) {
        fetchTrips();
      }
    } catch (error) {
      console.error('Error updating trip:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
            <p className="text-gray-600 mt-1">
              Current rate: ${settings?.rate_per_km || 0}/km
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Settings
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* All Trips */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">All Trips</h3>
        <div className="space-y-3">
          {trips.map((trip) => (
            <div key={trip.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {trip.start_location.address || 'Start'} → {trip.end_location.address || 'End'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {trip.distance_km.toFixed(1)} km • {trip.passengers.join(', ')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {trip.payment_method} • {new Date(trip.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="font-bold text-green-600">
                    ${trip.cost_per_person.toFixed(2)}/person
                  </div>
                  <div className="text-sm text-gray-500">
                    Total: ${trip.total_cost.toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={() => toggleTripPaid(trip.id, trip.paid)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    trip.paid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {trip.paid ? 'Paid' : 'Unpaid'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettingsModal(false)}
          onSettingsUpdated={() => {
            fetchSettings();
            setShowSettingsModal(false);
          }}
        />
      )}
    </div>
  );
}

function SettingsModal({ settings, onClose, onSettingsUpdated }) {
  const [ratePerKm, setRatePerKm] = useState(settings?.rate_per_km || 0);
  const [paymentInfo, setPaymentInfo] = useState(settings?.payment_info || '');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate_per_km: parseFloat(ratePerKm),
          payment_info: paymentInfo,
          admin_password: adminPassword || 'admin123'
        })
      });

      if (response.ok) {
        onSettingsUpdated();
      } else {
        alert('Error updating settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Admin Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate per Kilometer ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={ratePerKm}
              onChange={(e) => setRatePerKm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Information
            </label>
            <textarea
              value={paymentInfo}
              onChange={(e) => setPaymentInfo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
              placeholder="Card: 1234-5678-9012-3456 | Bank: Your Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Admin Password (leave blank to keep current)
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;