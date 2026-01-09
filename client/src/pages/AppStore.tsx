import { useEffect, useState } from 'react';
import { useAppPreferencesStore, App } from '../store/appPreferencesStore';
import {
  Heart, Briefcase, BookOpen, ShoppingBag, Loader2, AlertCircle, X
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Heart,
  Briefcase,
  BookOpen,
  ShoppingBag,
};

export default function AppStore() {
  const { apps, isLoading, error, fetchApps, toggleApp } = useAppPreferencesStore();
  const [togglingApps, setTogglingApps] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleToggle = async (appId: string, currentEnabled: boolean) => {
    setTogglingApps(prev => new Set(prev).add(appId));
    try {
      await toggleApp(appId, !currentEnabled);
    } catch (error) {
      console.error('Failed to toggle app:', error);
    } finally {
      setTogglingApps(prev => {
        const newSet = new Set(prev);
        newSet.delete(appId);
        return newSet;
      });
    }
  };

  // Filter to only show actual apps (not core features)
  const actualApps = apps.filter(app => !app.is_core);
  const enabledApps = actualApps.filter(app => app.is_enabled);

  if (isLoading && apps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading apps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Simple Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            App Preferences
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enable or disable optional apps. Core features like Feed, Communities, Events, and Messaging are always available.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-400 mb-1">Error</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Active Apps or Empty State */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Apps</h2>

            {enabledApps.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {enabledApps.map((app) => {
                  const Icon = iconMap[app.icon] || Heart;
                  const isToggling = togglingApps.has(app.id);

                  return (
                    <button
                      key={app.id}
                      onClick={() => handleToggle(app.id, app.is_enabled)}
                      disabled={isToggling}
                      className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-red-500 dark:hover:border-red-500 transition-colors disabled:opacity-50"
                    >
                      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{app.name}</span>
                      {isToggling ? (
                        <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
                      ) : (
                        <X className="w-3 h-3 text-gray-400 group-hover:text-red-500 transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No apps enabled - Enable apps below to see them here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* All Apps */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Apps</h2>
          </div>

          {actualApps.map((app) => {
            const Icon = iconMap[app.icon] || Heart;
            const isToggling = togglingApps.has(app.id);

            return (
              <div key={app.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{app.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{app.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(app.id, app.is_enabled)}
                  disabled={isToggling}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50
                    ${app.is_enabled
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                    }
                  `}
                >
                  {isToggling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : app.is_enabled ? (
                    'Disable'
                  ) : (
                    'Enable'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
