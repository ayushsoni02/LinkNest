// AddLink - Simple link addition component with preview modal
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { extractMetadata, saveContent, type ExtractedMetadata } from '../services/contentService';
import PreviewModal from './PreviewModal';

interface AddLinkProps {
  onSuccess?: () => void;
}

const AddLink = ({ onSuccess }: AddLinkProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [metadata, setMetadata] = useState<ExtractedMetadata | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Basic URL validation
    if (!url.match(/^https?:\/\//)) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsLoading(true);

    try {
      // Extract metadata from URL
      console.log('📎 Extracting metadata for:', url);
      const extractedMetadata = await extractMetadata(url);
      console.log('✅ Metadata extracted:', extractedMetadata);
      
      // Show preview modal
      setMetadata(extractedMetadata);
      setCurrentUrl(url);
      setShowPreview(true);
      setUrl(''); // Clear input
      
    } catch (error: any) {
      console.error('❌ Error extracting metadata:', error);
      toast.error(error.message || 'Failed to fetch link details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: { title: string; tags: string[]; nestId: string | null }) => {
    if (!metadata) return;

    setIsSaving(true);

    try {
      await saveContent({
        link: currentUrl,
        title: data.title,
        type: metadata.contentType,
        tags: data.tags,
        description: metadata.description,
        image: metadata.image,
        nestId: data.nestId
      });

      toast.success(
        <div className="flex items-center gap-2">
          <span className="text-green-500 text-xl">✓</span>
          <span>Link added successfully!</span>
        </div>,
        { autoClose: 2000 }
      );

      setShowPreview(false);
      setMetadata(null);
      setCurrentUrl('');
      
      // Refresh content list
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error('❌ Error saving link:', error);
      toast.error(error.message || 'Failed to save link. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto mb-12">
        <form onSubmit={handleSubmit} className="relative">
          {/* Input Container */}
          <motion.div
            initial={false}
            animate={{
              scale: isFocused ? 1.01 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div
              className={`relative rounded-2xl transition-all duration-300 ${
                isFocused
                  ? 'shadow-[0_0_0_3px_rgba(99,102,241,0.15),0_0_30px_rgba(99,102,241,0.2)]'
                  : 'shadow-[0_0_0_1px_rgba(148,163,184,0.2)]'
              }`}
            >
              {/* Link Icon */}
              <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Link2 
                  size={20} 
                  className={`transition-colors ${
                    isFocused ? 'text-indigo-400' : 'text-slate-500'
                  }`} 
                />
              </div>

              {/* Input Field */}
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Paste a URL to add a link..."
                disabled={isLoading}
                className="w-full pl-14 pr-32 py-5 text-lg rounded-2xl border-0 bg-slate-900/60 backdrop-blur-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Add Button */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <motion.button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 
                    rounded-xl font-semibold text-sm
                    transition-all duration-200
                    ${isLoading || !url.trim()
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                    }
                  `}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add Link
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Focus Glow Effect */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-xl"
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Loading State Indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Fetching link details...</p>
                    <p className="text-xs text-slate-500">Extracting title and preview image</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Helper Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-sm text-slate-500 text-center"
        >
          Paste any article, video, or social media link to save it to your collection
        </motion.p>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setMetadata(null);
          setCurrentUrl('');
        }}
        metadata={metadata}
        url={currentUrl}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </>
  );
};

export default AddLink;
