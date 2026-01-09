import { Users } from 'lucide-react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import FollowButton from '../FollowButton';
import { useAuthStore } from '../../store/authStore';

export default function SuggestedUsersWidget() {
  const { user: currentUser } = useAuthStore();
  const [showAll, setShowAll] = useState(false);
  const limit = showAll ? 20 : 4;

  const { data, isLoading, refetch } = useQuery(
    ['suggested-users', limit],
    async () => {
      const response = await axios.get(`/api/stats/suggested-users?limit=${limit}`);
      return response.data.data.users;
    },
    { keepPreviousData: true }
  );

  const suggestedUsers = (data || []).filter(
    (u: any) => !currentUser || u.id !== currentUser.id
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">People to Follow</h3>
        </div>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
          </div>
        ) : suggestedUsers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No suggestions yet</p>
        ) : (
          <div className="space-y-3">
            {suggestedUsers.map((user: any) => (
              <div key={user.id} className="flex items-start gap-3">
                <Link to={`/users/${user.id}`} className="flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/users/${user.id}`}>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate hover:underline">
                      {user.name}
                    </h4>
                  </Link>
                  {user.bio && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                      {user.bio}
                    </p>
                  )}
                  {user.mutual > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {user.mutual} mutual connection{user.mutual !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <FollowButton userId={user.id} size="sm" showIcon={false} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => {
            setShowAll((prev) => !prev);
            refetch();
          }}
          className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          {showAll ? 'Show fewer suggestions' : 'See all suggestions'}
        </button>
      </div>
    </div>
  );
}
