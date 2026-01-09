import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

export default function PostJob() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="card">
          <h1 className="text-2xl font-bold text-white mb-3">Post a Job</h1>
          <p className="text-gray-300 mb-6">
            Job posting is coming soon. In the meantime, email us the role details and we&apos;ll help you reach the community.
          </p>
          <div className="space-y-2 text-gray-200">
            <p><span className="font-semibold">Your account:</span> {user?.email}</p>
            <p>
              <span className="font-semibold">Contact:</span>{' '}
              <a href="mailto:jobs@immigrant-voices.example" className="text-primary-400 hover:underline">
                jobs@immigrant-voices.example
              </a>
            </p>
          </div>
          <div className="mt-6">
            <Link to="/jobs" className="text-primary-400 hover:underline text-sm">
              Back to jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
