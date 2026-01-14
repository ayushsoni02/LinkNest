import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Upload, CheckCircle, XCircle, Loader } from 'lucide-react';
import { saveContent, batchAnalyzeURLs } from '../services/aiService';
import { toast } from 'react-toastify';

interface BatchImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface BatchResult {
    url: string;
    title: string;
    summary: string;
    tags: string[];
    type: 'article' | 'youtube' | 'twitter' | 'github' | 'dev' | 'other';
    success: boolean;
}

export default function BatchImportModal({ isOpen, onClose, onSuccess }: BatchImportModalProps) {
    const [urlText, setUrlText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState<BatchResult[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleAnalyze = async () => {
        // Parse URLs from text (line-separated)
        const urls = urlText
            .split('\n')
            .map(url => url.trim())
            .filter(url => url.length > 0);

        if (urls.length === 0) {
            toast.error('Please enter at least one URL');
            return;
        }

        if (urls.length > 10) {
            toast.error('Maximum 10 URLs allowed per batch');
            return;
        }

        setIsProcessing(true);
        setResults([]);

        try {
            // Call REAL Gemini AI batch analysis
            console.log('🚀 Calling real Gemini AI batch analysis for', urls.length, 'URLs');
            const analysisResults = await batchAnalyzeURLs(urls);
            console.log('✅ Received batch analysis results:', analysisResults);
            
            const batchResults: BatchResult[] = analysisResults.map(result => ({
                url: result.url,
                title: result.title,
                summary: result.summary,
                tags: result.tags,
                type: result.type,
                success: result.success
            }));
            
            setResults(batchResults);
            
            const successCount = batchResults.filter(r => r.success).length;
            toast.success(`Analyzed ${successCount}/${urls.length} URLs successfully!`);
        } catch (error: any) {
            console.error('❌ Batch analysis error:', error);
            toast.error(error.message || 'Batch analysis failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveAll = async () => {
        const successfulResults = results.filter(r => r.success);
        
        if (successfulResults.length === 0) {
            toast.error('No successful analyses to save');
            return;
        }

        setIsSaving(true);

        try {
            // Save all successful results
            await Promise.all(
                successfulResults.map(result =>
                    saveContent({
                        link: result.url,
                        title: result.title,
                        type: result.type,
                        tags: result.tags,
                        summary: result.summary,
                        aiMetadata: {
                            model: 'gemini-1.5-flash',
                            processingTime: 0,
                            extractedContentLength: 0
                        },
                        nestId: null
                    })
                )
            );

            toast.success(`Saved ${successfulResults.length} links successfully! 🎉`);
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('❌ Save error:', error);
            toast.error('Failed to save some links. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setUrlText('');
        setResults([]);
        setIsProcessing(false);
        setIsSaving(false);
        onClose();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl transition-all">
                                {/* Header */}
                                <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Upload className="w-5 h-5 text-indigo-600" />
                                            <Dialog.Title className="text-xl font-bold text-zinc-900 dark:text-white">
                                                Batch Import URLs
                                            </Dialog.Title>
                                        </div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            Import up to 10 URLs at once. AI will analyze each one.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="ml-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="px-6 py-6 space-y-4">
                                    {/* URL Input */}
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                                            URLs (one per line)
                                        </label>
                                        <textarea
                                            value={urlText}
                                            onChange={(e) => setUrlText(e.target.value)}
                                            disabled={isProcessing || results.length > 0}
                                            rows={8}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none font-mono text-sm disabled:opacity-50"
                                            placeholder="https://youtube.com/watch?v=...&#10;https://example.com/article&#10;https://twitter.com/user/status/..."
                                        />
                                    </div>

                                    {/* Analyze Button */}
                                    {results.length === 0 && (
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={isProcessing || !urlText.trim()}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader className="w-5 h-5 animate-spin" />
                                                    Analyzing URLs...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={18} />
                                                    Analyze All URLs
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* Results */}
                                    {results.length > 0 && (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                                Results ({results.filter(r => r.success).length}/{results.length} successful)
                                            </h3>
                                            {results.map((result, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-4 rounded-xl border-2 ${
                                                        result.success
                                                            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                                                            : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {result.success ? (
                                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                                {result.success ? result.title : 'Analysis Failed'}
                                                            </p>
                                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">
                                                                {result.url}
                                                            </p>
                                                            {result.success && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {result.tags.map((tag, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold rounded-full"
                                                                        >
                                                                            #{tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {results.length > 0 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                        <button
                                            onClick={() => {
                                                setResults([]);
                                                setUrlText('');
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                        >
                                            Start Over
                                        </button>
                                        
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleClose}
                                                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveAll}
                                                disabled={isSaving || results.filter(r => r.success).length === 0}
                                                className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader className="w-4 h-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        Save All ({results.filter(r => r.success).length})
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
