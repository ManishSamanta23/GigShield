/**
 * Geolocation Utility - Get user's current location
 */

/**
 * Get current position using browser Geolocation API
 * @returns {Promise<{latitude: number, longitude: number, locationName: string, city: string, state: string, country: string, accuracy: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          // Reverse geocode to get location details
          const locationDetails = await reverseGeocode(latitude, longitude);
          resolve({ latitude, longitude, ...locationDetails, accuracy });
        } catch (err) {
          // Return coordinates even if geocoding fails
          resolve({ 
            latitude, 
            longitude, 
            locationName: null,
            city: null, 
            state: null,
            country: null,
            accuracy 
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        reject(error);
      },
      options
    );
  });
};

/**
 * Reverse geocode coordinates to get full location details
 * Uses OpenWeatherMap Geocoding API (free tier supports reverse geocoding)
 * Falls back to OpenStreetMap Nominatim if needed
 */
const reverseGeocode = async (latitude, longitude) => {
  try {
    // Use OpenStreetMap Nominatim (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' }
      }
    );
    const data = await response.json();
    const address = data.address || {};

    // Extract location components
    const city = address.city || address.town || address.village || address.county || '';
    const state = address.state || address.province || '';
    const country = address.country || '';

    // Build location name
    const locationParts = [city, state, country].filter(part => part && part.trim());
    const locationName = locationParts.length > 0 ? locationParts.join(', ') : null;

    return {
      locationName,
      city: city || null,
      state: state || null,
      country: country || null
    };
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return {
      locationName: null,
      city: null,
      state: null,
      country: null
    };
  }
};

/**
 * Watch user's position continuously
 * @param {Function} callback - Called with location updates
 * @returns {number} watchId - Use to stop watching via clearWatch
 */
export const watchLocation = (callback) => {
  if (!navigator.geolocation) {
    console.error('Geolocation is not supported');
    return null;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 3000
  };

  return navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const locationDetails = await reverseGeocode(latitude, longitude);
      callback({ latitude, longitude, ...locationDetails, accuracy });
    },
    (error) => {
      console.error('Watch position error:', error);
    },
    options
  );
};

/**
 * Stop watching location
 * @param {number} watchId - ID returned from watchLocation
 */
export const stopWatchingLocation = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Calculate distance between two coordinates (in km)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
