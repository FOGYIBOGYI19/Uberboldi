import React, { useState, useEffect } from 'react';
import MapSelector from './MapSelector';
import { translations } from './translations';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [currentView, setCurrentView] = useState('user'); // 'user' or 'admin'
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentLang, setCurrentLang] = useState('hu'); // 'hu' or 'en'
  
  const t = translations[currentLang];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">🚗 Carpool Tracker</h1>
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{t.language}:</span>
                <button
                  onClick={() => setCurrentLang(currentLang === 'hu' ? 'en' : 'hu')}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {currentLang === 'hu' ? 'EN' : 'HU'}
                </button>
              </div>
              
              {/* View Toggle */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentView('user')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t.userView}
                </button>
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'admin' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t.admin}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'user' ? (
          <UserInterface currentLang={currentLang} t={t} />
        ) : (
          <AdminInterface 
            isAuthenticated={isAdminAuthenticated}
            setIsAuthenticated={setIsAdminAuthenticated}
            currentLang={currentLang}
            t={t}
          />
        )}
      </main>
    </div>
  );
}

function UserInterface({ currentLang, t }) {
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
            <h2 className="text-2xl font-bold text-gray-800">{t.planTrip}</h2>
            <p className="text-gray-600 mt-1">
              {t.currentRate}: {settings?.rate_per_km || 0} HUF/km
            </p>
          </div>
          <button
            onClick={() => setShowCreateTrip(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t.newTrip}
          </button>
        </div>
      </div>

      {/* UberBoldi Car Interface */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">UberBoldi</h3>
          <p className="text-gray-600 mb-6">
            {currentLang === 'hu' 
              ? 'Egyszerű utazástervezés barátokkal' 
              : 'Simple trip planning with friends'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl mb-2">📍</div>
              <h4 className="font-semibold text-gray-800">
                {currentLang === 'hu' ? 'Hely kiválasztás' : 'Select Location'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {currentLang === 'hu' 
                  ? 'Térképen vagy manuálisan' 
                  : 'On map or manually'}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold text-gray-800">
                {currentLang === 'hu' ? 'Automatikus számítás' : 'Auto Calculate'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {currentLang === 'hu' 
                  ? 'Költségek és távolság' 
                  : 'Costs and distance'}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl mb-2">👥</div>
              <h4 className="font-semibold text-gray-800">
                {currentLang === 'hu' ? 'Barátok hozzáadása' : 'Add Friends'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {currentLang === 'hu' 
                  ? 'Egyszerű névlista' 
                  : 'Simple name list'}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateTrip(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-medium text-lg shadow-lg"
            >
              {currentLang === 'hu' ? '🚀 Utazás indítása' : '🚀 Start Journey'}
            </button>
          </div>
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
          currentLang={currentLang}
          t={t}
        />
      )}
    </div>
  );
}

function CreateTripModal({ settings, onClose, onTripCreated, currentLang, t }) {
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [distance, setDistance] = useState('');
  const [passengers, setPassengers] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [useMap, setUseMap] = useState(true);

  const handleLocationUpdate = (type, data) => {
    if (type === 'start') {
      setStartLocation(data);
    } else if (type === 'end') {
      setEndLocation(data);
    } else if (type === 'distance') {
      setDistance(data.toFixed(1));
    } else if (type === 'reset') {
      setStartLocation(null);
      setEndLocation(null);
      setDistance('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (useMap) {
      if (!startLocation || !endLocation || !distance) {
        alert(t.fillAllFields);
        return;
      }
    } else {
      if (!distance) {
        alert(t.fillAllFields);
        return;
      }
    }

    setLoading(true);
    try {
      const passengerList = passengers.split(',').map(p => p.trim()).filter(p => p);
      
      const tripData = {
        start_location: startLocation || { address: 'Manual entry', lat: 0, lng: 0 },
        end_location: endLocation || { address: 'Manual entry', lat: 0, lng: 0 },
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
        alert(t.errorCreatingTrip);
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      alert(t.errorCreatingTrip);
    } finally {
      setLoading(false);
    }
  };

  const estimatedCost = distance && settings ? 
    (parseFloat(distance) * settings.rate_per_km).toFixed(0) : '0';
  
  const passengerCount = passengers.split(',').filter(p => p.trim()).length || 1;
  const costPerPerson = estimatedCost > 0 ? (parseFloat(estimatedCost) / passengerCount).toFixed(0) : '0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{t.createNewTrip}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Map Toggle */}
          <div className="flex items-center space-x-4 mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={useMap}
                onChange={() => setUseMap(true)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium">{t.selectOnMap}</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={!useMap}
                onChange={() => setUseMap(false)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium">Manual</span>
            </label>
          </div>

          {useMap ? (
            // Map Selection
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.selectOnMap}
              </label>
              <MapSelector
                startLocation={startLocation}
                endLocation={endLocation}
                onLocationUpdate={handleLocationUpdate}
                translations={translations}
                currentLang={currentLang}
              />
            </div>
          ) : (
            // Manual Entry
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.from}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t.from}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.to}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t.to}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.distance} *
            </label>
            <input
              type="number"
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t.distance}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.passengers}
            </label>
            <input
              type="text"
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="János, Petra, Béla (vesszővel elválasztva)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.paymentMethod}
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="cash">{t.cash}</option>
              <option value="card">{t.card}</option>
            </select>
          </div>

          {/* Cost Preview */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">
              <div>{t.totalCost}: {estimatedCost} HUF</div>
              <div>{t.costPerPerson}: {costPerPerson} HUF</div>
              {paymentMethod === 'card' && settings && (
                <div className="mt-2 text-xs text-blue-600">
                  {t.paymentInfo}: {settings.payment_info}
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
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? t.creating : t.createTrip}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminInterface({ isAuthenticated, setIsAuthenticated, currentLang, t }) {
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
        alert(t.invalidPassword);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(t.loginError);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.adminLogin}</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.password}
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
              {loading ? t.loggingIn : t.login}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard setIsAuthenticated={setIsAuthenticated} currentLang={currentLang} t={t} />;
}

function AdminDashboard({ setIsAuthenticated, currentLang, t }) {
  const [settings, setSettings] = useState(null);
  const [trips, setTrips] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [passengerSummary, setPassengerSummary] = useState({});

  useEffect(() => {
    fetchSettings();
    fetchTrips();
    fetchPassengerSummary();
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

  const fetchPassengerSummary = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/passengers/summary`);
      const data = await response.json();
      setPassengerSummary(data);
    } catch (error) {
      console.error('Error fetching passenger summary:', error);
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

  const deleteTrip = async (tripId) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/trip/${tripId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchTrips();
          fetchPassengerSummary(); // Refresh summary after deletion
        } else {
          alert('Error deleting trip');
        }
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Error deleting trip');
      }
    }
  };

  const deleteTrip = async (tripId) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/trip/${tripId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchTrips();
        } else {
          alert('Error deleting trip');
        }
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Error deleting trip');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t.adminDashboard}</h2>
            <p className="text-gray-600 mt-1">
              {t.currentRate}: {settings?.rate_per_km || 0} HUF/km
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.settings}
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </div>

      {/* Friend Summary - Admin Only */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t.friendSummary}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(passengerSummary).map(([name, data]) => (
            <div key={name} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800">{name}</h4>
              <div className="text-sm text-gray-600 space-y-1 mt-2">
                <div>{t.totalDistance}: {data.total_distance.toFixed(1)} km</div>
                <div>{t.totalCostLabel}: {data.total_cost.toFixed(0)} HUF</div>
                <div>{t.trips}: {data.trip_count}</div>
                {data.unpaid_cost > 0 && (
                  <div className="text-red-600 font-medium">
                    {t.unpaid}: {data.unpaid_cost.toFixed(0)} HUF
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Friend Summary - Admin Only */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t.friendSummary}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(passengerSummary).map(([name, data]) => (
            <div key={name} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800">{name}</h4>
              <div className="text-sm text-gray-600 space-y-1 mt-2">
                <div>{t.totalDistance}: {data.total_distance.toFixed(1)} km</div>
                <div>{t.totalCostLabel}: {data.total_cost.toFixed(0)} HUF</div>
                <div>{t.trips}: {data.trip_count}</div>
                {data.unpaid_cost > 0 && (
                  <div className="text-red-600 font-medium">
                    {t.unpaid}: {data.unpaid_cost.toFixed(0)} HUF
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Friend Summary - Admin Only */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t.friendSummary}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(passengerSummary).map(([name, data]) => (
            <div key={name} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800">{name}</h4>
              <div className="text-sm text-gray-600 space-y-1 mt-2">
                <div>{t.totalDistance}: {data.total_distance.toFixed(1)} km</div>
                <div>{t.totalCostLabel}: {data.total_cost.toFixed(0)} HUF</div>
                <div>{t.trips}: {data.trip_count}</div>
                {data.unpaid_cost > 0 && (
                  <div className="text-red-600 font-medium">
                    {t.unpaid}: {data.unpaid_cost.toFixed(0)} HUF
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Trips */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t.allTrips}</h3>
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
                    {trip.payment_method === 'card' ? t.card : t.cash} • {new Date(trip.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="font-bold text-green-600">
                    {trip.cost_per_person.toFixed(0)} HUF/{currentLang === 'hu' ? 'fő' : 'person'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t.totalCostLabel}: {trip.total_cost.toFixed(0)} HUF
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
                  {trip.paid ? t.paid : t.unpaidStatus}
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
          currentLang={currentLang}
          t={t}
        />
      )}
    </div>
  );
}

function SettingsModal({ settings, onClose, onSettingsUpdated, currentLang, t }) {
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
        alert(t.errorUpdatingSettings);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert(t.errorUpdatingSettings);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{t.adminSettings}</h3>
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
              {t.ratePerKm}
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
              {t.paymentInformation}
            </label>
            <textarea
              value={paymentInfo}
              onChange={(e) => setPaymentInfo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
              placeholder="Kártya: 1234-5678-9012-3456 | Bank: Your Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.newAdminPassword}
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder={t.leaveBlank}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;