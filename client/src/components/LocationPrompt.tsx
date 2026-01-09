import { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { useLocationStore } from '../store/locationStore';

export default function LocationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { location, requestLocation, isLoading, initializeLocation } = useLocationStore();

  useEffect(() => {
    // Initialize location from storage on mount
    initializeLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Show prompt if no location is set and user hasn't dismissed it
    const dismissed = localStorage.getItem('locationPromptDismissed');
    if (!location && !dismissed) {
      // Show prompt after 2 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleAllow = async () => {
    await requestLocation();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('locationPromptDismissed', 'true');
  };

  if (!showPrompt || location) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-600/10 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Enable Location
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Get personalized content and connect with people near you
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAllow}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Getting location...' : 'Allow'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium text-sm transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

