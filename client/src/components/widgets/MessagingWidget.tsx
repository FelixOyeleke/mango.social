import { useState, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

interface Conversation {
  id: string;
  title?: string;
  is_group: boolean;
  participants: any[];
  last_message?: any;
  unread_count: number;
  updated_at: string;
}

export default function MessagingWidget() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      // Poll for new messages every 10 seconds
      const interval = setInterval(fetchConversations, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations');
      const convs = response.data.data.conversations;
      setConversations(convs.slice(0, 3)); // Show only 3 recent
      const unread = convs.reduce((sum: number, conv: Conversation) => sum + conv.unread_count, 0);
      setTotalUnread(unread);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.is_group) {
      return conversation.title || 'Group Chat';
    }
    const otherParticipant = conversation.participants?.find(p => p.id !== user?.id);
    return otherParticipant?.full_name || 'Unknown User';
  };

  const handleConversationClick = (conversationId: string) => {
    navigate('/messages', { state: { conversationId } });
    setIsOpen(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all flex items-center justify-center group z-50"
      >
        <MessageCircle className="w-6 h-6" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 transition-all ${isMinimized ? 'h-14' : 'h-96'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">Messages</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-primary-700 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-primary-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat List */}
          <div className="overflow-y-auto h-64 border-b border-gray-200 dark:border-gray-800">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const name = getConversationName(conversation);
                const lastMsg = conversation.last_message;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {name}
                        </h4>
                        {lastMsg && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(lastMsg.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {lastMsg?.content || 'No messages yet'}
                        </p>
                        {conversation.unread_count > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* View All Messages */}
          <div className="p-3">
            <button
              onClick={() => {
                navigate('/messages');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              View All Messages
            </button>
          </div>
        </>
      )}
    </div>
  );
}
