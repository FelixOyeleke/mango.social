import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { extractHashtags } from '../utils/hashtags';
import { Image as ImageIcon, X } from 'lucide-react';
import UserProfileWidget from '../components/widgets/UserProfileWidget';
import QuickActionsWidget from '../components/widgets/QuickActionsWidget';
import CommunityStatsWidget from '../components/widgets/CommunityStatsWidget';
import TrendingWidget from '../components/widgets/TrendingWidget';
import SuggestedUsersWidget from '../components/widgets/SuggestedUsersWidget';

export default function CreateStory() {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState<'mention' | 'hashtag' | null>(null);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: suggestedUsers } = useQuery('compose-suggested-users', async () => {
    const response = await axios.get('/api/stats/suggested-users?limit=25');
    return response.data.data.users;
  });

  const { data: trendingTopics } = useQuery('compose-trending', async () => {
    const response = await axios.get('/api/stats/trending');
    return response.data.data.trending;
  });

  const mentionOptions = useMemo(() => {
    if (!suggestedUsers) return [];
    return suggestedUsers
      .map((u: any) => {
        const handle = (u.username || u.name || '').replace(/\s+/g, '').toLowerCase();
        return {
          label: u.name || handle || 'Member',
          value: `@${handle || 'member'}`,
          meta: u.bio || u.country_of_origin || '',
        };
      })
      .filter((option: any) => option.value.length > 2 && option.label.trim().length > 0);
  }, [suggestedUsers]);

  const hashtagOptions = useMemo(() => {
    if (!trendingTopics) return [];
    return trendingTopics.map((topic: any) => ({
      label: `#${topic.tag}`,
      value: `#${topic.tag}`,
      meta: topic.count,
    }));
  }, [trendingTopics]);

  const filteredSuggestions = useMemo(() => {
    if (!suggestionType) return [];
    const pool = suggestionType === 'mention' ? mentionOptions : hashtagOptions;
    const query = suggestionQuery.toLowerCase();
    return pool
      .filter((item: any) =>
        !query ||
        item.value.toLowerCase().includes(query) ||
        (item.label && item.label.toLowerCase().includes(query))
      )
      .slice(0, 8);
  }, [suggestionType, suggestionQuery, mentionOptions, hashtagOptions]);

  const createStoryMutation = useMutation(
    async (data: any) => {
      const response = await axios.post('/api/stories', data);
      const storyId = response.data.data.story.id;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await axios.post(`/api/stories/${storyId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      return response.data;
    },
    {
      onSuccess: () => {
        navigate('/forum');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-generate title from first line or first 50 chars
    const title = content.split('\n')[0].slice(0, 100) || 'Untitled Post';
    const tags = extractHashtags(content);

    createStoryMutation.mutate({
      title,
      content,
      excerpt: content.slice(0, 200),
      category: 'General',
      tags,
    });
  };

  const insertSuggestion = (value: string) => {
    const textarea = textareaRef.current;
    const cursor = textarea?.selectionStart ?? content.length;
    const textBeforeCursor = content.slice(0, cursor);
    const match = textBeforeCursor.match(/(^|\s)([@#][\w]{0,30})$/);

    if (!textarea || !match) {
      setShowSuggestions(false);
      return;
    }

    const start = cursor - (match[2]?.length || 0);
    const prefix = content.slice(0, start);
    const suffix = content.slice(cursor);
    const needsSpace = suffix.length === 0 || !suffix.startsWith(' ');
    const inserted = `${prefix}${value}${needsSpace ? ' ' : ''}`;
    const nextValue = `${inserted}${suffix}`;

    setContent(nextValue);
    setShowSuggestions(false);
    setSuggestionType(null);
    setSuggestionQuery('');

    const newCursor = inserted.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);

    const cursor = e.target.selectionStart || 0;
    const textBeforeCursor = text.slice(0, cursor);
    const match = textBeforeCursor.match(/(^|\s)([@#][\w]{0,30})$/);

    if (match) {
      const token = match[2] || '';
      setSuggestionType(token.startsWith('@') ? 'mention' : 'hashtag');
      setSuggestionQuery(token.slice(1));
      setShowSuggestions(true);
      setActiveSuggestion(0);
    } else {
      setShowSuggestions(false);
      setSuggestionType(null);
      setSuggestionQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const choice = filteredSuggestions[activeSuggestion];
      if (choice) {
        insertSuggestion(choice.value);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSuggestionType(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-4">
            <UserProfileWidget />
            <QuickActionsWidget />
            <CommunityStatsWidget />
          </aside>

          {/* Compose Card */}
          <main className="lg:col-span-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
              <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Create a post</p>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Share your story</h1>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim() || createStoryMutation.isLoading}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg font-semibold text-sm transition-colors"
                  >
                    {createStoryMutation.isLoading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user?.full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  <div className="flex-1 relative">
                    <textarea
                      value={content}
                      onChange={handleContentChange}
                      onKeyDown={handleKeyDown}
                      ref={textareaRef}
                      placeholder="What's on your mind? Use #tags or @mention people"
                      className="w-full min-h-[160px] text-[17px] bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      autoFocus
                    />

                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg z-20">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {suggestionType === 'mention' ? 'Mention someone' : 'Add a topic'}
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredSuggestions.map((item: any, index: number) => (
                            <button
                              type="button"
                              key={`${item.value}-${index}`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                insertSuggestion(item.value);
                              }}
                              className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
                                index === activeSuggestion
                                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-200'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold">{item.value}</span>
                                {item.label && item.label !== item.value && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
                                )}
                              </div>
                              {item.meta && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 ml-3">
                                  {item.meta}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {imagePreview && (
                      <div className="relative mt-4 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img src={imagePreview} alt="Preview" className="w-full" />
                        <button
                          onClick={removeImage}
                          className="absolute top-2 right-2 w-8 h-8 bg-gray-900/80 hover:bg-gray-900 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 cursor-pointer transition-colors">
                    <ImageIcon className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {content.length > 0 && `${content.length} characters`}
                </div>
              </div>
            </div>
          </main>

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
