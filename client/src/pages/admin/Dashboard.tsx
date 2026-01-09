import { useState, useEffect } from 'react';
import { Users, FileText, MessageSquare, Briefcase, TrendingUp, Activity } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalStories: number;
  totalComments: number;
  totalJobs: number;
  totalCommunities: number;
  totalMessages: number;
}

interface TopContributor {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  story_count: string;
  comment_count: string;
  likes_received: string;
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = (import.meta as any)?.env?.VITE_API_URL || '';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data.stats);
        setTopContributors(response.data.data.topContributors);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.full_name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            title="Total Users"
            value={stats?.totalUsers || 0}
            subtitle={`${stats?.activeUsers || 0} active`}
          />
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            title="Total Stories"
            value={stats?.totalStories || 0}
            subtitle="Published posts"
          />
          <StatCard
            icon={<MessageSquare className="w-5 h-5" />}
            title="Comments"
            value={stats?.totalComments || 0}
            subtitle="User engagement"
          />
          <StatCard
            icon={<Briefcase className="w-5 h-5" />}
            title="Job Listings"
            value={stats?.totalJobs || 0}
            subtitle="Active opportunities"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-gray-400" />
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Communities</h3>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.totalCommunities || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Active communities</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Messages</h3>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.totalMessages || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total messages sent</p>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Top Contributors</h3>
          </div>

          <div className="space-y-2">
            {topContributors.map((contributor, index) => (
              <div key={contributor.id} className="flex items-center gap-3 p-3 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                <div className="text-gray-500 font-mono text-xs w-6">#{index + 1}</div>
                <img
                  src={contributor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.full_name)}`}
                  alt={contributor.full_name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm truncate">{contributor.full_name}</h4>
                  <p className="text-xs text-gray-500 truncate">{contributor.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium text-sm">{contributor.story_count}</p>
                  <p className="text-xs text-gray-500">{contributor.comment_count} comments</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle: string;
}

function StatCard({ icon, title, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-gray-400">
          {icon}
        </div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
