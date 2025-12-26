import { useState } from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';
import { mockAISummarizer, AISummaryResult } from '../utils/mockAISummarizer';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '../Config';
import axios from 'axios';

interface UniversalAddProps {
  onSuccess?: () => void;
}

const UniversalAdd = ({ onSuccess }: UniversalAddProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsLoading(true);

    try {
      // Call mock AI summarizer
      const aiResult: AISummaryResult = await mockAISummarizer(url);

      // Create content using backend API
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/content`,
        {
          link: url,
          title: aiResult.title,
          type: aiResult.type,
          tags: aiResult.tags,
        },
        {
          headers: {
            'Authorization': localStorage.getItem('token') || '',
          },
        }
      );

      if (response.status === 200) {
        // Success! Show toast and reset
        toast.success(
          <div className="flex items-center gap-2">
            <span className="text-green-500 text-xl">✓</span>
            <span>AI analyzed and added your link!</span>
          </div>,
          { autoClose: 2000 }
        );

        // Reset input
        setUrl('');
        
        // Call onSuccess callback to refresh content
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('Error adding content:', error);
      toast.error(error.message || 'Failed to add content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative transition-all duration-300 ${
            isFocused
              ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-zinc-950'
              : ''
          }`}
          style={{ borderRadius: '1rem' }}
        >
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="✨ Paste any URL here and let AI do the magic..."
            disabled={isLoading}
            className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <SparklesIcon className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">AI is reading...</span>
            </div>
          )}
        </div>

        {/* Loading State Card */}
        {isLoading && (
          <div className="mt-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <SparklesIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                AI is reading the content...
              </h3>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-indigo-200 dark:bg-indigo-800 rounded-full w-3/4 animate-pulse"></div>
              <div className="h-4 bg-indigo-200 dark:bg-indigo-800 rounded-full w-full animate-pulse"></div>
              <div className="h-4 bg-indigo-200 dark:bg-indigo-800 rounded-full w-5/6 animate-pulse"></div>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-6 w-16 bg-indigo-300 dark:bg-indigo-700 rounded-full animate-pulse"></div>
              <div className="h-6 w-20 bg-indigo-300 dark:bg-indigo-700 rounded-full animate-pulse"></div>
              <div className="h-6 w-14 bg-indigo-300 dark:bg-indigo-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </form>

      {/* Helper Text */}
      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 text-center">
        Paste any article, video, or tweet URL — Our AI will generate a title, summary, and tags automatically
      </p>
    </div>
  );
};

export default UniversalAdd;
