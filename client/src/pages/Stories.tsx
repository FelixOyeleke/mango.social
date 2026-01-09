import { useQuery } from 'react-query';
import axios from 'axios';
import StoryCard from '../components/StoryCard';
import UserProfileWidget from '../components/widgets/UserProfileWidget';
import QuickActionsWidget from '../components/widgets/QuickActionsWidget';
import CommunityStatsWidget from '../components/widgets/CommunityStatsWidget';
import TrendingWidget from '../components/widgets/TrendingWidget';
import SuggestedUsersWidget from '../components/widgets/SuggestedUsersWidget';

export default function Stories() {
  const { data, isLoading } = useQuery('stories', async () => {
    const response = await axios.get('/api/stories');
    return response.data.data;
  });

  const stories = data?.stories || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-4">
            <UserProfileWidget />
            <QuickActionsWidget />
            <CommunityStatsWidget />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-6">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                All Stories
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Discover inspiring stories from immigrants around the world
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {stories.map((story: any) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-4">
            <TrendingWidget />
            <SuggestedUsersWidget />
          </aside>
        </div>
      </div>
    </div>
  );
}
