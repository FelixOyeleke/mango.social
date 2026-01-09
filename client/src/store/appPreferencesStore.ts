import { create } from 'zustand';
import axios from 'axios';

export interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  is_core: boolean;
  is_enabled: boolean;
  sort_order: number;
}

interface AppPreferencesState {
  apps: App[];
  enabledApps: Set<string>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchApps: () => Promise<void>;
  toggleApp: (appId: string, enabled: boolean) => Promise<void>;
  bulkUpdateApps: (preferences: { app_id: string; is_enabled: boolean }[]) => Promise<void>;
  isAppEnabled: (appId: string) => boolean;
  getEnabledApps: () => App[];
}

export const useAppPreferencesStore = create<AppPreferencesState>((set, get) => ({
  apps: [],
  enabledApps: new Set<string>(),
  isLoading: false,
  error: null,

  fetchApps: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/apps/preferences');
      const apps = response.data.data;

      const enabledApps = new Set(
        apps.filter((app: App) => app.is_enabled).map((app: App) => app.id)
      );

      set({
        apps,
        enabledApps,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Failed to fetch app preferences:', error);
      // Silently fail - app preferences are optional
      // Default to showing no optional apps if preferences can't be loaded
      set({
        apps: [],
        enabledApps: new Set(),
        error: null, // Don't show error to user
        isLoading: false
      });
    }
  },

  toggleApp: async (appId: string, enabled: boolean) => {
    const previousApps = get().apps;
    const previousEnabledApps = new Set(get().enabledApps);

    // Optimistic update
    const updatedApps = previousApps.map(app => 
      app.id === appId ? { ...app, is_enabled: enabled } : app
    );
    const newEnabledApps = new Set(previousEnabledApps);
    if (enabled) {
      newEnabledApps.add(appId);
    } else {
      newEnabledApps.delete(appId);
    }
    
    set({ apps: updatedApps, enabledApps: newEnabledApps });

    try {
      await axios.put(`/api/apps/preferences/${appId}`, { is_enabled: enabled });
    } catch (error: any) {
      // Revert on error
      set({ 
        apps: previousApps, 
        enabledApps: previousEnabledApps,
        error: error.response?.data?.error || 'Failed to update app preference'
      });
      throw error;
    }
  },

  bulkUpdateApps: async (preferences: { app_id: string; is_enabled: boolean }[]) => {
    const previousApps = get().apps;
    const previousEnabledApps = new Set(get().enabledApps);

    // Optimistic update
    const prefsMap = new Map(preferences.map(p => [p.app_id, p.is_enabled]));
    const updatedApps = previousApps.map(app => {
      const newEnabled = prefsMap.get(app.id);
      return newEnabled !== undefined ? { ...app, is_enabled: newEnabled } : app;
    });
    
    const newEnabledApps = new Set(
      updatedApps.filter(app => app.is_enabled).map(app => app.id)
    );
    
    set({ apps: updatedApps, enabledApps: newEnabledApps });

    try {
      const response = await axios.put('/api/apps/preferences', { preferences });
      const apps = response.data.data;
      const enabledApps = new Set(
        apps.filter((app: App) => app.is_enabled).map((app: App) => app.id)
      );
      set({ apps, enabledApps });
    } catch (error: any) {
      // Revert on error
      set({ 
        apps: previousApps, 
        enabledApps: previousEnabledApps,
        error: error.response?.data?.error || 'Failed to update app preferences'
      });
      throw error;
    }
  },

  isAppEnabled: (appId: string) => {
    const { enabledApps } = get();
    return enabledApps.has(appId);
  },

  getEnabledApps: () => {
    return get().apps.filter(app => app.is_enabled);
  },
}));

