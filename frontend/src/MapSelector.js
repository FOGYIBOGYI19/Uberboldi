import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for start and end points
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapClickHandler({ onLocationSelect, currentStep, translations, currentLang }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });

  return null;
}

function MapSelector({ startLocation, endLocation, onLocationUpdate, translations, currentLang }) {
  const [currentStep, setCurrentStep] = useState('start'); // 'start' or 'end'
  const mapRef = useRef();
  
  // Default center to Tata, Hungary
  const defaultCenter = [47.6667, 18.3167];
  const zoom = 13;

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const handleLocationSelect = async (lat, lng) => {
    // Get address from coordinates using reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      const location = { lat, lng, address };
      
      if (currentStep === 'start') {
        onLocationUpdate('start', location);
        setCurrentStep('end');
      } else {
        onLocationUpdate('end', location);
        
        // Calculate distance if both points are selected
        if (startLocation) {
          const distance = calculateDistance(startLocation.lat, startLocation.lng, lat, lng);
          onLocationUpdate('distance', distance);
        }
      }
    } catch (error) {
      console.error('Error getting address:', error);
      const location = { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
      
      if (currentStep === 'start') {
        onLocationUpdate('start', location);
        setCurrentStep('end');
      } else {
        onLocationUpdate('end', location);
        
        if (startLocation) {
          const distance = calculateDistance(startLocation.lat, startLocation.lng, lat, lng);
          onLocationUpdate('distance', distance);
        }
      }
    }
  };

  const resetSelection = () => {
    setCurrentStep('start');
    onLocationUpdate('reset');
  };

  const getCurrentInstruction = () => {
    if (currentStep === 'start') {
      return translations[currentLang].clickToSelectStart;
    } else {
      return translations[currentLang].clickToSelectEnd;
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm font-medium text-blue-800">
          {getCurrentInstruction()}
        </div>
        {startLocation && endLocation && (
          <div className="text-xs text-blue-600 mt-1">
            {translations[currentLang].calculatedDistance}: {calculateDistance(
              startLocation.lat, startLocation.lng, 
              endLocation.lat, endLocation.lng
            ).toFixed(1)} km
          </div>
        )}
      </div>

      {/* Control buttons */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setCurrentStep('start')}
          className={`px-3 py-1 rounded text-sm ${
            currentStep === 'start' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {translations[currentLang].startLocation}
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep('end')}
          className={`px-3 py-1 rounded text-sm ${
            currentStep === 'end' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {translations[currentLang].endLocation}
        </button>
        <button
          type="button"
          onClick={resetSelection}
          className="px-3 py-1 rounded text-sm bg-gray-500 text-white hover:bg-gray-600"
        >
          Reset
        </button>
      </div>

      {/* Selected locations display */}
      {(startLocation || endLocation) && (
        <div className="text-xs text-gray-600 space-y-1">
          {startLocation && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>{translations[currentLang].startLocation}: {startLocation.address}</span>
            </div>
          )}
          {endLocation && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>{translations[currentLang].endLocation}: {endLocation.address}</span>
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="h-80 rounded-lg overflow-hidden border">
        <MapContainer
          center={startLocation ? [startLocation.lat, startLocation.lng] : defaultCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler 
            onLocationSelect={handleLocationSelect}
            currentStep={currentStep}
            translations={translations}
            currentLang={currentLang}
          />
          
          {startLocation && (
            <Marker position={[startLocation.lat, startLocation.lng]} icon={startIcon}>
              <Popup>{translations[currentLang].startLocation}: {startLocation.address}</Popup>
            </Marker>
          )}
          
          {endLocation && (
            <Marker position={[endLocation.lat, endLocation.lng]} icon={endIcon}>
              <Popup>{translations[currentLang].endLocation}: {endLocation.address}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapSelector;