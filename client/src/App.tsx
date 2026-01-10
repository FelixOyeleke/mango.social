import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useAppPreferencesStore } from './store/appPreferencesStore';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Forum from './pages/Forum';
import Stories from './pages/Stories';
import StoryDetail from './pages/StoryDetail';
import JobBoard from './pages/JobBoard';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import CreateStory from './pages/CreateStory';
import Bookmarks from './pages/Bookmarks';
import Messages from './pages/Messages';
import EditProfile from './pages/EditProfile';
import Communities from './pages/Communities';
import News from './pages/News';
import Resources from './pages/Resources';
import PostJob from './pages/PostJob';
import HashtagPage from './pages/HashtagPage';
import Search from './pages/Search';
import Trending from './pages/Trending';
import AppStore from './pages/AppStore';
import Waitlist from './pages/Waitlist';
import Debug from './pages/Debug';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminActivity from './pages/admin/Activity';
import AdminWaitlist from './pages/admin/Waitlist';

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const { fetchApps } = useAppPreferencesStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Load app preferences when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchApps();
    }
  }, [isAuthenticated, fetchApps]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="forum" element={<Forum />} />
        <Route path="forum/trending" element={<Trending />} />
        <Route path="news" element={<News />} />
        <Route path="stories" element={<Stories />} />
        <Route path="stories/:slug" element={<StoryDetail />} />
        <Route path="jobs" element={<JobBoard />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="communities" element={<Communities />} />
        <Route path="hashtag/:hashtag" element={<HashtagPage />} />
        <Route path="search" element={<Search />} />
        <Route path="users/:userId" element={<UserProfile />} />
        <Route path="user/:username" element={<UserProfile />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="resources" element={<Resources />} />
        <Route path="waitlist" element={<Waitlist />} />
        <Route path="debug" element={<Debug />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="create-story" element={<CreateStory />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="messages" element={<Messages />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="apps" element={<AppStore />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="activity" element={<AdminActivity />} />
        <Route path="waitlist" element={<AdminWaitlist />} />
      </Route>
    </Routes>
  );
}

export default App;
