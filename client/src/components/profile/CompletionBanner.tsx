import { Link } from 'react-router-dom';
import { Edit } from 'lucide-react';

interface CompletionBannerProps {
  isIncomplete: boolean;
}

export default function CompletionBanner({ isIncomplete }: CompletionBannerProps) {
  if (!isIncomplete) return null;

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Edit className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-white font-semibold">Complete your profile</p>
            <p className="text-gray-400 text-sm">Add a bio, location, and profile picture to get started</p>
          </div>
        </div>
        <Link
          to="/profile/edit"
          className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-full font-bold text-sm transition-colors whitespace-nowrap"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}

