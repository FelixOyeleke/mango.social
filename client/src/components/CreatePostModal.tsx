import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Smile } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

interface CreatePostModalProps {
  onClose: () => void;
}

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const MAX_WORDS = 500;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const count = words.length;

    if (count <= MAX_WORDS) {
      setContent(text);
      setWordCount(count);

      // Extract hashtags
      const hashtagMatches = text.match(/#[\w]+/g);
      if (hashtagMatches) {
        const uniqueTags = [...new Set(hashtagMatches.map(tag => tag.substring(1).toLowerCase()))];
        setTags(uniqueTags);
      } else {
        setTags([]);
      }
    }
  };

  const createStoryMutation = useMutation(
    async (data: any) => {
      // First create the story
      const response = await axios.post('/api/stories', data);
      const storyId = response.data.data.story.id;

      // Then upload the image if one was selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await axios.post(`/api/stories/${storyId}/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
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

    // Auto-generate title from first line or first 50 chars
    const title = content.split('\n')[0].slice(0, 100) || 'Untitled Post';

    createStoryMutation.mutate({
      title,
      content,
      excerpt: content.slice(0, 200),
      category: 'General',
      tags,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.full_name || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Posting to everyone</p>
            </div>
          </div>

          {/* Content */}
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="What's on your mind?"
            rows={6}
            className="w-full px-0 py-2 border-0 focus:ring-0 text-gray-900 dark:text-white dark:bg-gray-900 placeholder-gray-400 resize-none text-lg"
            required
            autoFocus
          />

          {/* Word Counter */}
          <div className={`text-sm text-right mb-2 ${wordCount > MAX_WORDS * 0.9 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
            {wordCount}/{MAX_WORDS} words
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-96 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-gray-900/80 text-white rounded-full hover:bg-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
                title="Add image"
              >
                <ImageIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors group"
                title="Add emoji (coming soon)"
              >
                <Smile className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim() || createStoryMutation.isLoading}
                className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createStoryMutation.isLoading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
