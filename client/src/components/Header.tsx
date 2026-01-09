import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAppPreferencesStore } from '../store/appPreferencesStore';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import UserDropdown from './UserDropdown';
import MangoLogo from './MangoLogo';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { isAuthenticated, logout } = useAuthStore();
  const { fetchApps, isAppEnabled } = useAppPreferencesStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load app preferences when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchApps();
    }
  }, [isAuthenticated, fetchApps]);

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <MangoLogo size={28} />
            <span className="text-lg font-bold text-white">Mango</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/forum" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Feed
            </Link>
            {(!isAuthenticated || isAppEnabled('communities')) && (
              <Link to="/communities" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Communities
              </Link>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/create-story"
                  className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold text-sm transition-colors"
                >
                  Post
                </Link>
                <NotificationBell />
                <UserDropdown />
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white">
                  Sign in
                </Link>
                <Link to="/register" className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold text-sm transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <nav className="flex flex-col gap-3">
              <Link to="/forum" className="text-sm font-medium text-gray-300 py-2">Feed</Link>
              {(!isAuthenticated || isAppEnabled('communities')) && (
                <Link to="/communities" className="text-sm font-medium text-gray-300 py-2">Communities</Link>
              )}
              {isAuthenticated ? (
                <>
                  <Link to="/create-story" className="text-sm font-medium text-gray-300 py-2">Create Post</Link>
                  <Link to="/profile" className="text-sm font-medium text-gray-300 py-2">Profile</Link>
                  <button onClick={logout} className="text-sm font-medium text-gray-300 text-left py-2">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-300 py-2">Sign in</Link>
                  <Link to="/register" className="text-sm font-medium text-gray-300 py-2">Sign up</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
