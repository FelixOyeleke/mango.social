import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Users, Plus, Search, Lock, Globe, X, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  banner_image_url?: string;
  icon_url?: string;
  member_count: number;
  post_count: number;
  is_private: boolean;
  is_member: boolean;
  creator_name: string;
}

export default function Communities() {
  const { isAuthenticated } = useAuthStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await axios.get('/api/communities');
      setCommunities(response.data.data.communities);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (communityId: string) => {
    if (!isAuthenticated) {
      alert('Please login to join communities');
      return;
    }

    try {
      await axios.post(`/api/communities/${communityId}/join`);
      fetchCommunities();
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleLeave = async (communityId: string) => {
    try {
      await axios.delete(`/api/communities/${communityId}/leave`);
      fetchCommunities();
    } catch (error) {
      console.error('Error leaving community:', error);
    }
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Sign-in Banner for non-authenticated users */}
      {!isAuthenticated && showBanner && (
        <div className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-white" />
                <p className="text-white text-sm font-medium">
                  Join Mango to create and join communities
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">Communities</h1>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Community
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-900 text-white"
            />
          </div>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <div key={community.id} className="card hover:border-gray-700 transition-all">
                {/* Community Icon/Banner */}
                <div className="h-24 bg-gray-800 rounded-t-lg -mt-4 -mx-4 mb-4 flex items-center justify-center">
                  {community.icon_url ? (
                    <img src={community.icon_url} alt={community.name} className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-900" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-900 flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary-600" />
                    </div>
                  )}
                </div>

                {/* Community Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      to={`/communities/${community.slug}`}
                      className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {community.name}
                    </Link>
                    {community.is_private ? (
                      <Lock className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Globe className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {community.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{community.member_count} members</span>
                    <span>•</span>
                    <span>{community.post_count} posts</span>
                  </div>
                </div>

                {/* Join/Leave Button */}
                {isAuthenticated && (
                  <button
                    onClick={() => community.is_member ? handleLeave(community.id) : handleJoin(community.id)}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                      community.is_member
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {community.is_member ? 'Leave' : 'Join'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {filteredCommunities.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No communities found</p>
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && <CreateCommunityModal onClose={() => setShowCreateModal(false)} onSuccess={fetchCommunities} />}
    </div>
  );
}

// Create Community Modal Component
function CreateCommunityModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_private: false,
    rules: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/communities', formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating community:', error);
      alert('Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Community</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Community Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              required
              placeholder="H1B Visa Support"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
              rows={3}
              placeholder="A community for H1B visa holders and applicants to share experiences and advice"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Community Rules (optional)
            </label>
            <textarea
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
              rows={4}
              placeholder="1. Be respectful&#10;2. No spam&#10;3. Stay on topic"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Community Type
            </label>
            <div className="space-y-3">
              {/* Public Option */}
              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                !formData.is_private
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
              }`}>
                <input
                  type="radio"
                  name="community_type"
                  checked={!formData.is_private}
                  onChange={() => setFormData({ ...formData, is_private: false })}
                  className="mt-1 w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">Public</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Anyone can view, join, and post in this community
                  </p>
                </div>
              </label>

              {/* Private Option */}
              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.is_private
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
              }`}>
                <input
                  type="radio"
                  name="community_type"
                  checked={formData.is_private}
                  onChange={() => setFormData({ ...formData, is_private: true })}
                  className="mt-1 w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">Private</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Only approved members can view and post. Requires invitation or approval to join
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Community'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

