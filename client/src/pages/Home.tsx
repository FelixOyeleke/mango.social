import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Globe } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/forum', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-32 lg:py-48">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/10 border border-primary-600/20 rounded-full mb-8">
              <Users className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-400 font-medium">Join the community</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight text-white">
              Share Your Story
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with people worldwide, share your journey, and build meaningful relationships
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors text-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/forum"
                className="inline-flex items-center gap-2 px-8 py-4 border border-gray-800 text-white rounded-full font-semibold hover:border-gray-700 transition-colors text-lg"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Why Mango?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A platform built for authentic connections and shared experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Share</h3>
              <p className="text-gray-400 leading-relaxed">
                Tell your story and connect with others who understand your journey
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Connect</h3>
              <p className="text-gray-400 leading-relaxed">
                Build meaningful relationships with people from around the world
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Grow</h3>
              <p className="text-gray-400 leading-relaxed">
                Learn and grow from shared experiences and diverse perspectives
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

