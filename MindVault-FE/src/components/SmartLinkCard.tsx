import { useState, Fragment, useRef, useCallback } from 'react';
import { Dialog, Transition, Menu } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Trash2, 
  ExternalLink, 
  X, 
  MoreVertical, 
  Check,
  Copy,
  Globe,
  Play
} from 'lucide-react';
import { YouTubeEmbed, TwitterEmbed } from 'react-social-media-embed';
import { useNests } from '../hooks/useNests';
import axios from 'axios';
import { BACKEND_URL } from '../Config';
import { toast } from 'react-toastify';

interface SmartLinkCardProps {
  id: string;
  title: string;
  url: string;
  type: string; // 'youtube' | 'twitter' | 'article' | 'github' | 'medium' | 'substack' | 'other'
  tags?: string[];
  date?: string;
  description?: string;  // Short snippet (2 lines)
  thumbnailUrl?: string | null; // og:image or site screenshot
  favicon?: string;
  siteName?: string;
  currentNestId?: string | null;
  onDelete?: (id: string) => void;
  onShare?: () => void;
  onRefresh?: () => void;
  index?: number; // For staggered animations
}

// Helper to extract YouTube Video ID
const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Helper to extract Twitter/X Post ID
const extractTweetUrl = (url: string): string => {
  // Normalize x.com to twitter.com for the embed component
  return url.replace('x.com', 'twitter.com');
};

// Content Type Badge Colors
const getTypeBadgeStyle = (type: string) => {
  switch (type) {
    case 'youtube': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'twitter': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    case 'github': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    case 'medium': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'substack': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default: return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
  }
};

