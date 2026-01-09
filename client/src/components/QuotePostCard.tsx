import { Link } from 'react-router-dom';
import { Quote } from 'lucide-react';
import { renderTextWithHashtags } from '../utils/hashtags';

interface QuotedStory {
  id: string;
  title: string;
  excerpt: string;
  author_name: string;
  author_avatar?: string;
  published_at: string;
  featured_image_url?: string;
  slug?: string;
}

interface QuotePostCardProps {
  quotedStory: QuotedStory;
}

export default function QuotePostCard({ quotedStory }: QuotePostCardProps) {
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

  const linkTo = quotedStory.slug ? `/stories/${quotedStory.slug}` : `/stories/${quotedStory.id}`;

  return (
    <div className="relative mt-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-white dark:bg-gray-900/50 hover:border-primary-300 dark:hover:border-primary-700 transition-all group">
      {/* Quote Icon */}
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
        <Quote className="w-4 h-4 text-white" />
      </div>

      <Link to={linkTo} className="block">
        {/* Quoted Post Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-white dark:ring-gray-900">
            {quotedStory.author_avatar ? (
              <img
                src={quotedStory.author_avatar}
                alt={quotedStory.author_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              quotedStory.author_name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="font-semibold text-sm text-gray-900 dark:text-white truncate hover:underline">
              {quotedStory.author_name}
            </span>
            <span className="text-gray-400 dark:text-gray-500 text-sm">·</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              {formatDate(quotedStory.published_at)}
            </span>
          </div>
        </div>

        {/* Quoted Post Content */}
        <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 whitespace-pre-wrap leading-relaxed mb-2">
          {renderTextWithHashtags(quotedStory.excerpt || quotedStory.title)}
        </div>

        {/* Quoted Post Image (if exists) */}
        {quotedStory.featured_image_url && (
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={quotedStory.featured_image_url}
              alt={quotedStory.title}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </Link>
    </div>
  );
}

