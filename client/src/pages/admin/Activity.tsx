import { useState, useEffect } from 'react';
import { Activity as ActivityIcon, UserPlus, FileText, MessageSquare, Clock } from 'lucide-react';
import axios from 'axios';

interface Activity {
  type: string;
  user_id: string;
  user_name: string;
  email: string;
  timestamp: string;
}

export default function AdminActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = (import.meta as any)?.env?.VITE_API_URL || '';

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const base = API_URL || '';
      const response = await axios.get(
        `${base}/api/admin/dashboard/activity?limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setActivities(response.data.data.activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <UserPlus className="w-5 h-5 text-gray-400" />;
      case 'story_created':
        return <FileText className="w-5 h-5 text-gray-400" />;
      case 'comment_posted':
        return <MessageSquare className="w-5 h-5 text-gray-400" />;
      default:
        return <ActivityIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'user_registered':
        return (
          <>
            <span className="font-semibold text-white">{activity.user_name}</span>
            <span className="text-gray-400"> registered a new account</span>
          </>
        );
      case 'story_created':
        return (
          <>
            <span className="font-semibold text-white">{activity.user_name}</span>
            <span className="text-gray-400"> created a story: </span>
            <span className="text-primary-400">{activity.email}</span>
          </>
        );
      case 'comment_posted':
        return (
          <>
            <span className="font-semibold text-white">{activity.user_name}</span>
            <span className="text-gray-400"> commented on: </span>
            <span className="text-purple-400">{activity.email}</span>
          </>
        );
      default:
        return <span className="text-gray-400">Unknown activity</span>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Recent Activity</h1>
          <p className="text-gray-400">Monitor user activities across the platform</p>
        </div>

        {/* Activity Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-800">
              {activities.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No recent activity
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div key={index} className="p-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-800 rounded-lg flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          {getActivityText(activity)}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
