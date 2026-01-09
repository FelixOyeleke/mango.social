import { useState, useRef, useEffect } from 'react';
import { X, Quote, Image as ImageIcon } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import QuotePostCard from './QuotePostCard';

interface Story {
  id: string;
  title: string;
  excerpt: string;
  author_name: string;
  author_avatar?: string;
  published_at: string;
  featured_image_url?: string;
  slug?: string;
}

interface QuotePostModalProps {
  story: Story;
  onClose: () => void;
}

export default function QuotePostModal({ story, onClose }: QuotePostModalProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const createQuoteMutation = useMutation(
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
        queryClient.invalidateQueries('stories');
        onClose();
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const title = content.split('\n')[0].slice(0, 100) || 'Untitled Quote';

    createQuoteMutation.mutate({
      title,
      content,
      excerpt: content.slice(0, 200),
      category: 'General',
      quoted_story_id: story.id,
    });
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl my-8 border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quote Post</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* User Info */}
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold flex-shrink-0">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add your comment..."
                className="w-full min-h-[100px] text-gray-900 dark:text-white bg-transparent border-none outline-none resize-none text-lg placeholder-gray-400"
                maxLength={500}
              />
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mb-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={imagePreview} alt="Preview" className="w-full max-h-80 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Quoted Post */}
          <QuotePostCard quotedStory={story} />

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors text-primary-600"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="submit"
              disabled={!content.trim() || createQuoteMutation.isLoading}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold rounded-full transition-colors disabled:cursor-not-allowed"
            >
              {createQuoteMutation.isLoading ? 'Posting...' : 'Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

