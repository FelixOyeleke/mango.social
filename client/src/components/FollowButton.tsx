import { useState, useEffect } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface FollowButtonProps {
  userId: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  userId,
  variant = 'primary',
  size = 'md',
  showIcon = true,
  onFollowChange
}: FollowButtonProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated && userId && user?.id !== userId) {
      checkFollowStatus();
    } else {
      setChecking(false);
    }
  }, [userId, isAuthenticated, user?.id]);

  const checkFollowStatus = async () => {
    try {
      setChecking(true);
      const response = await axios.get(`/api/follows/${userId}/check`);
      setIsFollowing(response.data.data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.id === userId) {
      return; // Can't follow yourself
    }

    try {
      setLoading(true);
      
      if (isFollowing) {
        await axios.delete(`/api/follows/${userId}/follow`);
        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        await axios.post(`/api/follows/${userId}/follow`);
        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      alert(error.response?.data?.error || 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button for own profile
  if (!isAuthenticated || user?.id === userId) {
    return null;
  }

  if (checking) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 rounded-lg font-semibold transition-all opacity-50 cursor-not-allowed ${getSizeClasses(size)} ${getVariantClasses(variant, false)}`}
      >
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`flex items-center gap-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getSizeClasses(size)} ${getVariantClasses(variant, isFollowing)}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {showIcon && (isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
          {isFollowing ? 'Following' : 'Follow'}
        </>
      )}
    </button>
  );
}

function getSizeClasses(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs';
    case 'md':
      return 'px-4 py-2 text-sm';
    case 'lg':
      return 'px-5 py-2.5 text-base';
  }
}

function getVariantClasses(variant: 'primary' | 'secondary', isFollowing: boolean): string {
  if (isFollowing) {
    // Following state - gray/subtle
    return 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600';
  }
  
  // Not following state
  if (variant === 'primary') {
    return 'bg-primary-600 text-white hover:bg-primary-700';
  } else {
    return 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700';
  }
}

