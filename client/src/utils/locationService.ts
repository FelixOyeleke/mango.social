/**
 * Location Service
 * Handles user location detection and storage
 */

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  countryCode?: string;
  timestamp: number;
}

/**
 * Get user's current location using browser geolocation API
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    });
  });
};

/**
 * Get location details from coordinates using reverse geocoding
 * Using a free geocoding API
 */
export const getLocationDetails = async (
  latitude: number,
  longitude: number
): Promise<{ city?: string; country?: string; countryCode?: string }> => {
  try {
    // Using BigDataCloud's free reverse geocoding API (no API key required)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch location details');
    }

    const data = await response.json();
    
    return {
      city: data.city || data.locality || data.principalSubdivision,
      country: data.countryName,
      countryCode: data.countryCode,
    };
  } catch (error) {
    console.error('Error fetching location details:', error);
    return {};
  }
};

/**
 * Get and store user location
 */
export const getUserLocation = async (): Promise<UserLocation | null> => {
  try {
    const position = await getCurrentLocation();
    const { latitude, longitude } = position.coords;
    
    const details = await getLocationDetails(latitude, longitude);
    
    const location: UserLocation = {
      latitude,
      longitude,
      ...details,
      timestamp: Date.now(),
    };

    // Store in localStorage
    localStorage.setItem('userLocation', JSON.stringify(location));
    
    return location;
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
};

/**
 * Get stored location from localStorage
 */
export const getStoredLocation = (): UserLocation | null => {
  try {
    const stored = localStorage.getItem('userLocation');
    if (!stored) return null;
    
    const location: UserLocation = JSON.parse(stored);
    
    // Check if location is older than 24 hours
    const isOld = Date.now() - location.timestamp > 24 * 60 * 60 * 1000;
    if (isOld) {
      localStorage.removeItem('userLocation');
      return null;
    }
    
    return location;
  } catch (error) {
    console.error('Error reading stored location:', error);
    return null;
  }
};

/**
 * Request location permission and get location
 */
export const requestLocationPermission = async (): Promise<UserLocation | null> => {
  const stored = getStoredLocation();
  if (stored) return stored;
  
  return await getUserLocation();
};

/**
 * Clear stored location
 */
export const clearStoredLocation = () => {
  localStorage.removeItem('userLocation');
};

