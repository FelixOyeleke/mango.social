import { useQuery } from 'react-query';
import axios from 'axios';
import StoryCard from '../components/StoryCard';
import { Bookmark } from 'lucide-react';

export default function Bookmarks() {
  const { data, isLoading } = useQuery('bookmarks', async () => {
    const response = await axios.get('/api/bookmarks');
    return response.data.data.bookmarks;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center gap-3 mb-12">
          <Bookmark className="w-8 h-8 text-primary-600" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Saved Stories
          </h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-6">
            {data.map((bookmark: any) => (
              <StoryCard key={bookmark.id} story={bookmark} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <Bookmark className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookmarks yet</h3>
            <p className="text-gray-600 dark:text-gray-400">Start saving stories you love!</p>
          </div>
        )}
      </div>
    </div>
  );
}

