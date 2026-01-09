import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { User, Settings, LogOut, ChevronDown, Shield, Grid } from 'lucide-react';

export default function UserDropdown() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-800/50 transition-all duration-200 group"
      >
        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-bold">
              {user.full_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="p-4 bg-gray-800/50 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                    <span className="text-white text-lg font-bold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">
                  {user.full_name}
                </h3>
                <p className="text-sm text-gray-400 truncate">
                  @{(user as any)?.username || user.email.split('@')[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary-600/10 flex items-center justify-center group-hover:bg-primary-600/20 transition-colors">
                <User className="w-4.5 h-4.5 text-primary-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">View Profile</div>
                <div className="text-xs text-gray-500">See your public profile</div>
              </div>
            </Link>

            <Link
              to="/profile/edit"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-600/10 flex items-center justify-center group-hover:bg-purple-600/20 transition-colors">
                <Settings className="w-4.5 h-4.5 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Settings</div>
                <div className="text-xs text-gray-500">Manage your account</div>
              </div>
            </Link>

            <Link
              to="/apps"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                <Grid className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">App Store</div>
                <div className="text-xs text-gray-500">Customize your apps</div>
              </div>
            </Link>

            {/* Admin Panel Link - Only show for admin users */}
            {user.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-600/10 flex items-center justify-center group-hover:bg-orange-600/20 transition-colors">
                  <Shield className="w-4.5 h-4.5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Admin Panel</div>
                  <div className="text-xs text-gray-500">Manage platform</div>
                </div>
              </Link>
            )}

            <div className="my-2 border-t border-gray-800"></div>

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-600/10 rounded-xl transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-lg bg-red-600/10 flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                <LogOut className="w-4.5 h-4.5 text-red-400" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-red-400">Sign Out</div>
                <div className="text-xs text-gray-500">Log out of your account</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

