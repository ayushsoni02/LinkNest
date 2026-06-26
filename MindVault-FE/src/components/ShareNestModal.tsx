import React, { useState } from 'react';
import { X, Copy, Check, Globe, Lock } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

interface ShareNestModalProps {
    isOpen: boolean;
    onClose: () => void;
    nestId: string;
    nestName: string;
    initialIsPublic: boolean;
    shareToken?: string;
    onUpdate: (isPublic: boolean, shareToken: string) => void;
}

export function ShareNestModal({ isOpen, onClose, nestId, nestName, initialIsPublic, shareToken, onUpdate }: ShareNestModalProps) {
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [isCopied, setIsCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const shareUrl = shareToken ? `${window.location.origin}/p/shared-nest/${shareToken}` : '';

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            const newIsPublic = !isPublic;
            const token = localStorage.getItem('token');
            const response = await axios.patch(`${BACKEND_URL}/api/v1/nests/${nestId}/toggle-public`, 
                { isPublic: newIsPublic },
                { headers: { Authorization: token } }
            );
            
            setIsPublic(newIsPublic);
            if (response.data.nest?.shareToken) {
                onUpdate(newIsPublic, response.data.nest.shareToken);
            } else {
                onUpdate(newIsPublic, shareToken || '');
            }
        } catch (error) {
            console.error('Failed to toggle public state:', error);
            alert('Failed to update nest sharing settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl shadow-indigo-500/10 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h2 className="text-xl font-semibold text-white">Share "{nestName}"</h2>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Toggle Section */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isPublic ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-400'}`}>
                                {isPublic ? <Globe size={20} /> : <Lock size={20} />}
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white">{isPublic ? 'Public Nest' : 'Private Nest'}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {isPublic ? 'Anyone with the link can view' : 'Only you can access this nest'}
                                </p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleToggle}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                                isPublic ? 'bg-indigo-500' : 'bg-slate-600'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span 
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    isPublic ? 'translate-x-6' : 'translate-x-1'
                                }`} 
                            />
                        </button>
                    </div>

                    {/* Link Copy Section */}
                    {isPublic && (
                        <div className="mt-4 pt-3 border-t border-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-xs font-medium text-slate-400 block mb-2">
                                Public Shareable Link
                            </label>
                            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg p-1.5 pl-3 focus-within:border-indigo-500/80 transition-colors">
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/p/shared-nest/${shareToken || nestId}`}
                                    className="bg-transparent text-sm text-slate-200 w-full outline-none select-all font-mono tracking-tight"
                                />
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/p/shared-nest/${shareToken || nestId}`;
                                        navigator.clipboard.writeText(url);
                                        setIsCopied(true);
                                        setTimeout(() => setIsCopied(false), 2000);
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-semibold text-white px-3.5 py-1.5 rounded-md transition-all whitespace-nowrap"
                                >
                                    {isCopied ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
