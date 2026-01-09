import { Flame, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';

export default function TrendingWidget() {
  const { data, isLoading } = useQuery('trending-hashtags', async () => {
    const response = await axios.get('/api/hashtags/trending');
    return response.data.data.hashtags;
  });

  const trendingHashtags = data || [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Trending Topics</h3>
        </div>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
          </div>
        ) : trendingHashtags.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No trending hashtags yet</p>
        ) : (
          <div className="space-y-3">
            {trendingHashtags.map((hashtag: any, index: number) => (
            <Link
              key={hashtag.name}
              to={`/hashtag/${hashtag.name}`}
              className="block group"
            >
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {hashtag.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span>{hashtag.usage_count} {hashtag.usage_count === 1 ? 'post' : 'posts'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          </div>
        )}
      </div>
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <Link
          to="/forum/trending"
          className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          View all trending topics
        </Link>
      </div>
    </div>
  );
}

