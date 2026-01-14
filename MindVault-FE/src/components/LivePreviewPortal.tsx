import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface LivePreviewPortalProps {
  isVisible: boolean;
  url: string;
  type: string;
  position: { x: number; y: number; cardWidth: number; cardHeight: number };
  onClose: () => void;
}

const LivePreviewPortal = ({ isVisible, url, type, position, onClose }: LivePreviewPortalProps) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('🔍 LivePreviewPortal render:', { isVisible, url, type, position });
  }, [isVisible, url, type, position]);

  // Helper to extract YouTube video ID
  const getYouTubeEmbedUrl = (youtubeUrl: string): string | null => {
    const parts = youtubeUrl.split('v=');
    const videoId = parts.length > 1 ? parts[1].split('&')[0] : null;
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&modestbranding=1`;
    }
    return null;
  };

  // Calculate optimal position to stay in viewport
  const getOptimalPosition = () => {
    if (!previewRef.current) return { top: 0, left: 0 };

    const previewWidth = 640; // 16:9 aspect ratio width
    const previewHeight = 360; // 16:9 aspect ratio height
    const padding = 20; // Space from viewport edges

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = position.y - previewHeight - 20; // Default: above the card
    let left = position.x;

    // If not enough space above, place below
    if (top < padding) {
      top = position.y + position.cardHeight + 20;
    }

    // If not enough space below, try right side
    if (top + previewHeight > viewportHeight  - padding) {
      top = position.y;
      left = position.x + position.cardWidth + 20;
    }

    // If not enough space on right, try left side
    if (left + previewWidth > viewportWidth - padding) {
      left = position.x - previewWidth - 20;
    }

    // Final bounds check
    top = Math.max(padding, Math.min(top, viewportHeight - previewHeight - padding));
    left = Math.max(padding, Math.min(left, viewportWidth - previewWidth - padding));

    return { top, left };
  };

  const optimalPosition = getOptimalPosition();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isVisible) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  const renderPreviewContent = () => {
    if (type === 'youtube') {
      const embedUrl = getYouTubeEmbedUrl(url);
      if (embedUrl) {
        return (
          <iframe
            src={embedUrl}
            title="YouTube Preview"
            className="w-full h-full rounded-2xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }

    // For websites, attempt to load in iframe
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl p-8">
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-4">
            Preview not available for this site due to security policies
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Open in New Tab
          </a>
        </div>
      </div>
    );
  };

  const portalRoot = document.getElementById('preview-root');
  if (!portalRoot) return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop - Click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />

          {/* Preview Window */}
          <motion.div
            ref={previewRef}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: `${optimalPosition.top}px`,
              left: `${optimalPosition.left}px`,
              width: '640px',
              height: '360px',
              zIndex: 70
            }}
            className="shadow-2xl"
          >
            {/* Mini Browser Chrome */}
            <div className="relative w-full h-full bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              {/* Browser Top Bar */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between px-4 z-10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" onClick={onClose} />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                </div>

                {/* URL Bar */}
                <div className="flex-1 mx-4 px-3 py-1 bg-slate-800 rounded-md border border-slate-600 flex items-center gap-2">
                  <span className="text-xs text-slate-400 truncate">{url}</span>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={16} className="text-slate-400 hover:text-slate-200" />
                </button>
              </div>

              {/* Content Area */}
              <div className="pt-10 w-full h-full bg-slate-950">
                {renderPreviewContent()}
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl rounded-2xl" />
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalRoot
  );
};

export default LivePreviewPortal;
