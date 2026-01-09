import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useQuery } from 'react-query';
import axios from 'axios';
import FollowListModal from '../components/FollowListModal';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import ProfileContent from '../components/profile/ProfileContent';
import CompletionBanner from '../components/profile/CompletionBanner';

export default function Profile() {
  const { user, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts');
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');

  // Fetch user's stories
  const { data: storiesData } = useQuery('user-stories', async () => {
    const response = await axios.get(`/api/users/${user?.id}/stories`);
    return response.data.data;
  });

  // Fetch user's replies/comments
  const { data: repliesData } = useQuery(
    'user-replies',
    async () => {
      const response = await axios.get(`/api/comments/user/${user?.id}`);
      return response.data.data;
    },
    { enabled: !!user?.id }
  );

  // Fetch user's liked stories
  const { data: likedData } = useQuery('user-likes', async () => {
    const response = await axios.get('/api/users/me/likes');
    return response.data.data;
  });

  const userStories = storiesData?.stories || [];
  const userReplies = repliesData?.comments || [];
  const likedStories = likedData?.stories || [];

  const isProfileIncomplete = !user?.bio || !user?.location || !user?.avatar_url;

  const handleOpenFollowModal = (type: 'followers' | 'following') => {
    setFollowModalType(type);
    setFollowModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1400px] mx-auto">
        <CompletionBanner isIncomplete={isProfileIncomplete} />

        <ProfileHeader
          user={user}
          onAvatarUpdate={checkAuth}
          onBannerUpdate={checkAuth}
          onOpenFollowModal={handleOpenFollowModal}
        />

        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          postsCount={userStories.length}
          repliesCount={userReplies.length}
          likesCount={likedStories.length}
        />

        <ProfileContent
          activeTab={activeTab}
          userStories={userStories}
          userReplies={userReplies}
          likedStories={likedStories}
        />
      </div>

      {/* Follow List Modal */}
      {user && (
        <FollowListModal
          isOpen={followModalOpen}
          onClose={() => setFollowModalOpen(false)}
          userId={user.id}
          type={followModalType}
        />
      )}
    </div>
  );
}
