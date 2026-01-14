import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from '../icons/SparklesIcon';
import { toast } from 'react-toastify';
import { Upload } from 'lucide-react';
import AIPreviewModal from './AIPreviewModal';
import BatchImportModal from './BatchImportModal';
import { analyzeURL } from '../services/aiService';
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
      // Call REAL Gemini AI via backend
      console.log('🚀 Calling real Gemini AI for:', urlToAnalyze);
      const analysis = await analyzeURL(urlToAnalyze);
      console.log('✅ Received AI analysis:', analysis);
      
      // Note: Nest suggestion is temporarily disabled - can enable when needed
      const suggestedNest = null;
      
      // Show preview modal
      setAnalysisData(analysis);
      setSuggestedNestId(suggestedNest);
      setCurrentUrl(urlToAnalyze);
      setShowPreview(true);
      setUrl(''); // Clear input
      
    } catch (error: any) {
      console.error('❌ Error analyzing content:', error);
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
      // Call REAL Gemini AI for regeneration
      console.log('🔄 Regenerating with real AI');
      const analysis = await analyzeURL(currentUrl);
      
      setAnalysisData(analysis);
      setSuggestedNestId(null);
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
      <div className="w-full max-w-4xl mx-auto mb-12">
        <form onSubmit={handleSubmit} className="relative">
          {/* Magic Input with Deep Space Styling */}
          <motion.div
            initial={false}
            animate={{
              scale: isFocused ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div
              className={`relative rounded-2xl transition-all duration-300 ${
                isFocused
                  ? 'shadow-[0_0_0_3px_rgba(99,102,241,0.1),0_0_20px_rgba(99,102,241,0.3)]'
                  : 'shadow-[0_0_0_1px_rgba(148,163,184,0.2)]'
              }`}
            >
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={isLoading ? "" : "✨ Paste any URL here and let AI do the magic..."}
                disabled={isLoading}
                className="w-full px-8 py-5 text-lg rounded-2xl border-0 bg-slate-900/50 backdrop-blur-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Loading State with Typing Animation */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center gap-3"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <SparklesIcon className="w-5 h-5 text-indigo-400" />
                    </motion.div>
                    <motion.span
                      className="text-slate-300 font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 1, 1] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                    >
                      AI is reading the content
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 0.2
                        }}
                      >
                        ...
                      </motion.span>
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sparkles Icon (Right Side) */}
              {!isLoading && (
                <motion.div
                  className="absolute right-6 top-1/2 -translate-y-1/2"
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <SparklesIcon className="w-6 h-6 text-slate-600 hover:text-indigo-400 transition-colors cursor-pointer" />
                </motion.div>
              )}
            </div>

            {/* Focus Glow Effect */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl"
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Loading State Card */}
          {isLoading && (
            <div className="mt-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <SparklesIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  Processing with AI...
                </h3>
              </div>
              <p className="text-sm text-indigo-600 dark:text-indigo-300 mb-4">
                Analyzing content and generating summary. This may take up to 30 seconds for complex pages.
              </p>
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-sm text-slate-500 dark:text-slate-400 text-center"
        >
          Paste any article, video, or tweet URL — Our AI will generate a title, summary, and tags automatically
        </motion.p>
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
