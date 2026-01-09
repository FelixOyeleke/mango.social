import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Briefcase, MapPin, DollarSign, Building2, Globe, CheckCircle, Filter, Search } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  remote_type: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  visa_sponsorship: boolean;
  visa_types: string[];
  created_at: string;
  views_count: number;
  applications_count: number;
  skills?: string[];
}

export default function JobBoard() {
  const { isAuthenticated } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'visa' | 'remote'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === 'visa') params.append('visa_sponsorship', 'true');
      if (filter === 'remote') params.append('remote_type', 'remote');
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`/api/jobs?${params.toString()}`);
      setJobs(response.data.data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-4">
            <div className="card">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filter === 'visa'}
                    onChange={(e) => setFilter(e.target.checked ? 'visa' : 'all')}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Visa Sponsorship</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filter === 'remote'}
                    onChange={(e) => setFilter(e.target.checked ? 'remote' : 'all')}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Remote Only</span>
                </label>
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Job Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</span>
                  <span className="font-bold text-gray-900 dark:text-white">{jobs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">With Visa</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {jobs.filter((j) => j.visa_sponsorship).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Remote</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    {jobs.filter((j) => j.remote_type === 'remote').length}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-6 space-y-4">
            <div className="card">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs by title, company, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="card">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filter === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  All Jobs
                </button>
                <button
                  onClick={() => setFilter('visa')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filter === 'visa'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Visa Sponsorship
                </button>
                <button
                  onClick={() => setFilter('remote')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filter === 'remote'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Remote
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="card text-center py-12">
                  <Briefcase className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No jobs found</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {filter === 'visa'
                      ? 'No jobs with visa sponsorship available yet.'
                      : filter === 'remote'
                      ? 'No remote jobs available yet.'
                      : 'No jobs available yet. Check back soon!'}
                  </p>
                </div>
              ) : (
                jobs.map((job) => (
                  <article key={job.id} className="card hover:border-gray-300 dark:hover:border-gray-700 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm">{job.company_name}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{formatDate(job.created_at)}</span>
                            <span>&middot;</span>
                            <span className="capitalize">{job.job_type}</span>
                          </div>
                        </div>
                      </div>
                      {job.visa_sponsorship && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-primary-600/10 text-primary-600 rounded-full text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Visa
                        </div>
                      )}
                    </div>

                    <Link to={`/jobs/${job.id}`} className="block group">
                      <h2 className="text-lg font-bold text-white group-hover:text-primary-600 transition-colors leading-snug mb-3">
                        {job.title}
                      </h2>

                      <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <span className="capitalize">{job.remote_type || 'Onsite'}</span>
                        </div>
                        {job.salary_min && job.salary_max && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">
                              {job.salary_currency} {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {job.visa_types && job.visa_types.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.visa_types.map((visa, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary-600/10 text-primary-600 rounded text-xs font-medium"
                            >
                              {visa}
                            </span>
                          ))}
                          {job.skills &&
                            job.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={`skill-${index}`}
                                className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                        </div>
                      )}
                    </Link>
                  </article>
                ))
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-4">
            {isAuthenticated && (
              <div className="card bg-primary-600 text-white">
                <h3 className="font-bold mb-2">Hiring?</h3>
                <p className="text-sm opacity-90 mb-4">Post a job and find talented immigrants</p>
                <Link
                  to="/post-job"
                  className="block w-full text-center px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition font-semibold text-sm"
                >
                  Post a Job
                </Link>
              </div>
            )}

            <div className="card">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Popular Visa Types</h3>
              <div className="space-y-2">
                {['H1B', 'Green Card', 'O1', 'TN', 'L1'].map((visa) => (
                  <button
                    key={visa}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    {visa}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Learn about visa sponsorship and job search tips
              </p>
              <Link
                to="/resources"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-semibold"
              >
                View Resources
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
