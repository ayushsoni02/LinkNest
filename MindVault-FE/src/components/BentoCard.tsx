// BentoCard - Modern Bento-style link card with Live Embeds
// Features: YouTube placeholder mode, Twitter native embeds, Rich Article previews
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ExternalLink, 
    Copy, 
    FolderInput, 
    Trash2, 
    Play, 
    Check,
    MoreHorizontal,
    Globe
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { YouTubeEmbed, TwitterEmbed } from 'react-social-media-embed';
import { BACKEND_URL } from '../Config';
import { useNests } from '../hooks/useNests';

// Type definitions
interface BentoCardProps {
    id: string;
    url: string;
    title: string;
    description?: string;
    image?: string | null;
    siteName?: string;
    favicon?: string;
    tags?: string[];
    contentType: 'youtube' | 'twitter' | 'github' | 'instagram' | 'article' | 'medium' | 'substack' | 'other';
    isRichMedia?: boolean;
    date?: string;
    currentNestId?: string | null;
    onDelete?: (id: string) => void;
    onRefresh?: () => void;
    isLoading?: boolean;
    index?: number;
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

// Helper to extract Twitter/X Post URL
const extractTweetUrl = (url: string): string => {
    return url.replace('x.com', 'twitter.com');
};

// Content Type styles
const getTypeBadgeStyle = (type: string) => {
    switch (type) {
        case 'youtube': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'twitter': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
        case 'github': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        case 'instagram': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
        case 'medium': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'substack': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        default: return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    }
};

// Skeleton loader for cards
export function BentoCardSkeleton({ isLarge = false }: { isLarge?: boolean }) {
    return (
        <div className={`
            relative rounded-3xl overflow-hidden
            bg-gradient-to-br from-slate-800/50 to-slate-900/50
            border border-slate-700/50
            ${isLarge ? 'col-span-2 row-span-2' : ''} 
            animate-pulse
        `}>
            <div className={`w-full ${isLarge ? 'h-48' : 'h-32'} bg-slate-700/50`} />
            <div className="p-4 space-y-3">
                <div className="h-5 bg-slate-700/50 rounded-full w-3/4" />
                <div className="space-y-2">
                    <div className="h-3 bg-slate-700/30 rounded-full w-full" />
                    <div className="h-3 bg-slate-700/30 rounded-full w-5/6" />
                </div>
                <div className="flex gap-2 pt-2">
                    <div className="h-5 w-12 bg-slate-700/30 rounded-full" />
                    <div className="h-5 w-16 bg-slate-700/30 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export default function BentoCard({
    id,
    url,
    title,
    description,
    image,
    siteName,
    favicon,
    tags = [],
    contentType,
    isRichMedia = false,
    date,
    currentNestId,
    onDelete,
    onRefresh,
    isLoading = false,
    index = 0
}: BentoCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [showNestMenu, setShowNestMenu] = useState(false);
    const [showEmbed, setShowEmbed] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [copied, setCopied] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const { nests } = useNests();

    // Content type detection
    const isYouTube = contentType === 'youtube';
    const isTwitter = contentType === 'twitter';
    const isSocialEmbed = isYouTube || isTwitter;
    
    // Extract IDs
    const youtubeId = isYouTube ? extractYouTubeId(url) : null;
    const tweetUrl = isTwitter ? extractTweetUrl(url) : null;

    // Determine card sizing
    const isLarge = isSocialEmbed || (isRichMedia && Boolean(image));

    // Get thumbnail
    const getThumbnail = () => {
        if (image && !imageError) return image;
        if (isYouTube && youtubeId) {
            return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
        }
        return null;
    };

    const finalThumbnail = getThumbnail();

    // Domain extraction
    const getDomain = () => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'Link';
        }
    };

    // Handle copy URL
    const handleCopy = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('Link copied!', { autoClose: 1500 });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy link');
        }
    }, [url]);

    // Handle open in new tab
    const handleOpenNewTab = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
    }, [url]);

    // Handle move to nest
    const handleMoveToNest = async (nestId: string | null) => {
        try {
            await axios.put(
                `${BACKEND_URL}/api/v1/content/${id}`,
                { nestId },
                { headers: { Authorization: localStorage.getItem('token') || '' } }
            );
            toast.success('Moved to nest!');
            setShowNestMenu(false);
            onRefresh?.();
        } catch {
            toast.error('Failed to move to nest');
        }
    };

    // Handle delete
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await axios.delete(
                `${BACKEND_URL}/api/v1/content/${id}`,
                { headers: { Authorization: localStorage.getItem('token') || '' } }
            );
            toast.success('Link deleted');
            onDelete?.(id);
        } catch {
            toast.error('Failed to delete');
        }
    };

    // Render loading state
    if (isLoading) {
        return <BentoCardSkeleton isLarge={isLarge} />;
    }

    // ============================================
    // HYBRID RENDERER - The Core Logic
    // ============================================
    const renderContent = () => {
        // 1. YouTube - Placeholder mode, full iframe on hover/click
        if (isYouTube && youtubeId) {
            return (
                <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden">
                    <AnimatePresence mode="wait">
                        {!showEmbed ? (
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
                            <motion.div
                                key="embed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full h-full"
                            >
                                <YouTubeEmbed url={url} width="100%" height="100%" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        }

        // 2. Twitter - Native Tweet Embed
        if (isTwitter && tweetUrl) {
            return (
                <div className="relative w-full min-h-[280px] bg-slate-900 rounded-2xl overflow-hidden">
                    {/* Twitter/X Badge */}
                    <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-black rounded-md flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span className="text-xs font-semibold text-white">𝕏</span>
                    </div>
                    
                    <div className="p-2 [&>div]:!bg-transparent [&_iframe]:rounded-xl">
                        <TwitterEmbed url={tweetUrl} width="100%" />
                    </div>
                </div>
            );
        }

        // 3. Rich Article Card
        return (
            <>
                {/* Image section */}
                {finalThumbnail ? (
                    <div className="relative h-40 overflow-hidden rounded-t-2xl">
                        <img 
                            src={finalThumbnail}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    </div>
                ) : (
                    <div className="relative h-28 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center rounded-t-2xl">
                        <Globe size={40} className="text-slate-600" />
                    </div>
                )}

                {/* Content section */}
                <div className="p-4 md:p-5">
                    {/* Site info */}
                    <div className="flex items-center gap-2 mb-2">
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
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            {siteName || getDomain()}
                        </span>
                        {date && (
                            <>
                                <span className="text-slate-600">•</span>
                                <span className="text-xs text-slate-500">{date}</span>
                            </>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-white text-base leading-snug mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                        {title}
                    </h3>

                    {/* Description - 2 lines */}
                    {description && (
                        <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                            {description}
                        </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full border ${getTypeBadgeStyle(contentType)}`}>
                            {contentType}
                        </span>
                        {tags.slice(0, 2).map((tag, i) => (
                            <span 
                                key={i}
                                className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    return (
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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setShowNestMenu(false);
                // Reset YouTube embed on leave
                if (isYouTube && showEmbed) {
                    setShowEmbed(false);
                }
            }}
            onClick={handleOpenNewTab}
            className={`
                relative group cursor-pointer
                rounded-3xl overflow-hidden
                bg-slate-900/80 backdrop-blur-xl
                border border-slate-700/50
                shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10
                transition-all duration-300
                ${isLarge ? 'md:col-span-1 md:row-span-2' : ''}
            `}
        >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-950/95 pointer-events-none" />

            {/* Main Content */}
            <div className="relative">
                {renderContent()}
            </div>

            {/* Social Embed Bottom Info */}
            {isSocialEmbed && (
                <div className="relative px-4 pb-4 space-y-2">
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
                        {date && <span className="text-xs text-slate-500">{date}</span>}
                    </div>
                </div>
            )}

            {/* Quick Actions Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className="absolute top-3 right-3 flex items-center gap-1.5 z-10"
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

                {/* Move to Nest */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowNestMenu(!showNestMenu);
                        }}
                        className="p-2 rounded-full bg-slate-800/90 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all backdrop-blur-sm"
                        title="Move to Nest"
                    >
                        <FolderInput size={14} />
                    </motion.button>

                    {/* Nest dropdown */}
                    {showNestMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-1.5">
                                <button
                                    onClick={() => handleMoveToNest(null)}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                        currentNestId === null 
                                            ? 'bg-indigo-500/20 text-indigo-300' 
                                            : 'text-slate-300 hover:bg-slate-700'
                                    }`}
                                >
                                    Uncategorized
                                </button>
                                {nests.map((nest) => (
                                    <button
                                        key={nest._id}
                                        onClick={() => handleMoveToNest(nest._id)}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                            currentNestId === nest._id 
                                                ? 'bg-indigo-500/20 text-indigo-300' 
                                                : 'text-slate-300 hover:bg-slate-700'
                                        }`}
                                    >
                                        📁 {nest.name}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

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

            {/* More button (visible on mobile) */}
            <button
                className="md:hidden absolute top-3 right-3 p-2 rounded-full bg-slate-800/90 text-slate-400"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsHovered(!isHovered);
                }}
            >
                <MoreHorizontal size={16} />
            </button>
        </motion.div>
    );
}
