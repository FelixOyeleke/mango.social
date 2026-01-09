import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { Heart, MessageSquare, Bookmark, Share2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { renderTextWithHashtags } from '../utils/hashtags';
import LoadingSpinner from '../components/LoadingSpinner';
import UserProfileWidget from '../components/widgets/UserProfileWidget';
import QuickActionsWidget from '../components/widgets/QuickActionsWidget';
import CommunityStatsWidget from '../components/widgets/CommunityStatsWidget';
import TrendingWidget from '../components/widgets/TrendingWidget';
import SuggestedUsersWidget from '../components/widgets/SuggestedUsersWidget';

interface Comment {
  id: string;
  content: string;
  user_name: string;
  user_avatar: string;
  created_at: string;
  parent_id?: string | null;
  replies?: Comment[];
}

export default function StoryDetail() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const queryClient = useQueryClient();

  const MAX_WORDS = 300;

  const { data, isLoading } = useQuery(['story', slug], async () => {
    const response = await axios.get(`/api/stories/${slug}`);
    return response.data.data.story;
  });

  const { data: commentsData } = useQuery(
    ['comments', data?.id],
    async () => {
      if (!data?.id) return { comments: [] };
      const response = await axios.get(`/api/comments/story/${data.id}`);
      return response.data.data;
    },
    {
      enabled: !!data?.id,
    }
  );

  const createCommentMutation = useMutation(
    async (payload: { content: string; parent_id: string | null }) => {
      const response = await axios.post('/api/comments', {
        story_id: data.id,
        content: payload.content,
        parent_id: payload.parent_id,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', data.id]);
        setCommentText('');
        setWordCount(0);
        setReplyParentId(null);
      },
      onError: (error: any) => {
        alert(error.response?.data?.error || 'Failed to post comment. Please try again.');
      },
    }
  );

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
    const count = words.length;

    if (count <= MAX_WORDS) {
      setCommentText(text);
      setWordCount(count);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && wordCount <= MAX_WORDS) {
      createCommentMutation.mutate({ content: commentText, parent_id: replyParentId });
    }
  };

  const handleReply = (commentId: string) => {
    setReplyParentId(commentId);
    setReplyText('');
  };

  const handleCancelReply = () => {
    setReplyParentId(null);
    setReplyText('');
  };

  const handleReplyTextChange = (text: string) => {
    setReplyText(text);
  };

  const handleSubmitReply = () => {
    if (replyText.trim() && replyParentId) {
      createCommentMutation.mutate({ content: replyText, parent_id: replyParentId });
    }
  };

  const comments = commentsData?.comments || [];

  const threadedComments = useMemo(() => {
    const byId = new Map<string, Comment>();
    const roots: Comment[] = [];

    comments.forEach((c: Comment) => {
      byId.set(c.id, { ...c, replies: [] });
    });

    byId.forEach((comment) => {
      if (comment.parent_id && byId.has(comment.parent_id)) {
        byId.get(comment.parent_id)!.replies!.push(comment);
      } else {
        roots.push(comment);
      }
    });

    const sortByCreated = (a: Comment, b: Comment) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

    const sortTree = (nodes: Comment[]) => {
      nodes.sort(sortByCreated);
      nodes.forEach((n) => n.replies && sortTree(n.replies));
    };

    sortTree(roots);
    return roots;
  }, [comments]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto pt-6">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Story not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-4">
            <UserProfileWidget />
            <QuickActionsWidget />
            <CommunityStatsWidget />
          </aside>

          <div className="lg:col-span-6 bg-white dark:bg-gray-900 border-x border-gray-200 dark:border-gray-800 min-h-screen">
          {/* Main Post Card */}
          <article className="border-b border-gray-200 dark:border-gray-800 p-4">
            {/* Author Info */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0">
                <Link to={`/users/${data.author_id}`}>
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                    {data.author_avatar ? (
                      <img src={data.author_avatar} alt={data.author_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      data.author_name.charAt(0).toUpperCase()
                    )}
                  </div>
                </Link>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link to={`/users/${data.author_id}`} className="font-bold text-gray-900 dark:text-white hover:underline">
                    {data.author_name}
                  </Link>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    &middot; {new Date(data.published_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-3">
              <p className="text-[17px] text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                {renderTextWithHashtags(data.content)}
              </p>
            </div>

            {/* Featured Image */}
            {data.featured_image_url && (
              <div className="mb-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={data.featured_image_url} alt="Post image" className="w-full object-cover" />
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 py-3 border-t border-gray-200 dark:border-gray-800">
              <span>{data.views_count} views</span>
              <span>&middot;</span>
              <span>{data.likes_count} likes</span>
              <span>&middot;</span>
              <span>{data.comments_count} comments</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-around py-2 border-t border-gray-200 dark:border-gray-800">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                <Heart className="w-5 h-5" />
                <span className="text-sm font-medium">{data.likes_count}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-medium">{data.comments_count}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </article>

          {/* Comments Section */}
          <div className="border-t-8 border-gray-100 dark:border-gray-950" id="comments">
            {/* Comment Input */}
            {isAuthenticated ? (
              <form onSubmit={handleSubmitComment} className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex gap-3">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user?.full_name?.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div className="flex-1">
                    {replyParentId && (
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Replying to a comment</span>
                        <button
                          type="button"
                          onClick={() => setReplyParentId(null)}
                          className="text-primary-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <textarea
                      value={commentText}
                      onChange={handleCommentChange}
                      placeholder="Post your reply..."
                      className="w-full min-h-[60px] text-[15px] bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0"
                      disabled={createCommentMutation.isLoading}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <div className={`text-xs ${wordCount > MAX_WORDS * 0.9 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {wordCount}/{MAX_WORDS} words
                  </div>
                  <button
                    type="submit"
                    disabled={!commentText.trim() || createCommentMutation.isLoading || wordCount > MAX_WORDS}
                    className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white rounded-full font-bold text-sm transition-colors"
                  >
                    {createCommentMutation.isLoading ? 'Replying...' : 'Reply'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 text-center border-b border-gray-200 dark:border-gray-800">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Log in to reply</p>
              </div>
            )}

            {/* Comments List - Thread Style */}
            <div>
              {threadedComments.map((comment) => (
                <ThreadedComment
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  onReply={handleReply}
                  replyingTo={replyParentId}
                  onCancelReply={handleCancelReply}
                  replyText={replyText}
                  onReplyTextChange={handleReplyTextChange}
                  onSubmitReply={handleSubmitReply}
                  isSubmitting={createCommentMutation.isLoading}
                  currentUser={user}
                />
              ))}

              {comments.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No replies yet. Be the first to reply!</p>
                </div>
              )}
            </div>
          </div>
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-4">
            <TrendingWidget />
            <SuggestedUsersWidget />
          </aside>
        </div>
      </div>
    </div>
  );
}

function ThreadedComment({
  comment,
  depth,
  onReply,
  replyingTo,
  onCancelReply,
  replyText,
  onReplyTextChange,
  onSubmitReply,
  isSubmitting,
  currentUser
}: {
  comment: Comment;
  depth: number;
  onReply: (id: string, userName: string) => void;
  replyingTo: string | null;
  onCancelReply: () => void;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: () => void;
  isSubmitting: boolean;
  currentUser: any;
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);

  useEffect(() => {
    setShowReplyBox(replyingTo === comment.id);
  }, [replyingTo, comment.id]);

  return (
    <div
      className={`p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
        depth > 0 ? 'ml-8 border-l-2 border-gray-100 dark:border-gray-800' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
            {comment.user_avatar ? (
              <img src={comment.user_avatar} alt={comment.user_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              comment.user_name.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 dark:text-white text-[15px]">
              {comment.user_name}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              &middot; {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-900 dark:text-white text-[15px] leading-normal whitespace-pre-wrap">
            {renderTextWithHashtags(comment.content)}
          </p>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => onReply(comment.id, comment.user_name)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 font-semibold transition-colors"
            >
              Reply
            </button>
            <button
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Like</span>
            </button>
            <button
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inline Reply Box */}
      {showReplyBox && currentUser && (
        <div className="mt-3 ml-13 animate-in slide-in-from-top-2 duration-200">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Replying to</span>
              <span className="font-semibold text-primary-600">@{comment.user_name}</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xs">
                  {currentUser?.avatar_url ? (
                    <img src={currentUser.avatar_url} alt={currentUser.full_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    currentUser?.full_name?.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={(e) => onReplyTextChange(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full min-h-[60px] text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 resize-none text-gray-900 dark:text-white placeholder-gray-400"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={onCancelReply}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onSubmitReply}
                    disabled={!replyText.trim() || isSubmitting}
                    className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full font-bold text-xs transition-colors disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Replying...' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <ThreadedComment
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              replyingTo={replyingTo}
              onCancelReply={onCancelReply}
              replyText={replyText}
              onReplyTextChange={onReplyTextChange}
              onSubmitReply={onSubmitReply}
              isSubmitting={isSubmitting}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}
