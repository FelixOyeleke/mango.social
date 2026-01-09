import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { useState } from 'react';

interface SendMessageButtonProps {
  userId: string;
  userName: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export default function SendMessageButton({ 
  userId, 
  userName, 
  variant = 'primary',
  size = 'md' 
}: SendMessageButtonProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.id === userId) {
      return; // Can't message yourself
    }

    try {
      setLoading(true);
      await axios.post('/api/messages/conversations', {
        user_id: userId
      });

      // Navigate to messages page
      navigate('/messages');
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      const errorMessage = error.response?.data?.error || 'Failed to start conversation';

      if (error.response?.status === 403) {
        alert(`Cannot message ${userName}. You can only message users who follow you back. Both users must follow each other.`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.id === userId) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
  };

  return (
    <button
      onClick={handleSendMessage}
      disabled={loading}
      className={`flex items-center gap-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      <MessageCircle className="w-4 h-4" />
      {loading ? 'Loading...' : 'Message'}
    </button>
  );
}
