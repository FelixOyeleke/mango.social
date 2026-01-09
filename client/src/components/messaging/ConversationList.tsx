import { MessageCircle } from 'lucide-react';

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

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  currentUserId: string;
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId
}: ConversationListProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.is_group) {
      return conversation.title || 'Group Chat';
    }
    const otherParticipant = conversation.participants?.find(p => p.id !== currentUserId);
    return otherParticipant?.full_name || 'Unknown User';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.is_group) {
      return null;
    }
    const otherParticipant = conversation.participants?.find(p => p.id !== currentUserId);
    return otherParticipant?.avatar_url;
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No conversations yet</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Start a conversation with someone!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conversation) => {
        const name = getConversationName(conversation);
        const avatar = getConversationAvatar(conversation);
        const isSelected = conversation.id === selectedConversationId;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-gray-100 dark:border-gray-800 ${
              isSelected
                ? 'bg-primary-50 dark:bg-primary-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
              {/* Online status indicator removed - will be implemented with real-time presence tracking */}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-semibold truncate ${
                  conversation.unread_count > 0
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {name}
                </h4>
                {conversation.last_message && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {formatTime(conversation.last_message.created_at)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xs truncate ${
                  conversation.unread_count > 0
                    ? 'text-gray-900 dark:text-white font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {conversation.last_message?.content || 'No messages yet'}
                </p>
                {conversation.unread_count > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

