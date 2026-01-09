import { Link, useNavigate } from 'react-router-dom';
import { Users, Search, Bell, MessageCircle, Menu, X, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import UserDropdown from './UserDropdown';
import NotificationsDropdown from './NotificationsDropdown';
import { useAuthStore } from '../store/authStore';
import MangoLogo from './MangoLogo';

export default function AuthenticatedHeader() {
  const { logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchExpanded(false);
      }
    };

    if (searchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchExpanded]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/forum?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchExpanded(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="relative flex items-center h-14 gap-4">
          {/* Logo */}
          <Link to="/forum" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <MangoLogo size={28} />
            <span className="text-lg font-bold text-white">Mango</span>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {/* Core Navigation - Always visible */}
            <Link
              to="/waitlist"
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium">Waitlist</span>
            </Link>

            <Link
              to="/forum"
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium">Feed</span>
            </Link>

            <Link
              to="/communities"
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium">Communities</span>
            </Link>

            {/* Only show Events when authenticated */}
            {isAuthenticated && (
              <Link
                to="/events"
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium">Events</span>
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {isAuthenticated ? (
              <>
                {/* Inline Search */}
                <div ref={searchRef} className="hidden md:block relative">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchExpanded(true)}
                      placeholder="Search..."
                      className={`bg-gray-800 text-white placeholder-gray-500 rounded-full py-1.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-primary-600 transition-all ${
                        searchExpanded ? 'w-64' : 'w-40'
                      }`}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </form>
                </div>

                <div className="hidden md:block relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                  </button>
                  <NotificationsDropdown
                    isOpen={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                  />
                </div>
                <Link
                  to="/messages"
                  className="hidden md:block p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <div className="hidden md:block ml-2">
                  <UserDropdown />
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden md:block text-sm font-medium text-gray-300 hover:text-white">
                  Sign in
                </Link>
                <Link to="/register" className="hidden md:inline-flex px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold text-sm transition-colors">
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <nav className="flex flex-col gap-3">
              {/* Core Navigation - Always visible */}
              <Link to="/waitlist" className="flex items-center gap-3 text-sm font-medium text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>
                Waitlist
              </Link>

              <Link to="/forum" className="flex items-center gap-3 text-sm font-medium text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>
                Feed
              </Link>

              <Link to="/communities" className="flex items-center gap-3 text-sm font-medium text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>
                <Users className="w-5 h-5" />
                Communities
              </Link>

              {isAuthenticated && (
                <>
                  <Link to="/events" className="flex items-center gap-3 text-sm font-medium text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>
                    Events
                  </Link>

                  <Link to="/create-story" className="flex items-center gap-3 text-sm font-medium text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>
                    Create Post
                  </Link>
                  <Link to="/profile" className="flex items-center gap-3 text-sm font-medium text-gray-300 py-2" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  <button onClick={logout} className="flex items-center gap-3 text-sm font-medium text-red-400 text-left py-2">
                    <LogOut className="w-5 h-5" />
                    Sign out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
