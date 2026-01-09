import { create } from 'zustand';
import axios from 'axios';
import { UserLocation, requestLocationPermission, getStoredLocation, clearStoredLocation } from '../utils/locationService';

interface LocationState {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestLocation: (saveToBackend?: boolean) => Promise<void>;
  clearLocation: () => void;
  initializeLocation: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  isLoading: false,
  error: null,
  hasPermission: false,

  requestLocation: async (saveToBackend = true) => {
    set({ isLoading: true, error: null });
    try {
      const location = await requestLocationPermission();
      if (location) {
        set({ location, hasPermission: true, isLoading: false });

        // Save to backend if user is authenticated
        if (saveToBackend) {
          try {
            await axios.put('/api/users', {
              city: location.city,
              country: location.country,
              country_code: location.countryCode,
              latitude: location.latitude,
              longitude: location.longitude,
            });
          } catch (backendError) {
            console.error('Failed to save location to backend:', backendError);
            // Don't fail the whole operation if backend save fails
          }
        }
      } else {
        set({ error: 'Unable to get location', isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to get location',
        isLoading: false,
        hasPermission: false
      });
    }
  },

  clearLocation: () => {
    clearStoredLocation();
    set({ location: null, hasPermission: false, error: null });
  },

  initializeLocation: () => {
    const stored = getStoredLocation();
    if (stored) {
      set({ location: stored, hasPermission: true });
    }
  },
}));

