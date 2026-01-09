import { HeartHandshake, Briefcase, ShoppingBag, BookOpen, Calendar, Users } from 'lucide-react';
import { useAppPreferencesStore } from '../../store/appPreferencesStore';

const appIcons: Record<string, any> = {
  dating: HeartHandshake,
  jobs: Briefcase,
  marketplace: ShoppingBag,
  resources: BookOpen,
  events: Calendar,
  communities: Users,
};

const appBlurbs: Record<string, string> = {
  dating: 'Connections & matches',
  jobs: 'Opportunities & hiring',
  marketplace: 'Buy, sell, trade',
  resources: 'Guides & learning',
  events: 'Meetups & activities',
  communities: 'Groups & networks',
};

export default function CommunityStatsWidget() {
  const { getEnabledApps } = useAppPreferencesStore();

  // Get enabled apps from the store (excludes core apps like forum and messaging)
  const enabledApps = getEnabledApps().filter(app =>
    !app.is_core && appIcons[app.id]
  );

  // Don't render the widget if no apps are enabled
  if (enabledApps.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Apps</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {enabledApps.map((app) => {
            const Icon = appIcons[app.id];
            const blurb = appBlurbs[app.id] || app.description;

            return (
              <div key={app.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary-600/10 dark:bg-primary-600/20 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">
                  {app.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                  {blurb}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
