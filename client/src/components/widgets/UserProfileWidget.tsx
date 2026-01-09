import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLocationStore } from '../../store/locationStore';
import { User, MapPin } from 'lucide-react';

export default function UserProfileWidget() {
  const { user, isAuthenticated } = useAuthStore();
  const { location } = useLocationStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 text-center py-6">
          <User className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Welcome!</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Join our community to share your story
          </p>
          <div className="space-y-2">
            <Link
              to="/login"
              className="block w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <Link to="/profile" className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white text-lg font-bold">
                {user.full_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white truncate text-[15px]">
              {user.full_name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              @{(user as any)?.username || user.email.split('@')[0]}
            </p>
            {location && (location.city || location.country) && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {location.city && location.country
                    ? `${location.city}, ${location.country}`
                    : location.city || location.country
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

