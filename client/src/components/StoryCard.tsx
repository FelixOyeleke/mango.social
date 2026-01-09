import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, Repeat2, Quote, Trash2, Edit, Flag, Link as LinkIcon, Eye, EyeOff, MapPin } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import QuotePostCard from './QuotePostCard';
import QuotePostModal from './QuotePostModal';
import { renderTextWithHashtags } from '../utils/hashtags';

interface Story {
  id: string;
  title: string;
  excerpt: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_city?: string;
  author_country?: string;
  category: string;
  featured_image_url?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  reposts_count?: number;
  published_at: string;
  slug: string;
  is_repost?: boolean;
  original_author_id?: string;
  original_author_name?: string;
  repost_comment?: string;
  is_quote?: boolean;
  is_liked_by_user?: boolean;
  is_bookmarked_by_user?: boolean;
  is_reposted_by_user?: boolean;
  quoted_story?: {
    id: string;
    title: string;
    excerpt: string;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    published_at: string;
    featured_image_url?: string;
  };
}

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(story.is_liked_by_user || false);
  const [isBookmarked, setIsBookmarked] = useState(story.is_bookmarked_by_user || false);
  const [isReposted, setIsReposted] = useState(story.is_reposted_by_user || false);
  const [likesCount, setLikesCount] = useState<number>(Number(story.likes_count ?? 0));
  const [repostsCount, setRepostsCount] = useState<number>(Number(story.reposts_count ?? 0));
  const [showRepostMenu, setShowRepostMenu] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const repostMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === story.author_id;

  // Close repost menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (repostMenuRef.current && !repostMenuRef.current.contains(event.target as Node)) {
        setShowRepostMenu(false);
      }
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };

    if (showRepostMenu || showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRepostMenu, showOptionsMenu]);

  const categoryColors: Record<string, { bg: string; text: string }> = {
    Culture: { bg: 'bg-primary-600/10', text: 'text-primary-600' },
    Business: { bg: 'bg-primary-600/10', text: 'text-primary-600' },
    Education: { bg: 'bg-primary-600/10', text: 'text-primary-600' },
    Healthcare: { bg: 'bg-primary-600/10', text: 'text-primary-600' },
    Technology: { bg: 'bg-primary-600/10', text: 'text-primary-600' },
    Family: { bg: 'bg-primary-600/10', text: 'text-primary-600' },
    Career: { bg: 'bg-primary-600/10', text: 'text-primary-600' },
    default: { bg: 'bg-gray-800', text: 'text-gray-400' },
  };

  const categoryStyle = categoryColors[story.category] || categoryColors.default;

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

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      if (isLiked) {
        // Unlike
        await axios.delete(`/api/stories/${story.id}/like`);
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        // Like
        await axios.post(`/api/stories/${story.id}/like`);
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error liking story:', error);
      // Revert on error
      setIsLiked((prev) => prev);
      setLikesCount((prev) => prev);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    try {
      if (isBookmarked) {
        // Remove bookmark
        await axios.delete(`/api/bookmarks/${story.id}`);
        setIsBookmarked(false);
      } else {
        // Add bookmark
        await axios.post('/api/bookmarks', { story_id: story.id });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error bookmarking story:', error);
      // Revert on error
      setIsBookmarked(isBookmarked);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;

    try {
      if (isReposted) {
        // Undo repost
        await axios.delete(`/api/reposts/${story.id}`);
        setIsReposted(false);
        setRepostsCount(repostsCount - 1);
        setShowRepostMenu(false);
      } else {
        // Repost
        await axios.post('/api/reposts', { story_id: story.id });
        setIsReposted(true);
        setRepostsCount(repostsCount + 1);
        setShowRepostMenu(false);
      }
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  const handleQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setShowQuoteModal(true);
    setShowRepostMenu(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/stories/${story.id}`);
      setShowOptionsMenu(false);
      // Refresh the page or remove the story from the list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/stories/${story.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
      setShowOptionsMenu(false);
    }).catch((error) => {
      console.error('Error copying link:', error);
      alert('Failed to copy link');
    });
  };

  const handleReport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    alert('Report functionality coming soon!');
    setShowOptionsMenu(false);
  };

  const toggleRepostMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setShowRepostMenu(!showRepostMenu);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <article className="border-b border-gray-200 dark:border-gray-800 py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer">
      {/* Repost Indicator */}
      {story.is_repost && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2 ml-12">
          <Repeat2 className="w-3.5 h-3.5" />
          <span>
            <span className="font-semibold hover:underline">{story.author_name}</span> reposted
            {story.original_author_name && <span> from <span className="font-semibold hover:underline">{story.original_author_name}</span></span>}
          </span>
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex gap-3">
        {/* Avatar Column */}
        <div className="flex-shrink-0">
          <Link to={`/users/${story.author_id}`}>
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold hover:opacity-80 transition-opacity">
              {story.author_avatar ? (
                <img src={story.author_avatar} alt={story.author_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                story.author_name.charAt(0).toUpperCase()
              )}
            </div>
          </Link>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-baseline gap-2 flex-1 min-w-0">
              <Link to={`/users/${story.author_id}`} className="font-bold text-gray-900 dark:text-white hover:underline text-sm">
                {story.author_name}
              </Link>
              <span className="text-gray-500 dark:text-gray-400 text-sm">&middot;</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(story.published_at)}</span>
              {(story.author_city || story.author_country) && (
                <>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">&middot;</span>
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                    <MapPin className="w-3 h-3" />
                    {story.author_city && story.author_country
                      ? `${story.author_city}, ${story.author_country}`
                      : story.author_city || story.author_country
                    }
                  </span>
                </>
              )}
            </div>
            <div className="relative" ref={optionsMenuRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowOptionsMenu(!showOptionsMenu);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Options Dropdown */}
              {showOptionsMenu && (
                <div className="absolute right-0 top-8 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {isOwner ? (
                    <>
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Delete post</span>
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleReport}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                      >
                        <Flag className="w-4 h-4" />
                        <span className="text-sm font-medium">Report post</span>
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    </>
                  )}
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Copy link</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Repost Comment */}
          {story.is_repost && story.repost_comment && (
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              {renderTextWithHashtags(story.repost_comment)}
            </div>
          )}

          {/* Content */}
          <Link to={`/stories/${story.slug}`} className="block group">
            <div className="space-y-1">
              {/* Show content (no title in feed, like Twitter/Bluesky) */}
              <p className="text-[15px] text-gray-900 dark:text-white leading-normal whitespace-pre-wrap">
                {renderTextWithHashtags(story.excerpt || story.title)}
              </p>
            </div>

            {/* Featured Image */}
            {story.featured_image_url && !story.is_quote && (
              <div className="relative mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={story.featured_image_url}
                  alt={story.title}
                  className="w-full h-auto max-h-[500px] object-cover"
                />
              </div>
            )}
          </Link>

          {/* Quoted Post */}
          {story.is_quote && story.quoted_story && (
            <QuotePostCard quotedStory={story.quoted_story} />
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 group hover:text-red-600 dark:hover:text-red-400 transition-colors ${
                isLiked ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                <Heart className={`w-[18px] h-[18px] ${isLiked ? 'fill-current' : ''}`} />
              </div>
              {likesCount > 0 && <span className="text-sm">{formatNumber(likesCount)}</span>}
            </button>

            <Link
              to={`/stories/${story.slug}#comments`}
              className="flex items-center gap-2 group text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                <MessageSquare className="w-[18px] h-[18px]" />
              </div>
              {story.comments_count > 0 && <span className="text-sm">{formatNumber(story.comments_count)}</span>}
            </Link>

            {/* Repost Button with Dropdown */}
            <div className="relative" ref={repostMenuRef}>
              <button
                onClick={toggleRepostMenu}
                className={`flex items-center gap-2 group hover:text-green-600 dark:hover:text-green-400 transition-colors ${
                  isReposted ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors">
                  <Repeat2 className={`w-[18px] h-[18px] ${isReposted ? 'stroke-[2.5]' : ''}`} />
                </div>
                {repostsCount > 0 && <span className="text-sm">{formatNumber(repostsCount)}</span>}
              </button>

              {/* Dropdown Menu */}
              {showRepostMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[200px] z-10">
                  <button
                    onClick={handleRepost}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <Repeat2 className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {isReposted ? 'Undo Repost' : 'Repost'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {isReposted ? 'Remove from your profile' : 'Share to your followers'}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={handleQuote}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <Quote className="w-4 h-4 text-primary-600" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        Quote
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Add your thoughts
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 group hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${
                isBookmarked ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                <Bookmark className={`w-[18px] h-[18px] ${isBookmarked ? 'fill-current' : ''}`} />
              </div>
            </button>

            <button className="flex items-center gap-2 group text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <div className="p-2 rounded-full group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                <Share2 className="w-[18px] h-[18px]" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Quote Post Modal */}
      {showQuoteModal && (
        <QuotePostModal
          story={{
            id: story.id,
            title: story.title,
            excerpt: story.excerpt,
            author_name: story.author_name,
            author_avatar: story.author_avatar,
            published_at: story.published_at,
            featured_image_url: story.featured_image_url,
            slug: story.slug,
          }}
          onClose={() => setShowQuoteModal(false)}
        />
      )}
    </article>
  );
}
