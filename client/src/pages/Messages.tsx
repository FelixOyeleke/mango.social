import { useState, useEffect } from 'react';
import { MessageCircle, Search, Edit, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import FollowingListSidebar from '../components/messaging/FollowingListSidebar';
import axios from 'axios';

interface Participant {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface LastMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  title?: string;
  is_group: boolean;
  participants: Participant[];
  last_message?: LastMessage;
  unread_count: number;
  updated_at: string;
}

export default function Messages() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFollowingSidebar, setShowFollowingSidebar] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/messages/conversations');
      setConversations(response.data.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (userId: string) => {
    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => {
        if (conv.is_group) return false;
        return conv.participants.some(p => p.id === userId);
      });

      if (existingConversation) {
        // Select existing conversation
        setSelectedConversationId(existingConversation.id);
        setShowFollowingSidebar(false);
      } else {
        // Create new conversation
        const response = await axios.post('/api/messages/conversations', {
          participant_ids: [userId],
          is_group: false
        });

        const newConversation = response.data.data.conversation;
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversationId(newConversation.id);
        setShowFollowingSidebar(false);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const otherParticipant = conv.participants?.find(p => p.id !== user?.id);
    const name = conv.is_group ? conv.title : otherParticipant?.full_name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const getConversationName = (conversation: Conversation) => {
    if (conversation.is_group) {
      return conversation.title || 'Group Chat';
    }
    const otherParticipant = conversation.participants?.find(p => p.id !== user?.id);
    return otherParticipant?.full_name || 'Unknown User';
  };

  useEffect(() => {
    const state = location.state as { conversationId?: string } | null;
    if (state?.conversationId) {
      setSelectedConversationId(state.conversationId);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className={`border-r border-gray-200 dark:border-gray-800 flex flex-col ${selectedConversationId ? 'hidden lg:flex' : 'flex'}`}>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-primary-600" />
                    Messages
                  </h2>
                  <button
                    onClick={() => setShowFollowingSidebar(!showFollowingSidebar)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="New message"
                  >
                    {showFollowingSidebar ? (
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Search - only show when not showing following sidebar */}
                {!showFollowingSidebar && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Conversations or Following List */}
              <div className="flex-1 overflow-hidden">
                {showFollowingSidebar ? (
                  <FollowingListSidebar onStartConversation={handleStartConversation} />
                ) : loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary-600 border-t-transparent"></div>
                  </div>
                ) : (
                  <ConversationList
                    conversations={filteredConversations}
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={setSelectedConversationId}
                    currentUserId={user?.id || ''}
                  />
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className={`lg:col-span-2 ${selectedConversationId ? 'block' : 'hidden lg:block'}`}>
              {selectedConversation ? (
                <ChatWindow
                  conversationId={selectedConversation.id}
                  conversationName={getConversationName(selectedConversation)}
                  currentUserId={user?.id || ''}
                  onBack={() => setSelectedConversationId(undefined)}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-950">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
