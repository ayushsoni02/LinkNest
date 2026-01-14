import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import { toast } from 'react-toastify';

interface UniversalAddBarProps {
  onSuccess?: () => void;
}

// Mock AI Summarizer
const simulateAISummary = async (url: string) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    title: "How to Build a Startup",
    summary: "A comprehensive guide covering the essential steps to launch a successful startup. Learn about market validation, funding strategies, team building, and scaling your business. Perfect for aspiring entrepreneurs.",
    tags: ["Startup", "Tech", "Business"],
    type: "YouTube"
  };
};

const UniversalAddBar = ({ onSuccess }: UniversalAddBarProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showGhostCard, setShowGhostCard] = useState(false);
  const [ghostCardData, setGhostCardData] = useState<any>(null);

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if it's a URL
    if (!pastedText.match(/^https?:\/\//)) {
      return; // Let normal paste behavior happen for non-URLs
    }

    e.preventDefault();
    setUrl(pastedText);
    
    // Immediately start processing
    await handleAnalyze(pastedText);
  };

  const handleAnalyze = async (urlToAnalyze: string) => {
    setIsLoading(true);
    setUrl(''); // Clear the input to show processing state

    try {
      const result = await simulateAISummary(urlToAnalyze);
      
      // Show success state
      setGhostCardData(result);
      setShowGhostCard(true);
      
      // Show success toast
      toast.success(
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          <span>AI analyzed your link successfully!</span>
        </div>,
        { autoClose: 2000 }
      );

      // Hide ghost card after animation
      setTimeout(() => {
        setShowGhostCard(false);
        if (onSuccess) onSuccess();
      }, 2500);
      
    } catch (error) {
      toast.error('Failed to analyze URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      {/* Main Input Container */}
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
            onPaste={handlePaste}
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
                  <Sparkles className="w-5 h-5 text-indigo-400" />
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
              <Sparkles className="w-6 h-6 text-slate-600 hover:text-indigo-400 transition-colors cursor-pointer" />
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

      {/* Ghost Card Animation */}
      <AnimatePresence>
        {showGhostCard && ghostCardData && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-6 p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl"
          >
            {/* Success Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50"
            >
              <Check className="w-6 h-6 text-white" />
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎬</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-100 mb-1">
                    {ghostCardData.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {ghostCardData.summary}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {ghostCardData.tags.map((tag: string, index: number) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium rounded-full"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>

              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                style={{ pointerEvents: "none" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-sm text-slate-500 text-center"
      >
        Paste any article, video, or tweet URL — AI will analyze it instantly
      </motion.p>
    </div>
  );
};

export default UniversalAddBar;
