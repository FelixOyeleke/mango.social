import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import FollowButton from './FollowButton';
import { useAuthStore } from '../store/authStore';

interface User {
  id: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  followed_at: string;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

export default function FollowListModal({ isOpen, onClose, userId, type }: FollowListModalProps) {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const { isLoading, refetch } = useQuery(
    [`${type}-${userId}`, userId, type],
    async () => {
      const endpoint = type === 'followers' 
        ? `/api/follows/${userId}/followers`
        : `/api/follows/${userId}/following`;
      try {
        const response = await axios.get(endpoint);
        setErrorMessage('');
        return response.data.data[type];
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) {
          setErrorMessage('Sign in to view this list.');
        } else {
          setErrorMessage(err?.response?.data?.error || 'Unable to load list.');
        }
        return [];
      }
    },
    {
      enabled: isOpen,
      onSuccess: (data) => {
        setUsers(data || []);
      }
    }
  );

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  if (!isOpen) return null;

  const handleFollowChange = () => {
    // Refetch the list when follow status changes
    refetch();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {type === 'followers' ? 'Followers' : 'Following'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : errorMessage ? (
          <div className="text-center py-12 px-6 text-sm text-gray-500 dark:text-gray-400">
            {errorMessage}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </p>
          </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {users.map((user) => (
                <div key={user.id} className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {/* Avatar */}
                  <Link to={`/users/${user.id}`} onClick={onClose} className="flex-shrink-0">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.full_name} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg font-bold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/users/${user.id}`} onClick={onClose}>
                      <h3 className="font-bold text-gray-900 dark:text-white hover:underline">
                        {user.full_name}
                      </h3>
                    </Link>
                    {user.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  {/* Follow Button */}
                  {currentUser?.id !== user.id && (
                    <div className="flex-shrink-0">
                      <FollowButton 
                        userId={user.id} 
                        size="sm" 
                        onFollowChange={handleFollowChange}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
