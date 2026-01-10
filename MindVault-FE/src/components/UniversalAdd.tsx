import { useState } from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';
import { toast } from 'react-toastify';
import { Upload } from 'lucide-react';
import AIPreviewModal from './AIPreviewModal';
import BatchImportModal from './BatchImportModal';
import { mockAISummarizer } from '../utils/mockAISummarizer';
import { saveContent } from '../services/aiService';
import type { AIAnalysisResult } from '../services/aiService';

interface UniversalAddProps {
  onSuccess?: () => void;
}

const UniversalAdd = ({ onSuccess }: UniversalAddProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [analysisData, setAnalysisData] = useState<AIAnalysisResult | null>(null);
  const [suggestedNestId, setSuggestedNestId] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Batch import modal state
  const [showBatchImport, setShowBatchImport] = useState(false);

  const handleAnalyze = async (urlToAnalyze: string) => {
    setIsLoading(true);

    try {
      // TEMPORARILY USING MOCK AI - Real Gemini integration disabled
      const mockResult = await mockAISummarizer(urlToAnalyze);
      
      // Convert mock result to AI format
      const analysis: AIAnalysisResult = {
        title: mockResult.title,
        summary: mockResult.summary,
        tags: mockResult.tags,
        type: mockResult.type,
        aiMetadata: {
          model: 'mock-ai',
          processingTime: 1500,
          extractedContentLength: 1000
        }
      };
      
      // Temporarily disabled - no nest suggestion during mock mode
      const suggestedNest = null;
      
      // Step 3: Show preview modal
      setAnalysisData(analysis);
      setSuggestedNestId(suggestedNest);
      setCurrentUrl(urlToAnalyze);
      setShowPreview(true);
      setUrl(''); // Clear input
      
    } catch (error: any) {
      console.error('Error analyzing content:', error);
      toast.error(error.message || 'Failed to analyze URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    await handleAnalyze(url);
  };

  const handleRegenerate = async () => {
    if (!currentUrl) return;
    
    setIsRegenerating(true);
    try {
      // TEMPORARILY USING MOCK AI
      const mockResult = await mockAISummarizer(currentUrl);
      
      const analysis: AIAnalysisResult = {
        title: mockResult.title,
        summary: mockResult.summary,
        tags: mockResult.tags,
        type: mockResult.type,
        aiMetadata: {
          model: 'mock-ai',
          processingTime: 1500,
          extractedContentLength: 1000
        }
      };
      
      // Temporarily disabled - no nest suggestion
      const suggestedNest = null;
      
      setAnalysisData(analysis);
      setSuggestedNestId(suggestedNest);
      toast.success('Content regenerated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to regenerate. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSave = async (editedData: {
    title: string;
    summary: string;
    tags: string[];
    nestId: string | null;
  }) => {
    if (!analysisData) return;
    
    try {
      await saveContent({
        link: currentUrl,
        title: editedData.title,
        type: analysisData.type,
        tags: editedData.tags,
        summary: editedData.summary,
        aiMetadata: analysisData.aiMetadata,
        nestId: editedData.nestId
      });

      toast.success(
        <div className="flex items-center gap-2">
          <span className="text-green-500 text-xl">✓</span>
          <span>AI analyzed and added your link!</span>
        </div>,
        { autoClose: 2000 }
      );

      // Call onSuccess callback to refresh content
      if (onSuccess) {
        onSuccess();
      }
      
      setShowPreview(false);
      setAnalysisData(null);
      
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content. Please try again.');
    }
  };

  return (
    <>
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

        {/* Batch Import Button */}
        <div className="mt-4 flex items-center justify-center">
          <button
            onClick={() => setShowBatchImport(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={16} />
            Batch Import Multiple URLs
          </button>
        </div>

        {/* Helper Text */}
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 text-center">
          Paste any article, video, or tweet URL — Our AI will generate a title, summary, and tags automatically
        </p>
      </div>

      {/* AI Preview Modal */}
      <AIPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        analysisData={analysisData}
        url={currentUrl}
        suggestedNestId={suggestedNestId}
        onSave={handleSave}
        onRegenerate={handleRegenerate}
        isRegenerating={isRegenerating}
      />

      {/* Batch Import Modal */}
      <BatchImportModal
        isOpen={showBatchImport}
        onClose={() => setShowBatchImport(false)}
        onSuccess={() => {
          if (onSuccess) onSuccess();
        }}
      />
    </>
  );
};

export default UniversalAdd;
