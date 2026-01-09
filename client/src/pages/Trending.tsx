import { useQuery } from 'react-query';
import axios from 'axios';
import { Flame, TrendingUp, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import StoryCard from '../components/StoryCard';
import UserProfileWidget from '../components/widgets/UserProfileWidget';
import SuggestedUsersWidget from '../components/widgets/SuggestedUsersWidget';

export default function Trending() {
  const { data: trendingStories, isLoading: loadingStories } = useQuery('trending-stories', async () => {
    const response = await axios.get('/api/stats/trending-stories?limit=20');
    return response.data.data.stories;
  });

  const { data: trendingHashtags, isLoading: loadingHashtags } = useQuery('trending-hashtags', async () => {
    const response = await axios.get('/api/hashtags/trending?limit=15');
    return response.data.data.hashtags;
  });

  const stories = trendingStories || [];
  const hashtags = trendingHashtags || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              <UserProfileWidget />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Now</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Most popular posts and topics this week
                  </p>
                </div>
              </div>
            </div>

            {/* Trending Hashtags Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Trending Hashtags</h2>
              </div>

              {loadingHashtags ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
                </div>
              ) : hashtags.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No trending hashtags yet</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hashtags.map((hashtag: any, index: number) => (
                    <Link
                      key={hashtag.name}
                      to={`/hashtag/${hashtag.name}`}
                      className="group p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-600 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex items-center gap-1">
                            <Hash className="w-4 h-4 text-gray-400" />
                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {hashtag.name}
                            </span>
                          </div>
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {hashtag.usage_count} {hashtag.usage_count === 1 ? 'post' : 'posts'}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Trending Posts Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Trending Posts</h2>
                </div>
              </div>

              {loadingStories ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
                </div>
              ) : stories.length === 0 ? (
                <div className="text-center py-12">
                  <Flame className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No trending posts yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {stories.map((story: any) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              <SuggestedUsersWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

