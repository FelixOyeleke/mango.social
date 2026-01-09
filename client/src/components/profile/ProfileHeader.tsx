import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe, Edit, Calendar, Twitter, Linkedin, Briefcase, Camera } from 'lucide-react';
import axios from 'axios';

interface ProfileHeaderProps {
  user: any;
  onAvatarUpdate: () => void;
  onBannerUpdate: () => void;
  onOpenFollowModal: (type: 'followers' | 'following') => void;
}

export default function ProfileHeader({ user, onAvatarUpdate, onBannerUpdate, onOpenFollowModal }: ProfileHeaderProps) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      await axios.post('/api/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onAvatarUpdate();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('banner', file);

      await axios.post('/api/users/banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onBannerUpdate();
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      {/* Banner */}
      <div className="h-48 bg-gray-800 relative group">
        {user?.banner_url && (
          <img src={user.banner_url} alt="Banner" className="w-full h-full object-cover" />
        )}
        <button
          onClick={() => bannerInputRef.current?.click()}
          disabled={uploadingBanner}
          className="absolute top-4 right-4 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          {uploadingBanner ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-5 h-5" />
          )}
        </button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          onChange={handleBannerUpload}
          className="hidden"
        />
      </div>

      {/* Profile Info */}
      <div className="px-4 lg:px-6">
        <div className="flex items-start justify-between -mt-16 mb-4">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-gray-900 flex items-center justify-center text-white text-4xl font-bold relative z-10">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-1 right-1 p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100"
            >
              {uploadingAvatar ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* Edit Button */}
          <Link
            to="/profile/edit"
            className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-full font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Edit className="w-4 h-4" />
            Edit profile
          </Link>
        </div>

        {/* User Info */}
        <div className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.full_name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                @{(user as any)?.username || user?.email.split('@')[0]}
              </p>
            </div>
          </div>

          {/* Bio */}
          {user?.bio ? (
            <p className="mt-3 text-[15px] text-gray-900 dark:text-white leading-normal">
              {user.bio}
            </p>
          ) : (
            <p className="mt-3 text-[15px] text-gray-500 dark:text-gray-400 italic">
              No bio yet. <Link to="/profile/edit" className="text-primary-500 hover:underline">Add one!</Link>
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
            {/* Show city and country if available, otherwise fall back to location */}
            {(user?.city || user?.country || user?.location) && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>
                  {user?.city && user?.country
                    ? `${user.city}, ${user.country}`
                    : user?.city || user?.country || user?.location
                  }
                </span>
              </div>
            )}
            {user?.website && (
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {user?.twitter_handle && (
              <div className="flex items-center gap-1">
                <Twitter className="w-4 h-4" />
                <a href={`https://twitter.com/${user.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                  @{user.twitter_handle}
                </a>
              </div>
            )}
            {user?.linkedin_url && (
              <div className="flex items-center gap-1">
                <Linkedin className="w-4 h-4" />
                <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                  LinkedIn
                </a>
              </div>
            )}
            {user?.occupation && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{user.occupation}</span>
              </div>
            )}
            {user?.created_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
            )}
          </div>

          {/* Follow Stats */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => onOpenFollowModal('following')}
              className="hover:underline"
            >
              <span className="font-bold text-gray-900 dark:text-white">{user?.following_count || 0}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">Following</span>
            </button>
            <button
              onClick={() => onOpenFollowModal('followers')}
              className="hover:underline"
            >
              <span className="font-bold text-gray-900 dark:text-white">{user?.followers_count || 0}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">Followers</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

