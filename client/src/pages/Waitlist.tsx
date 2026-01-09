import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Sparkles, Users, Globe, Briefcase, Heart } from 'lucide-react';
import axios from 'axios';

export default function Waitlist() {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    reason: '',
    interest_area: '',
    referral_source: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await axios.post('/api/waitlist', formData);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            You're on the list! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thank you for joining the Mango Social waitlist. We'll notify you when we're ready to welcome you aboard!
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Join the Waitlist
            </h1>
          </div>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Be among the first to experience Mango Social - where immigrant voices connect, share, and thrive together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left: Benefits */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-6">Why Join Early?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Priority Access</h4>
                    <p className="text-primary-100 text-sm">
                      Get early access to exclusive features and be part of our founding community
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Connect Globally</h4>
                    <p className="text-primary-100 text-sm">
                      Network with immigrants from around the world sharing similar experiences
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Career Opportunities</h4>
                    <p className="text-primary-100 text-sm">
                      Access exclusive job postings and career resources tailored for immigrants
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Share Your Story</h4>
                    <p className="text-primary-100 text-sm">
                      Inspire others by sharing your journey and experiences
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <p className="text-sm text-primary-100">
                <strong className="text-white">Join {Math.floor(Math.random() * 500) + 1000}+</strong> people already on the waitlist
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Reserve Your Spot
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="interest_area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  What interests you most?
                </label>
                <select
                  id="interest_area"
                  name="interest_area"
                  value={formData.interest_area}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select an option</option>
                  <option value="networking">Networking & Community</option>
                  <option value="jobs">Job Opportunities</option>
                  <option value="stories">Sharing Stories</option>
                  <option value="resources">Resources & Support</option>
                  <option value="all">All of the above</option>
                </select>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Why do you want to join Mango Social?
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                  placeholder="Tell us a bit about yourself and what you're looking for..."
                />
              </div>

              <div>
                <label htmlFor="referral_source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  How did you hear about us?
                </label>
                <select
                  id="referral_source"
                  name="referral_source"
                  value={formData.referral_source}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select an option</option>
                  <option value="social_media">Social Media</option>
                  <option value="friend">Friend or Family</option>
                  <option value="search">Search Engine</option>
                  <option value="blog">Blog or Article</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By joining, you agree to receive updates about Mango Social. We respect your privacy.
              </p>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