export default function SmartLinkCard({
  id,
  title,
  url,
  type,
  tags = [],
  date = new Date().toLocaleDateString(),
  description,
  thumbnailUrl,
  favicon,
  siteName,
  currentNestId,
  onDelete,
  onShare,
  onRefresh,
  index = 0
}: SmartLinkCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { nests } = useNests();
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Determine content type for rendering
  const contentType = type.toLowerCase();
  const isYouTube = contentType === 'youtube';
  const isTwitter = contentType === 'twitter';
  const isSocialEmbed = isYouTube || isTwitter;
  
  // YouTube specific
  const youtubeId = isYouTube ? extractYouTubeId(url) : null;
  const tweetUrl = isTwitter ? extractTweetUrl(url) : null;
  
  // Get thumbnail - YouTube has auto-generation
  const getThumbnail = () => {
    if (thumbnailUrl && !imageError) return thumbnailUrl;
    if (isYouTube && youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }
    return null;
  };
  
  const finalThumbnail = getThumbnail();
  
  // Domain extraction for articles
  const getDomain = () => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Link';
    }
  };

  const handleMoveToNest = async (nestId: string | null) => {
    try {
      await axios.put(`${BACKEND_URL}/api/v1/content/${id}`, 
        { nestId },
        { headers: { Authorization: localStorage.getItem('token') || '' } }
      );
      toast.success('Moved successfully!');
      onRefresh?.();
    } catch (error) {
      console.error('Error moving to nest:', error);
      toast.error('Failed to move content');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(
        `${BACKEND_URL}/api/v1/content/${id}`,
        { headers: { Authorization: localStorage.getItem('token') || '' } }
      );
      toast.success('Deleted successfully');
      onDelete?.(id);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied!', { autoClose: 1500 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [url]);

  const handleOpenNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ============================================
  // HYBRID RENDERER - The Core Logic
  // ============================================
  const renderContent = () => {
    // 1. YouTube - Placeholder mode, full iframe on hover/click
    if (isYouTube && youtubeId) {
      return (
        <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden group/embed">
          <AnimatePresence mode="wait">
            {!showEmbed ? (
              // Placeholder Mode
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <img 
                  src={finalThumbnail || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Play Button */}
                <motion.button
                  onClick={(e) => { e.stopPropagation(); setShowEmbed(true); }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30">
                    <Play size={28} className="text-white ml-1" fill="white" />
                  </div>
                </motion.button>
                
                {/* YouTube Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 rounded-md flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                    <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span className="text-xs font-semibold text-white">YouTube</span>
                </div>
              </motion.div>
            ) : (
              // Live Embed Mode
              <motion.div
                key="embed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full"
              >
                <YouTubeEmbed 
                  url={url} 
                  width="100%" 
                  height="100%"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // 2. Twitter - Native Tweet Embed
    if (isTwitter && tweetUrl) {
      return (
        <div className="relative w-full min-h-[300px] max-h-[500px] bg-slate-900 rounded-2xl overflow-hidden">
          {/* Twitter Badge */}
          <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-black rounded-md flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-xs font-semibold text-white">𝕏</span>
          </div>
          
          <div className="p-2 [&>div]:!bg-transparent [&_iframe]:rounded-xl">
            <TwitterEmbed 
              url={tweetUrl}
              width="100%"
            />
          </div>
        </div>
      );
    }

    // 3. Rich Article Card - For Medium, Substack, GitHub, and other articles
    return (
      <div className="relative w-full bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-700/50">
        {/* Large og:image or placeholder */}
        {finalThumbnail ? (
          <div className="relative h-44 overflow-hidden">
            <img 
              src={finalThumbnail}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          </div>
        ) : (
          // Fallback: Gradient with Domain icon
          <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <Globe size={48} className="text-slate-600" />
          </div>
        )}
        
        {/* Content */}
        <div className="p-4 space-y-2">
          {/* Site info */}
          <div className="flex items-center gap-2">
            {favicon ? (
              <img 
                src={favicon} 
                alt="" 
                className="w-4 h-4 rounded" 
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <Globe size={14} className="text-slate-500" />
            )}
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider truncate">
              {siteName || getDomain()}
            </span>
          </div>
          
          {/* Title - Bold */}
          <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 group-hover:text-indigo-300 transition-colors">
            {title}
          </h3>
          
          {/* Description Snippet - 2 lines */}
          {description && (
            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
          
          {/* Type Badge */}
          <div className="pt-1">
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full border ${getTypeBadgeStyle(contentType)}`}>
              {contentType}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // MAIN CARD WRAPPER
  // ============================================
  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.4, 
          delay: index * 0.05,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        whileHover={{ y: -4 }}
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          // Reset YouTube embed on leave if not playing
          if (isYouTube && showEmbed) {
            setShowEmbed(false);
          }
        }}
        className={`
          group relative cursor-pointer
          rounded-3xl overflow-hidden
          bg-slate-900/80 backdrop-blur-xl
          border border-slate-700/50
          shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10
          transition-all duration-300
          ${isSocialEmbed ? 'row-span-2' : ''} 
        `}
      >
        {/* Live Window Content */}
        <div className="p-3">
          {renderContent()}
        </div>
        
        {/* Bottom Info Bar - Only for non-embeds */}
        {!isSocialEmbed && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 2).map((tag, i) => (
                  <span 
                    key={i}
                    className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              {/* Date */}
              <span className="text-xs text-slate-500">{date}</span>
            </div>
          </div>
        )}
        
        {/* Social Embeds - Title & Tags below */}
        {isSocialEmbed && (
          <div className="px-4 pb-4 space-y-2">
            <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 group-hover:text-indigo-300 transition-colors">
              {title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 2).map((tag, i) => (
                  <span 
                    key={i}
                    className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-slate-500">{date}</span>
            </div>
          </div>
        )}

        {/* Quick Actions Overlay - appears on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute top-5 right-5 flex items-center gap-1.5 z-20"
        >
          {/* Copy Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="p-2 rounded-full bg-slate-800/90 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all backdrop-blur-sm"
            title="Copy URL"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </motion.button>

          {/* Open in new tab */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenNewTab}
            className="p-2 rounded-full bg-slate-800/90 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all backdrop-blur-sm"
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </motion.button>

          {/* Share */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onShare?.(); }}
            className="p-2 rounded-full bg-slate-800/90 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all backdrop-blur-sm"
            title="Share"
          >
            <Share2 size={14} />
          </motion.button>

          {/* Delete */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="p-2 rounded-full bg-slate-800/90 border border-red-900/50 text-red-400 hover:text-red-300 hover:bg-red-900/50 transition-all backdrop-blur-sm"
            title="Delete"
          >
            <Trash2 size={14} />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* --- Detail Slide-over Panel --- */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300 sm:duration-500"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300 sm:duration-500"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-lg">
                    <div className="flex h-full flex-col bg-slate-900 shadow-2xl border-l border-slate-800">
                      
                      {/* Panel Header */}
                      <div className="flex items-start justify-between px-6 py-5 border-b border-slate-800">
                        <div className="flex-1 pr-4">
                          <Dialog.Title className="text-xl font-bold text-white leading-tight">
                            {title}
                          </Dialog.Title>
                          <div className="flex items-center gap-2 mt-2">
                            {favicon && (
                              <img src={favicon} alt="" className="w-4 h-4 rounded" />
                            )}
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm font-medium truncate"
                            >
                              {getDomain()} <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* Panel Body - Live Preview */}
                      <div className="flex-1 overflow-y-auto p-6">
                        {/* Live Embed */}
                        <div className="rounded-2xl overflow-hidden border border-slate-700 mb-6">
                          {isYouTube && youtubeId && (
                            <YouTubeEmbed url={url} width="100%" />
                          )}
                          {isTwitter && tweetUrl && (
                            <div className="bg-black p-2">
                              <TwitterEmbed url={tweetUrl} width="100%" />
                            </div>
                          )}
                          {!isSocialEmbed && finalThumbnail && (
                            <img src={finalThumbnail} alt={title} className="w-full" />
                          )}
                        </div>
                        
                        {/* Tags */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {tags.map((tag, i) => (
                              <span 
                                key={i} 
                                className="px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full border border-slate-700"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Description */}
                        {description && (
                          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Panel Footer - Actions */}
                      <div className="flex justify-between items-center px-6 py-4 border-t border-slate-800 bg-slate-900/50">
                        <Menu as="div" className="relative">
                          <Menu.Button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
                            Move to Nest
                            <MoreVertical size={14} className="text-slate-400" />
                          </Menu.Button>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute bottom-full left-0 mb-2 w-56 origin-bottom-left rounded-xl bg-slate-800 border border-slate-700 shadow-2xl overflow-hidden z-50">
                              <div className="p-1.5">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleMoveToNest(null)}
                                      className={`${
                                        active ? 'bg-slate-700' : ''
                                      } w-full flex items-center justify-between px-3 py-2 text-sm text-slate-200 rounded-lg`}
                                    >
                                      <span>Uncategorized</span>
                                      {currentNestId === null && <Check size={16} className="text-indigo-400" />}
                                    </button>
                                  )}
                                </Menu.Item>
                                
                                {nests.map((nest) => (
                                  <Menu.Item key={nest._id}>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleMoveToNest(nest._id)}
                                        className={`${
                                          active ? 'bg-slate-700' : ''
                                        } w-full flex items-center justify-between px-3 py-2 text-sm text-slate-200 rounded-lg`}
                                      >
                                        <span>📁 {nest.name}</span>
                                        {currentNestId === nest._id && <Check size={16} className="text-indigo-400" />}
                                      </button>
                                    )}
                                  </Menu.Item>
                                ))}
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                        
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                        >
                          <ExternalLink size={16} />
                          Open Original
                        </a>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
