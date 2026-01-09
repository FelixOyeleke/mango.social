import { Link } from 'react-router-dom';
import { Edit, Bookmark, Briefcase, Users, Calendar, Heart, ShoppingBag, BookOpen } from 'lucide-react';
import { useAppPreferencesStore } from '../../store/appPreferencesStore';

// Map app IDs to icons and routes
const appConfig: Record<string, { icon: any; to: string; color: string }> = {
  jobs: { icon: Briefcase, to: '/jobs', color: 'text-primary-500' },
  dating: { icon: Heart, to: '/dating', color: 'text-primary-500' },
  marketplace: { icon: ShoppingBag, to: '/marketplace', color: 'text-primary-500' },
  resources: { icon: BookOpen, to: '/resources', color: 'text-primary-500' },
  events: { icon: Calendar, to: '/events', color: 'text-primary-500' },
  communities: { icon: Users, to: '/communities', color: 'text-primary-500' },
};

export default function QuickActionsWidget() {
  const { getEnabledApps } = useAppPreferencesStore();

  // Core actions (always visible)
  const coreActions = [
    { icon: Edit, label: 'Create Post', to: '/create-story', color: 'text-primary-500' },
    { icon: Bookmark, label: 'Bookmarks', to: '/bookmarks', color: 'text-primary-500' },
  ];

  // Get enabled apps from store and convert to actions
  const enabledApps = getEnabledApps();
  const appActions = enabledApps
    .filter(app => !app.is_core && appConfig[app.id]) // Exclude core apps and apps without config
    .map(app => ({
      icon: appConfig[app.id].icon,
      label: app.name,
      to: appConfig[app.id].to,
      color: appConfig[app.id].color,
    }));

  // Combine core + app actions
  const allActions = [...coreActions, ...appActions];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Quick Actions</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2">
          {allActions.slice(0, 6).map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <action.icon className={`w-6 h-6 ${action.color}`} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

