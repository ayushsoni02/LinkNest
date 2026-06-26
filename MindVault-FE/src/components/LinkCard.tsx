import React, { useState, useRef, useCallback, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition, Menu } from '@headlessui/react';
import { 
    ExternalLink, 
    Copy, 
    FolderInput, 
    Trash2, 
    Share2,
    Check,
    MoreHorizontal,
    Globe,
    X,
    Sparkles,
    Play
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { YouTubeEmbed } from 'react-social-media-embed';
import { BACKEND_URL } from '../Config';
import { useNests } from '../hooks/useNests';

export interface LinkCardProps {
    id: string;
    url: string;
    title: string;
    description?: string;
    image?: string | null;
    siteName?: string;
    favicon?: string;
    tags?: string[];
    contentType: 'youtube' | 'twitter' | 'github' | 'instagram' | 'article' | 'medium' | 'substack' | 'other' | string;
    date?: string;
    aiSummary?: string;
    aiKeyPoints?: string[];
    currentNestId?: string | null;
    onDelete?: (id: string) => void;
    onRefresh?: () => void;
    onShare?: () => void;
    index?: number;
}

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

const getTypeBadgeStyle = (type: string) => {
    const t = type.toLowerCase();
    switch (t) {
        case 'youtube': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'twitter': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
        case 'github': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        case 'instagram': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
        case 'medium': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'substack': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        default: return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    }
};

const getPlatformIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'youtube') return <Play size={24} className="text-red-400" />;
    if (t === 'twitter') return <span className="font-bold text-sky-400 text-2xl">𝕏</span>;
    if (t === 'github') return <Globe size={24} className="text-slate-300" />;
    return <Globe size={32} className="text-slate-600" />;
};

