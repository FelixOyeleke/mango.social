import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  username?: string;
  bio?: string;
  location?: string;
  current_location?: string;
  country_of_origin?: string;
  website?: string;
  banner_url?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  visa_status?: string;
  followers_count?: number;
  following_count?: number;
  created_at?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { user, token } = response.data.data;

    localStorage.setItem('token', token);

    set({ user, token, isAuthenticated: true });
  },

  register: async (email, password, full_name) => {
    const response = await axios.post('/api/auth/register', { email, password, full_name });
    const { user, token } = response.data.data;

    localStorage.setItem('token', token);

    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null, token: null });
      return;
    }

    try {
      const response = await axios.get('/api/auth/me');
      const { user } = response.data.data;

      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
