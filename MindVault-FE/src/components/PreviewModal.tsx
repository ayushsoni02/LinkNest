// PreviewModal - Hybrid preview component with social embeds and meta cards
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { 
    X, 
    ExternalLink, 
    Tag, 
    FolderInput, 
    Check, 
    Loader2,
    Globe
} from 'lucide-react';
import { TwitterEmbed, YouTubeEmbed, InstagramEmbed } from 'react-social-media-embed';
import type { ExtractedMetadata } from '../services/contentService';
import { useNests } from '../hooks/useNests';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    metadata: ExtractedMetadata | null;
    url: string;
    onSave: (data: { title: string; tags: string[]; nestId: string | null }) => Promise<void>;
    isSaving?: boolean;
}

export default function PreviewModal({
    isOpen,
    onClose,
    metadata,
    url,
    onSave,
    isSaving = false
}: PreviewModalProps) {
    // Editable fields
    const [title, setTitle] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [selectedNestId, setSelectedNestId] = useState<string | null>(null);
    
    const { nests } = useNests();

    // Update state when metadata changes
    if (metadata && title !== metadata.title && title === '') {
        setTitle(metadata.title);
    }

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleSave = async () => {
        await onSave({
            title: title || metadata?.title || url,
            tags,
            nestId: selectedNestId
        });
        // Reset state
        setTitle('');
        setTags([]);
        setTagInput('');
        setSelectedNestId(null);
    };

    const handleClose = () => {
        setTitle('');
        setTags([]);
        setTagInput('');
        setSelectedNestId(null);
        onClose();
    };

    /**
     * Render the appropriate preview based on platform
     */
    const renderPreview = () => {
        if (!metadata) {
            return (
                <div className="flex items-center justify-center h-64 bg-slate-800/50 rounded-xl">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
            );
        }

        const platform = metadata.platform;

        // Social Media Embeds
        switch (platform) {
            case 'youtube':
                return (
                    <div className="rounded-xl overflow-hidden bg-black">
                        <YouTubeEmbed 
                            url={url} 
                            width="100%" 
                            height={300}
                        />
                    </div>
                );

            case 'twitter':
                return (
                    <div className="rounded-xl overflow-hidden bg-slate-900 flex justify-center">
                        <TwitterEmbed 
                            url={url} 
                            width={400}
                        />
                    </div>
                );

            case 'instagram':
                return (
                    <div className="rounded-xl overflow-hidden bg-slate-900 flex justify-center max-h-[400px] overflow-y-auto">
                        <InstagramEmbed 
                            url={url} 
                            width={328}
                        />
                    </div>
                );

            // Custom Meta Card for articles/other platforms
            case 'github':
            case 'substack':
            case 'medium':
            case 'article':
            default:
                return renderMetaCard();
        }
    };

    /**
     * Render custom meta card for articles
     */
    const renderMetaCard = () => {
        if (!metadata) return null;

        const hasImage = metadata.image && !metadata.image.includes('placeholder');

        return (
            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50">
                {/* Image Header */}
                {hasImage ? (
                    <div className="relative h-48 overflow-hidden">
                        <img 
                            src={metadata.image!}
                            alt={metadata.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    </div>
                ) : (
                    // Fallback placeholder with favicon and domain
                    <div className="relative h-48 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex flex-col items-center justify-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center gap-3"
                        >
                            {/* Large Favicon */}
                            <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shadow-2xl">
                                <img 
                                    src={metadata.favicon}
                                    alt=""
                                    className="w-12 h-12"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                                <Globe className="w-10 h-10 text-slate-500 absolute" style={{ display: 'none' }} />
                            </div>
                            
                            {/* Domain Name */}
                            <span className="text-lg font-semibold text-slate-300 uppercase tracking-wider">
                                {metadata.domain}
                            </span>
                        </motion.div>
                        
                        {/* Decorative gradient orbs */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                    </div>
                )}

                {/* Content */}
                <div className="p-5">
                    {/* Site name */}
                    <div className="flex items-center gap-2 mb-2">
                        <img 
                            src={metadata.favicon}
                            alt=""
                            className="w-4 h-4 rounded"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            {metadata.siteName}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white leading-snug mb-2">
                        {metadata.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-400 line-clamp-3">
                        {metadata.description}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-700/50 shadow-2xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
                                    <Dialog.Title className="text-lg font-semibold text-white">
                                        Preview & Save
                                    </Dialog.Title>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Preview Section */}
                                <div className="p-5">
                                    {renderPreview()}
                                </div>

                                {/* Editable Fields */}
                                <div className="px-5 pb-5 space-y-4">
                                    {/* Title Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Enter a title..."
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                                        />
                                    </div>

                                    {/* Tags Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            <Tag size={14} className="inline mr-1" />
                                            Tags
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {tags.map((tag) => (
                                                <motion.span
                                                    key={tag}
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="flex items-center gap-1 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm rounded-full"
                                                >
                                                    {tag}
                                                    <button
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="hover:text-white"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </motion.span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Add a tag..."
                                                className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            />
                                            <button
                                                onClick={handleAddTag}
                                                disabled={!tagInput.trim()}
                                                className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    {/* Nest Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">
                                            <FolderInput size={14} className="inline mr-1" />
                                            Save to Nest
                                        </label>
                                        <select
                                            value={selectedNestId || ''}
                                            onChange={(e) => setSelectedNestId(e.target.value || null)}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                                        >
                                            <option value="">Uncategorized</option>
                                            {nests.map((nest) => (
                                                <option key={nest._id} value={nest._id}>
                                                    📁 {nest.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-700/50 bg-slate-800/30">
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                                    >
                                        <ExternalLink size={14} />
                                        Open Original
                                    </a>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check size={18} />
                                                Confirm & Save
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