export function LinkCardSkeleton() {
    return (
        <div className="relative rounded-2xl overflow-hidden bg-slate-900/50 border border-slate-700/50 h-full flex flex-col animate-pulse">
            <div className="w-full aspect-video bg-slate-800/50 shrink-0" />
            <div className="flex-1 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-700/50" />
                    <div className="h-3 w-16 bg-slate-700/50 rounded" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-slate-700/50 rounded w-full" />
                    <div className="h-4 bg-slate-700/50 rounded w-3/4" />
                </div>
            </div>
            <div className="mt-auto pt-3 border-t border-slate-800/50 px-4 pb-4 flex justify-between">
                <div className="flex gap-2">
                    <div className="h-4 w-12 bg-slate-700/50 rounded-full" />
                    <div className="h-4 w-16 bg-slate-700/50 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export default function LinkCard({
    id,
    url,
    title,
    description,
    image,
    siteName,
    favicon,
    tags = [],
    contentType,
    date,
    aiSummary,
    aiKeyPoints,
    currentNestId,
    onDelete,
    onRefresh,
    onShare,
    index = 0
}: LinkCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [showNestMenu, setShowNestMenu] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [copied, setCopied] = useState(false);
    const { nests } = useNests();

    const isYouTube = contentType.toLowerCase() === 'youtube';
    const youtubeId = isYouTube ? extractYouTubeId(url) : null;

    const getThumbnail = () => {
        if (image && !imageError && !image.includes('placeholder.com')) return image;
        if (isYouTube && youtubeId) {
            return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
        }
        return null;
    };
    const finalThumbnail = getThumbnail();

    const getDomain = () => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'Link';
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
            toast.error('Failed to copy link');
        }
    }, [url]);

    const handleOpenNewTab = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
    }, [url]);

    const handleMoveToNest = async (nestId: string | null, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
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

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare?.();
    };

    return (
        <>
            {/* Main Grid Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false);
                    setShowNestMenu(false);
                }}
                onClick={() => setIsPanelOpen(true)}
                className="group relative cursor-pointer flex flex-col h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
            >
                {/* A. Media / Top Thumbnail Section */}
                <div className="relative w-full aspect-video overflow-hidden bg-slate-950 border-b border-slate-800 shrink-0">
                    {finalThumbnail ? (
                        <img 
                            src={finalThumbnail}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center gap-2">
                            {getPlatformIcon(contentType)}
                            <span className="text-slate-500 text-sm font-medium uppercase tracking-widest">{contentType}</span>
                        </div>
                    )}
                    
                    {/* Dark overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />

                    {/* Platform Badge Overlay */}
                    <div className={`absolute top-3 left-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md border backdrop-blur-md ${getTypeBadgeStyle(contentType)}`}>
                        {contentType}
                    </div>
                </div>

                {/* B. Content Area */}
                <div className="flex-1 flex flex-col p-4">
                    {/* Site info row */}
                    <div className="flex items-center gap-2 mb-2">
                        {favicon ? (
                            <img src={favicon} alt="" className="w-4 h-4 rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        ) : (
                            <Globe size={14} className="text-slate-500" />
                        )}
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider truncate">
                            {siteName || getDomain()}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-white text-base leading-snug line-clamp-2 min-h-[3rem] group-hover:text-indigo-300 transition-colors">
                        {title}
                    </h3>

                    {/* Description Snippet (optional if we want more text, but sticking to min-h for title works) */}
                    {/* Since it's a tight card, we can omit the description here and save it for the Slide-over Panel, or show 1 line. We'll leave it out of the main grid for a cleaner look if the title is taking space, or line-clamp it. */}
                </div>

                {/* C. Card Footer */}
                <div className="mt-auto pt-3 border-t border-slate-800/50 px-4 pb-4 flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-1.5 overflow-hidden max-w-[70%]">
                        {tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50 truncate">
                                #{tag}
                            </span>
                        ))}
                    </div>
                    {date && <span className="text-[11px] text-slate-500 shrink-0">{date}</span>}
                </div>

                {/* Quick Actions Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute top-3 right-3 flex items-center gap-1.5 z-10"
                >
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={handleCopy} className="p-2 rounded-full bg-slate-800/90 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all backdrop-blur-sm shadow-sm" title="Copy URL">
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </motion.button>
                    
                    <div className="relative">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); setShowNestMenu(!showNestMenu); }} className="p-2 rounded-full bg-slate-800/90 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all backdrop-blur-sm shadow-sm" title="Move to Nest">
                            <FolderInput size={14} />
                        </motion.button>
                        {showNestMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-1.5">
                                    <button onClick={(e) => handleMoveToNest(null, e)} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${currentNestId === null ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-700'}`}>Uncategorized</button>
                                    {nests.map((nest) => (
                                        <button key={nest._id} onClick={(e) => handleMoveToNest(nest._id, e)} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${currentNestId === nest._id ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-700'}`}>📁 {nest.name}</button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={handleShare} className="p-2 rounded-full bg-slate-800/90 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all backdrop-blur-sm shadow-sm" title="Share">
                        <Share2 size={14} />
                    </motion.button>
                    
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={handleDelete} className="p-2 rounded-full bg-slate-800/90 border border-red-900/50 text-red-400 hover:text-red-300 hover:bg-red-900/50 transition-all backdrop-blur-sm shadow-sm" title="Delete">
                        <Trash2 size={14} />
                    </motion.button>
                </motion.div>
                
                {/* Mobile more options */}
                <button
                    className="md:hidden absolute top-3 right-3 p-2 rounded-full bg-slate-800/90 border border-slate-600/50 text-slate-400 shadow-sm z-10"
                    onClick={(e) => { e.stopPropagation(); setIsHovered(!isHovered); }}
                >
                    <MoreHorizontal size={14} />
                </button>
            </motion.div>

            {/* Slide-over Panel Content Structure */}
            <Transition appear show={isPanelOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsPanelOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                                <Transition.Child as={Fragment} enter="transform transition ease-in-out duration-300 sm:duration-500" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-300 sm:duration-500" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                                    <Dialog.Panel className="pointer-events-auto fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
                                            
                                        {/* 1. Header Layer (Fixed, Non-Scrolling) */}
                                        <div className="flex flex-col gap-4 p-6 border-b border-slate-800 bg-slate-900 shrink-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-md border ${getTypeBadgeStyle(contentType)}`}>
                                                        {contentType}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                        {favicon && <img src={favicon} alt="" className="w-4 h-4 rounded" />}
                                                        {siteName || getDomain()}
                                                    </span>
                                                </div>
                                                <button type="button" className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" onClick={() => setIsPanelOpen(false)}>
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            
                                            <Dialog.Title className="text-xl font-bold text-white leading-snug m-0 p-0">
                                                {title}
                                            </Dialog.Title>
                                        </div>

                                        {/* 2. Content Body Layer (Scrollable Zone) */}
                                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                            
                                            {/* Primary Action Button */}
                                            <a href={url} target="_blank" rel="noreferrer" className="w-full py-3 mb-2 font-medium text-center text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]">
                                                Open Original Link <ExternalLink size={16} />
                                            </a>
                                            {/* Media Preview */}
                                            {isYouTube && youtubeId ? (
                                                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-lg">
                                                    <YouTubeEmbed url={url} width="100%" height="100%" className="absolute top-0 left-0 w-full h-full border-0" />
                                                </div>
                                            ) : (
                                                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg">
                                                    {finalThumbnail ? (
                                                        <img src={finalThumbnail} alt={title} className="w-full h-full object-cover rounded-xl border border-slate-800" />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-800">
                                                            {getPlatformIcon(contentType)}
                                                            <span className="text-slate-500 text-sm font-medium uppercase tracking-widest">{contentType}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                                {/* 3. AI Insights & Summarization Engine */}
                                                <div className="relative rounded-2xl border border-indigo-500/20 bg-slate-800/50 p-6 shadow-inner shadow-indigo-500/5 overflow-hidden">
                                                    {/* Background glow */}
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                                                    
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Sparkles size={20} className="text-indigo-400" />
                                                        <h4 className="text-base font-bold text-indigo-300">AI Smart Digest</h4>
                                                    </div>
                                                    
                                                    {aiSummary || (aiKeyPoints && aiKeyPoints.length > 0) ? (
                                                        <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                                                            {aiSummary && (
                                                                <p className="mb-4 text-slate-300">{aiSummary}</p>
                                                            )}
                                                            
                                                            {aiKeyPoints && aiKeyPoints.length > 0 && (
                                                                <ul className="list-disc pl-5 space-y-2">
                                                                    {aiKeyPoints.map((point, i) => (
                                                                        <li key={i} className="text-slate-300">
                                                                            {point}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="animate-pulse space-y-3">
                                                            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                                                            <div className="h-4 bg-slate-700 rounded w-full"></div>
                                                            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Tags */}
                                                {tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {tags.map((tag, i) => (
                                                            <span key={i} className="px-3 py-1 bg-slate-800/80 text-slate-300 text-xs font-medium rounded-lg border border-slate-700/50">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
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
