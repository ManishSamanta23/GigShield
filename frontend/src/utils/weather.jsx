/**
 * Weather and Environmental Data API Integration
 * Uses OpenWeatherMap and public APIs for weather/AQI data
 */

import api from './api';

/**
 * Get weather data for given coordinates
 * Calls the backend which handles API key securely
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{temp, feels_like, humidity, pressure, weather, wind_speed, wind_gust}>}
 */
export const getWeather = async (latitude, longitude) => {
  try {
    const { data } = await api.get('/weather', {
      params: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    });
    return data;
  } catch (err) {
    console.error('Failed to fetch weather:', err.response?.data?.message || err.message);
    throw err;
  }
};

/**
 * Get Air Quality Index (AQI) for given coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{aqi, pm25, pm10, no2, o3, so2, co}>}
 */
export const getAQI = async (latitude, longitude) => {
  try {
    const { data } = await api.get('/weather/aqi', {
      params: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    });
    return data;
  } catch (err) {
    console.error('Failed to fetch AQI:', err.response?.data?.message || err.message);
    throw err;
  }
};

/**
 * Get weather alerts for a location
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Array>}
 */
export const getWeatherAlerts = async (latitude, longitude) => {
  try {
    const { data } = await api.get('/weather/alerts', {
      params: { latitude, longitude }
    });
    return data;
  } catch (err) {
    console.error('Failed to fetch weather alerts:', err);
    throw err;
  }
};

/**
 * Validate a claim against real-time weather/AQI data
 * @param {String} triggerType - 'Heavy Rainfall', 'Severe AQI', etc.
 * @param {Number} latitude
 * @param {Number} longitude
 * @returns {Promise<{isValid: boolean, confidence: number, data: Object}>}
 */
export const validateClaimAgainstWeather = async (triggerType, latitude, longitude) => {
  try {
    const { data } = await api.post('/validate-claim', {
      triggerType,
      latitude,
      longitude
    });
    return data;
  } catch (err) {
    console.error('Failed to validate claim:', err);
    throw err;
  }
};

/**
 * Get live triggers/alerts for user's current location
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Array>}
 */
export const getLiveTriggersForLocation = async (latitude, longitude) => {
  try {
    const { data } = await api.get('/triggers/live-location', {
      params: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    });
    return data;
  } catch (err) {
    console.error('Failed to fetch live triggers:', err);
    throw err;
  }
};

/**
 * Format weather data for display
 */
export const formatWeatherDisplay = (weather) => {
  return {
    temp: `${Math.round(weather.temp)}°C`,
    condition: weather.weather?.[0]?.main || 'N/A',
    humidity: `${weather.humidity}%`,
    windSpeed: `${Math.round(weather.wind_speed * 3.6)} km/h`,
    feelsLike: `${Math.round(weather.feels_like)}°C`
  };
};

/**
 * Format AQI data for display
 */
export const formatAQIDisplay = (aqi) => {
  let aqiLevel = 'Good';
  let aqiColor = '#00C49F';
  
  if (aqi.aqi >= 5) {
    aqiLevel = 'Hazardous';
    aqiColor = '#8B0000';
  } else if (aqi.aqi >= 4) {
    aqiLevel = 'Very Unhealthy';
    aqiColor = '#FF4444';
  } else if (aqi.aqi >= 3) {
    aqiLevel = 'Unhealthy';
    aqiColor = '#FF6B35';
  } else if (aqi.aqi >= 2) {
    aqiLevel = 'Moderate';
    aqiColor = '#FFD166';
  } else if (aqi.aqi >= 1) {
    aqiLevel = 'Acceptable';
    aqiColor = '#FFD166';
  }
  
  return {
    level: aqiLevel,
    color: aqiColor,
    pm25: aqi.pm25 || 'N/A',
    pm10: aqi.pm10 || 'N/A'
  };
};
