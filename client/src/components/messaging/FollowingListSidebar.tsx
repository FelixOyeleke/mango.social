import { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Users, Loader, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
}

interface FollowingListSidebarProps {
  onStartConversation: (userId: string) => void;
}

export default function FollowingListSidebar({ onStartConversation }: FollowingListSidebarProps) {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: followingData, isLoading } = useQuery(
    ['following-list', user?.id],
    async () => {
      if (!user?.id) return [];
      const response = await axios.get(`/api/follows/${user.id}/following`);
      return response.data.data.following || [];
    },
    {
      enabled: !!user?.id
    }
  );

  const following: User[] = followingData || [];

  const filteredFollowing = following.filter(u =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-primary-600" />
          Following ({following.length})
        </h3>
        
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search following..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
      </div>

      {/* Following List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : filteredFollowing.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No users found' : 'Not following anyone yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredFollowing.map((followedUser) => (
              <div
                key={followedUser.id}
                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
              >
                {/* Avatar */}
                <Link to={`/users/${followedUser.id}`} className="flex-shrink-0">
                  {followedUser.avatar_url ? (
                    <img
                      src={followedUser.avatar_url}
                      alt={followedUser.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold">
                      {followedUser.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/users/${followedUser.id}`}>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white hover:underline truncate">
                      {followedUser.full_name}
                    </h4>
                  </Link>
                  {followedUser.username && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      @{followedUser.username}
                    </p>
                  )}
                </div>

                {/* Message Button */}
                <button
                  onClick={() => onStartConversation(followedUser.id)}
                  className="flex-shrink-0 p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors group"
                  title="Send message"
                >
                  <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
