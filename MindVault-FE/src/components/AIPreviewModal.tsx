import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, RefreshCw, Save, Sparkles } from 'lucide-react';
import { useNests } from '../hooks/useNests';
import type { AIAnalysisResult } from '../services/aiService';

interface AIPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    analysisData: AIAnalysisResult | null;
    url: string;
    suggestedNestId?: string | null;
    onSave: (editedData: {
        title: string;
        summary: string;
        tags: string[];
        nestId: string | null;
    }) => void;
    onRegenerate: () => void;
    isRegenerating?: boolean;
}

export default function AIPreviewModal({
    isOpen,
    onClose,
    analysisData,
    url,
    suggestedNestId,
    onSave,
    onRegenerate,
    isRegenerating = false
}: AIPreviewModalProps) {
    const { nests } = useNests();
    
    const [editedTitle, setEditedTitle] = useState(analysisData?.title || '');
    const [editedSummary, setEditedSummary] = useState(analysisData?.summary || '');
    const [editedTags, setEditedTags] = useState<string[]>(analysisData?.tags || []);
    const [selectedNestId, setSelectedNestId] = useState<string | null>(suggestedNestId || null);
    const [newTag, setNewTag] = useState('');

    // Update state when analysisData changes
    useState(() => {
        if (analysisData) {
            setEditedTitle(analysisData.title);
            setEditedSummary(analysisData.summary);
            setEditedTags(analysisData.tags);
        }
    });

    const handleAddTag = () => {
        if (newTag.trim() && editedTags.length < 5) {
            setEditedTags([...editedTags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (index: number) => {
        setEditedTags(editedTags.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave({
            title: editedTitle,
            summary: editedSummary,
            tags: editedTags,
            nestId: selectedNestId
        });
        onClose();
    };

    if (!analysisData) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl transition-all">
                                {/* Header */}
                                <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-5">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-5 h-5 text-indigo-600" />
                                            <Dialog.Title className="text-xl font-bold text-zinc-900 dark:text-white">
                                                AI Preview & Edit
                                            </Dialog.Title>
                                        </div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                                            {url}
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="ml-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={editedTitle}
                                            onChange={(e) => setEditedTitle(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="Enter title..."
                                        />
                                    </div>

                                    {/* Summary */}
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                            Summary
                                        </label>
                                        <textarea
                                            value={editedSummary}
                                            onChange={(e) => setEditedSummary(e.target.value)}
                                            rows={6}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                            placeholder="Enter summary..."
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                            Tags
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {editedTags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full"
                                                >
                                                    #{tag}
                                                    <button
                                                        onClick={() => handleRemoveTag(index)}
                                                        className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        {editedTags.length < 5 && (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:border-indigo-500"
                                                    placeholder="Add a tag..."
                                                    maxLength={20}
                                                />
                                                <button
                                                    onClick={handleAddTag}
                                                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Nest Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                            Save to Nest
                                            {suggestedNestId && (
                                                <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                                                    (AI Suggested)
                                                </span>
                                            )}
                                        </label>
                                        <select
                                            value={selectedNestId || ''}
                                            onChange={(e) => setSelectedNestId(e.target.value || null)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
                                        >
                                            <option value="">Uncategorized</option>
                                            {nests.map((nest) => (
                                                <option key={nest._id} value={nest._id}>
                                                    📁 {nest.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* AI Metadata */}
                                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                        <p className="text-xs text-zinc-400">
                                            Processed by {analysisData.aiMetadata.model} in{' '}
                                            {(analysisData.aiMetadata.processingTime / 1000).toFixed(2)}s
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                    <button
                                        onClick={onRegenerate}
                                        disabled={isRegenerating}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <RefreshCw size={16} className={isRegenerating ? 'animate-spin' : ''} />
                                        {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                                    </button>
                                    
                                    <div className="flex gap-3">
                                        <button
                                            onClick={onClose}
                                            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
                                        >
                                            <Save size={16} />
                                            Save to LinkNest
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
