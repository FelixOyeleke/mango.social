import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Search as SearchIcon, Hash, User, FileText, ArrowLeft } from 'lucide-react';
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

interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

interface Hashtag {
  name: string;
  usage_count: number;
}

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'posts' | 'hashtags' | 'users'>('posts');

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  // Fetch stories
  const { data: storiesData, isLoading: storiesLoading } = useQuery<{ stories: Story[] }>(
    ['search-stories', initialQuery],
    async () => {
      if (!initialQuery) return { stories: [] };
      const response = await axios.get(`/api/stories?search=${encodeURIComponent(initialQuery)}`);
      return response.data.data;
    },
    { enabled: !!initialQuery }
  );

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery<User[]>(
    ['search-users', initialQuery],
    async () => {
      if (!initialQuery) return [];
      const response = await axios.get(`/api/users/search?q=${encodeURIComponent(initialQuery)}`);
      return response.data.data.users;
    },
    { enabled: !!initialQuery }
  );

  // Fetch hashtags
  const { data: hashtagsData, isLoading: hashtagsLoading } = useQuery<Hashtag[]>(
    ['search-hashtags', initialQuery],
    async () => {
      if (!initialQuery) return [];
      const response = await axios.get(`/api/hashtags/search?q=${encodeURIComponent(initialQuery)}`);
      return response.data.data.hashtags;
    },
    { enabled: !!initialQuery }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const stories = storiesData?.stories || [];
  const users = usersData || [];
  const hashtags = hashtagsData || [];

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

        {/* Search Header */}
        <div className="card mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Search</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for posts, hashtags, or people..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              autoFocus
            />
          </form>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'posts'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Posts</span>
              </div>
              {activeTab === 'posts' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('hashtags')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'hashtags'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span>Hashtags</span>
              </div>
              {activeTab === 'hashtags' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'users'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>People</span>
              </div>
              {activeTab === 'users' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          {activeTab === 'posts' && (
            <>
              {storiesLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : stories.length === 0 ? (
                <div className="card text-center py-12">
                  <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {initialQuery ? 'No posts found' : 'Start searching'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {initialQuery ? 'Try different keywords' : 'Enter a search term to find posts'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'hashtags' && (
            <>
              {hashtagsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : hashtags.length === 0 ? (
                <div className="card text-center py-12">
                  <Hash className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {initialQuery ? 'No hashtags found' : 'Start searching'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {initialQuery ? 'Try different keywords' : 'Enter a search term to find hashtags'}
                  </p>
                </div>
              ) : (
                <div className="card">
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {hashtags.map((hashtag) => (
                      <Link
                        key={hashtag.name}
                        to={`/hashtag/${hashtag.name}`}
                        className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-600/10 flex items-center justify-center">
                              <Hash className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                #{hashtag.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {hashtag.usage_count} {hashtag.usage_count === 1 ? 'post' : 'posts'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'users' && (
            <>
              {usersLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : users.length === 0 ? (
                <div className="card text-center py-12">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {initialQuery ? 'No users found' : 'Start searching'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {initialQuery ? 'Try different keywords' : 'Enter a search term to find people'}
                  </p>
                </div>
              ) : (
                <div className="card">
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {users.map((user) => (
                      <Link
                        key={user.id}
                        to={`/users/${user.id}`}
                        className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              user.full_name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {user.full_name}
                            </div>
                            {user.bio && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {user.bio}
                              </div>
                            )}
                            {(user.followers_count !== undefined || user.following_count !== undefined) && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {user.followers_count || 0} followers · {user.following_count || 0} following
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

