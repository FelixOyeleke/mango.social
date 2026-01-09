import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { MessageSquare, TrendingUp, Clock, X, UserCheck, Home } from 'lucide-react';
import StoryCard from '../components/StoryCard';
import CreatePostModal from '../components/CreatePostModal';
import UserProfileWidget from '../components/widgets/UserProfileWidget';
import QuickActionsWidget from '../components/widgets/QuickActionsWidget';
import TrendingWidget from '../components/widgets/TrendingWidget';
import SuggestedUsersWidget from '../components/widgets/SuggestedUsersWidget';
import CommunityStatsWidget from '../components/widgets/CommunityStatsWidget';
import MessagingWidget from '../components/widgets/MessagingWidget';
import LocationPrompt from '../components/LocationPrompt';
import LoadingSpinner from '../components/LoadingSpinner';

interface Story {
  id: string;
  author_id: string;
  title: string;
  excerpt: string;
  content: string;
  author_name: string;
  author_avatar: string;
  author_city?: string;
  author_country?: string;
  category: string;
  featured_image_url?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  published_at: string;
  slug: string;
}

export default function Forum() {
  const { isAuthenticated } = useAuthStore();
  const [filter, setFilter] = useState<'your-feed' | 'trending' | 'recent' | 'following'>('your-feed');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  const tagQuery = searchParams.get('tag') || '';

  const queryKey = useMemo(() => ['stories', filter, searchQuery, tagQuery], [filter, searchQuery, tagQuery]);

  const { data, isLoading } = useQuery<{ stories: Story[] }>(
    queryKey,
    async () => {
      const response = await axios.get('/api/stories', {
        params: {
          filter: filter,
          search: searchQuery || undefined,
          tag: tagQuery || undefined,
        },
      });
      return response.data.data;
    },
    {
      enabled: filter !== 'following' || isAuthenticated, // Don't fetch if following and not authenticated
    }
  );

  const stories = useMemo(() => {
    const list = data?.stories || [];
    if (!searchQuery) return list;
    return list.filter(
      (story) =>
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.author_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        {/* Sign-in Banner for non-authenticated users */}
        {!isAuthenticated && showBanner && (
          <div className="bg-gray-900 border-b border-gray-800">
            <div className="max-w-[1400px] mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-white" />
                  <p className="text-white text-sm font-medium">
                    Join Mango to post, comment, and connect with people worldwide
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-1.5 text-white hover:bg-white/10 rounded-full font-semibold text-sm transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 bg-white text-primary-600 hover:bg-gray-100 rounded-full font-semibold text-sm transition-colors"
                  >
                    Sign up
                  </Link>
                  <button
                    onClick={() => setShowBanner(false)}
                    className="p-1 text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Container */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sidebar - Hidden on mobile */}
            <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-4">
              <UserProfileWidget />
              <QuickActionsWidget />
              <CommunityStatsWidget />
            </aside>

            {/* Main Feed */}
            <main className="lg:col-span-6">
              {/* Sticky Header */}
              <div className="sticky top-16 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-t-lg">
                {/* Create Post */}
                {isAuthenticated && (
                  <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="w-full flex items-center gap-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-full px-4 py-2.5 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="flex-1 text-gray-500 dark:text-gray-400 text-sm">
                        What's on your mind?
                      </span>
                    </button>
                  </div>
                )}

                {/* Filter Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 justify-around">
                      <button
                        onClick={() => setFilter('your-feed')}
                        className={`flex items-center justify-center gap-2 flex-1 py-4 font-semibold text-sm transition-all relative ${
                          filter === 'your-feed'
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline">Your Feed</span>
                        <span className="sm:hidden">Feed</span>
                        {filter === 'your-feed' && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>
                        )}
                      </button>
                      <button
                        onClick={() => setFilter('trending')}
                        className={`flex items-center justify-center gap-2 flex-1 py-4 font-semibold text-sm transition-all relative ${
                          filter === 'trending'
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        Trending
                        {filter === 'trending' && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>
                        )}
                      </button>
                      <button
                        onClick={() => setFilter('recent')}
                        className={`flex items-center justify-center gap-2 flex-1 py-4 font-semibold text-sm transition-all relative ${
                          filter === 'recent'
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        Recent
                        {filter === 'recent' && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>
                        )}
                      </button>
                      <button
                        onClick={() => setFilter('following')}
                        className={`flex items-center justify-center gap-2 flex-1 py-4 font-semibold text-sm transition-all relative ${
                          filter === 'following'
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        Following
                        {filter === 'following' && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Feed Content */}
              <div className="bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-800 rounded-b-lg">
                {/* Stories Feed */}
                {filter === 'following' && !isAuthenticated ? (
                  <div className="text-center py-12 border-t border-gray-200 dark:border-gray-800">
                    <UserCheck className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Sign in to see Following feed
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Follow people to see their posts in your personalized feed
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        to="/login"
                        className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full font-semibold text-sm transition-colors"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/register"
                        className="px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-full font-semibold text-sm transition-colors"
                      >
                        Sign up
                      </Link>
                    </div>
                  </div>
                ) : isLoading ? (
                  <LoadingSpinner />
                ) : stories.length === 0 ? (
                  <div className="text-center py-12 border-t border-gray-200 dark:border-gray-800">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {searchQuery ? 'No results found' : 'No stories yet'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {searchQuery ? 'Try another name, keyword, or tag.' : 'Be the first to share your journey!'}
                    </p>
                  </div>
                ) : (
                  <div>
                    {stories.map((story) => <StoryCard key={story.id} story={story} />)}
                  </div>
                )}
              </div>
            </main>

            {/* Right Sidebar - Hidden on mobile */}
            <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-4">
              <TrendingWidget />
              <SuggestedUsersWidget />
            </aside>
          </div>
        </div>
      </div>

      {/* Messaging Widget */}
      <MessagingWidget />

      {/* Location Prompt */}
      <LocationPrompt />

      {/* Create Post Modal */}
      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
}
