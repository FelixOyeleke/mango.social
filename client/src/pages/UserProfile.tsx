import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { MapPin, Globe, Calendar, FileText, Heart, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import StoryCard from '../components/StoryCard';
import FollowButton from '../components/FollowButton';
import SendMessageButton from '../components/messaging/SendMessageButton';
import FollowListModal from '../components/FollowListModal';

export default function UserProfile() {
  const { userId, username } = useParams<{ userId?: string; username?: string }>();
  const identifier = userId || username; // Use whichever is provided
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');

  // Fetch user profile (works with both userId and username)
  const { data: userData, isLoading: loadingUser } = useQuery(['user-profile', identifier], async () => {
    const response = await axios.get(`/api/users/${identifier}`);
    const user = response.data.data.user;
    setFollowersCount(user.followers_count || 0);
    setFollowingCount(user.following_count || 0);
    return user;
  });

  // Fetch user's stories
  const { data: storiesData } = useQuery(['user-stories', identifier], async () => {
    const response = await axios.get(`/api/users/${identifier}/stories`);
    return response.data.data;
  });

  const user = userData;
  const userStories = storiesData?.stories || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleFollowChange = (isFollowing: boolean) => {
    setFollowersCount(prev => isFollowing ? prev + 1 : Math.max(0, prev - 1));
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">User not found</h2>
          <Link to="/forum" className="text-primary-400 hover:underline">Go back to forum</Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1400px] mx-auto">
        {/* Banner */}
        <div className="relative h-48 bg-gray-800">
          {user.banner_url && (
            <img src={user.banner_url} alt="Banner" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile Content */}
        <div className="bg-gray-900 border-b border-gray-800">
          <div className="px-4 pb-4">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-gray-900 bg-gray-700 flex items-center justify-center overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {user.full_name}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    @{user.username || user.email?.split('@')[0]}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {isOwnProfile ? (
                    <Link
                      to="/profile/edit"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold text-sm transition-colors"
                    >
                      Edit Profile
                    </Link>
                  ) : (
                    <>
                      <SendMessageButton userId={userId!} userName={user.full_name} variant="secondary" />
                      <FollowButton userId={userId!} onFollowChange={handleFollowChange} />
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-white mb-3 whitespace-pre-wrap">{user.bio}</p>
              )}

              {/* User Details */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 mb-3">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
                      {user.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {user.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(user.created_at)}</span>
                  </div>
                )}
              </div>

              {/* Following/Followers */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setFollowModalType('following');
                    setFollowModalOpen(true);
                  }}
                  className="hover:underline"
                >
                  <span className="font-bold text-white">{followingCount}</span>{' '}
                  <span className="text-gray-400">Following</span>
                </button>
                <button
                  onClick={() => {
                    setFollowModalType('followers');
                    setFollowModalOpen(true);
                  }}
                  className="hover:underline"
                >
                  <span className="font-bold text-white">{followersCount}</span>{' '}
                  <span className="text-gray-400">Followers</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 border-b border-gray-800">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-colors relative ${
                activeTab === 'posts'
                  ? 'text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Posts
              {activeTab === 'posts' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-colors relative ${
                activeTab === 'media'
                  ? 'text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Media
              {activeTab === 'media' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold text-sm transition-colors relative ${
                activeTab === 'likes'
                  ? 'text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <Heart className="w-4 h-4" />
              Likes
              {activeTab === 'likes' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-950">
          {activeTab === 'posts' && (
            <div className="max-w-2xl mx-auto">
              {userStories.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No posts yet</p>
                </div>
              ) : (
                userStories.map((story: any) => (
                  <StoryCard key={story.id} story={story} />
                ))
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Media posts will appear here</p>
            </div>
          )}

          {activeTab === 'likes' && (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Liked posts are private</p>
            </div>
          )}
        </div>
      </div>

      {/* Follow List Modal */}
      {userId && (
        <FollowListModal
          isOpen={followModalOpen}
          onClose={() => setFollowModalOpen(false)}
          userId={userId}
          type={followModalType}
        />
      )}
    </div>
  );
}
