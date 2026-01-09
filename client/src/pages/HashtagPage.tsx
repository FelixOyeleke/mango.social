import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Hash, ArrowLeft, TrendingUp } from 'lucide-react';
import StoryCard from '../components/StoryCard';
import LoadingSpinner from '../components/LoadingSpinner';

interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  category: string;
  featured_image_url?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  reposts_count?: number;
  published_at: string;
  slug: string;
  is_liked_by_user?: boolean;
  is_bookmarked_by_user?: boolean;
  is_reposted_by_user?: boolean;
}

interface HashtagData {
  name: string;
  usage_count: number;
  created_at: string;
}

export default function HashtagPage() {
  const { hashtag } = useParams<{ hashtag: string }>();

  // Fetch hashtag details
  const { data: hashtagData } = useQuery<{ hashtag: HashtagData }>(
    ['hashtag', hashtag],
    async () => {
      const response = await axios.get(`/api/hashtags/${hashtag}`);
      return response.data.data;
    },
    { enabled: !!hashtag }
  );

  // Fetch stories with this hashtag
  const { data: storiesData, isLoading } = useQuery<{ stories: Story[] }>(
    ['hashtag-stories', hashtag],
    async () => {
      const response = await axios.get(`/api/hashtags/${hashtag}/stories`);
      return response.data.data;
    },
    { enabled: !!hashtag }
  );

  const stories = storiesData?.stories || [];
  const hashtagInfo = hashtagData?.hashtag;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link
          to="/forum"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <main className="lg:col-span-8">
            {/* Hashtag Header */}
            <div className="card mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                  <Hash className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    #{hashtag}
                  </h1>
                  {hashtagInfo && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {hashtagInfo.usage_count.toLocaleString()} {hashtagInfo.usage_count === 1 ? 'post' : 'posts'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stories */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : stories.length === 0 ? (
              <div className="card text-center py-12">
                <Hash className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to post with #{hashtag}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="card sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  About this hashtag
                </h2>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Hashtag</p>
                  <p className="font-semibold text-gray-900 dark:text-white">#{hashtag}</p>
                </div>
                {hashtagInfo && (
                  <>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Total Posts</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {hashtagInfo.usage_count.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-1">First Used</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(hashtagInfo.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

