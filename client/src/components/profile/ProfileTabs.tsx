import { FileText, Heart, Image as ImageIcon } from 'lucide-react';

interface ProfileTabsProps {
  activeTab: 'posts' | 'replies' | 'media' | 'likes';
  onTabChange: (tab: 'posts' | 'replies' | 'media' | 'likes') => void;
  postsCount: number;
  repliesCount: number;
  likesCount: number;
}

export default function ProfileTabs({ 
  activeTab, 
  onTabChange, 
  postsCount, 
  repliesCount, 
  likesCount 
}: ProfileTabsProps) {
  const tabs = [
    { id: 'posts' as const, label: 'Posts', icon: FileText, count: postsCount },
    { id: 'replies' as const, label: 'Replies', icon: FileText, count: repliesCount },
    { id: 'media' as const, label: 'Media', icon: ImageIcon, count: 0 },
    { id: 'likes' as const, label: 'Likes', icon: Heart, count: likesCount },
  ];

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors relative ${
                isActive
                  ? 'text-white'
                  : 'text-gray-500 hover:bg-gray-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="text-xs text-gray-600">
                  {tab.count}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

