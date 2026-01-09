import { Link } from 'react-router-dom';
import StoryCard from '../StoryCard';
import { FileText, Heart, Image as ImageIcon } from 'lucide-react';

interface ProfileContentProps {
  activeTab: 'posts' | 'replies' | 'media' | 'likes';
  userStories: any[];
  userReplies: any[];
  likedStories: any[];
}

export default function ProfileContent({ 
  activeTab, 
  userStories, 
  userReplies, 
  likedStories 
}: ProfileContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        if (userStories.length === 0) {
          return (
            <div className="text-center py-16 border-b border-gray-200 dark:border-gray-800">
              <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Share your story with the community
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors"
              >
                Create your first post
              </Link>
            </div>
          );
        }
        return (
          <div className="space-y-0">
            {userStories.map((story: any) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        );

      case 'replies':
        if (userReplies.length === 0) {
          return (
            <div className="text-center py-16 border-b border-gray-200 dark:border-gray-800">
              <FileText className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No replies yet</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Start engaging with the community by replying to posts
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-0">
            {userReplies.map((reply: any) => (
              <article key={reply.id} className="border-b border-gray-200 dark:border-gray-800 py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer">
                <div className="flex gap-3">
                  {/* Avatar Column - EXACT match to StoryCard */}
                  <div className="flex-shrink-0">
                    <Link to={`/profile`}>
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold hover:opacity-80 transition-opacity">
                        {reply.user_avatar ? (
                          <img src={reply.user_avatar} alt={reply.user_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          reply.user_name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Content Column - EXACT match to StoryCard */}
                  <div className="flex-1 min-w-0">
                    {/* Header - EXACT match to StoryCard */}
                    <div className="flex items-baseline gap-2 mb-1">
                      <Link to={`/profile`} className="font-bold text-gray-900 dark:text-white hover:underline text-sm">
                        {reply.user_name || 'You'}
                      </Link>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">&middot;</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {new Date(reply.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Reply Context */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Replying to{' '}
                      <Link
                        to={`/stories/${reply.story_slug}`}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium"
                      >
                        {reply.story_title}
                      </Link>
                    </div>

                    {/* Content - EXACT match to StoryCard */}
                    <p className="text-[15px] text-gray-900 dark:text-white leading-normal whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        );

      case 'media':
        return (
          <div className="text-center py-16 border-b border-gray-200 dark:border-gray-800">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No media yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Photos and videos you post will appear here
            </p>
          </div>
        );

      case 'likes':
        if (likedStories.length === 0) {
          return (
            <div className="text-center py-16 border-b border-gray-200 dark:border-gray-800">
              <Heart className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No likes yet</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Posts you like will appear here
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-0">
            {likedStories.map((story: any) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-black">
      {renderContent()}
    </div>
  );
}

