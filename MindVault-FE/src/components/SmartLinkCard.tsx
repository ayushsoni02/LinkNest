import { useState, Fragment, useRef, useEffect } from 'react';
import { Dialog, Transition, Menu } from '@headlessui/react';
import { Share2, Trash2, ExternalLink, X, PlayCircle, MoreVertical, Check } from 'lucide-react';
import { useNests } from '../hooks/useNests';
import axios from 'axios';
import { BACKEND_URL } from '../Config';
import LivePreviewPortal from './LivePreviewPortal';

interface SmartLinkCardProps {
  id: string;
  title: string;
  url: string;
  type: string;
  tags?: string[];
  date?: string;
  summary?: string;     
  fullSummary?: string; 
  thumbnailUrl?: string;
  currentNestId?: string | null;
  onDelete?: (id: string) => void;
  onShare?: () => void;
}

export default function SmartLinkCard({
  id,
  title,
  url,
  type,
  tags = [],
  date = new Date().toLocaleDateString(),
  summary = "No summary available for this content.",
  fullSummary,
  thumbnailUrl,
  currentNestId,
  onDelete,
  onShare
}: SmartLinkCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { nests } = useNests();
  
  // Live Preview State
  const [showPreview, setShowPreview] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0, cardWidth: 0, cardHeight: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMoveToNest = async (nestId: string | null) => {
    try {
      await axios.put(`${BACKEND_URL}/api/v1/content/${id}`, 
        { nestId },
        { headers: { Authorization: localStorage.getItem('token') || '' } }
      );
      window.location.reload(); // Refresh to show changes
    } catch (error) {
      console.error('Error moving to nest:', error);
      alert('Failed to move content to nest');
    }
  };

  // Hover Logic with 500ms delay (reduced from 1s for better UX)
  const handleMouseEnter = () => {
    console.log('🎯 Mouse entered card');
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCardPosition({
        x: rect.left,
        y: rect.top,
        cardWidth: rect.width,
        cardHeight: rect.height
      });
      console.log('📍 Card position:', rect);
    }

    // Set timeout for 500ms (reduced for better UX)
    hoverTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Timeout reached - showing preview');
      setShowPreview(true);
    }, 1000); // Changed from 1000ms to 500ms
  };

  const handleMouseLeave = () => {
    console.log('👋 Pointer left card, showPreview:', showPreview);
    
    // Only clear timeout if preview hasn't appeared yet
    // Once preview is showing, only close via backdrop click or Escape
    if (hoverTimeoutRef.current && !showPreview) {
      console.log('🚫 Clearing timeout (preview not yet shown)');
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    } else if (showPreview) {
      console.log('✋ Preview is visible, ignoring pointer leave');
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Helper to extract YouTube Thumbnail if not provided
  const getThumbnail = () => {
    if (thumbnailUrl) return thumbnailUrl;
    if (type === 'youtube' && url) {
       const parts = url.split('v=');
       const videoId = parts.length > 1 ? parts[1].split('&')[0] : null;
       if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    return null;
  };

  const finalThumbnail = getThumbnail();
  const isMediaCard = (type === 'youtube' || type === 'twitter') && finalThumbnail;

  return (
    <>
      <div
        ref={cardRef}
        onClick={() => setIsOpen(true)}
        onPointerEnter={handleMouseEnter}
        onPointerLeave={handleMouseLeave}
        className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden"
      >
        <div className="flex gap-4 h-full">
            {/* Left: Thumbnail for Media Types */}
            {isMediaCard && (
                <div className="w-1/3 shrink-0 relative rounded-2xl overflow-hidden aspect-video bg-zinc-100">
                    <img src={finalThumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                    {type === 'youtube' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                             <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center pl-1 shadow-md">
                                <PlayCircle size={20} className="text-zinc-900" />
                             </div>
                        </div>
                    )}
                </div>
            )}

            {/* Right: Content */}
            <div className={`flex flex-col justify-between ${isMediaCard ? 'w-2/3' : 'w-full'}`}>
                <div>
                     {/* Header: Date & Title */}
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-2">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                {title}
                            </h3>
                             <p className="text-xs font-semibold text-zinc-400 mt-1 uppercase tracking-wider">{date}</p>
                        </div>
                        
                        {/* Hover Actions */}
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onShare?.(); }}
                                className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 rounded-full transition-colors"
                            >
                                <Share2 size={16} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
                                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-100 rounded-full transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Summary Lines */}
                    {!isMediaCard && summary && (
                         <div className="mb-4">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                                {summary}
                            </p>
                        </div>
                    )}

                </div>
                
                {/* Footer: Tags */}
                <div className="flex flex-wrap gap-2 mt-auto">
                    {tags && tags.length > 0 ? tags.map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-wide rounded-full">
                            #{tag}
                        </span>
                    )) : (
                       <>
                         <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-wide rounded-full">
                            #{type}
                        </span>
                       </>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Live Preview Portal */}
      <LivePreviewPortal
        isVisible={showPreview}
        url={url}
        type={type}
        position={cardPosition}
        onClose={() => setShowPreview(false)}
      />

       {/* --- Expanded Slide-over Panel (Keeping existing logic) --- */}
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
            <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm" />
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
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col bg-white dark:bg-zinc-900 shadow-2xl">
                      
                      {/* Panel Header */}
                      <div className="flex items-start justify-between px-6 py-6 border-b border-zinc-100 dark:border-zinc-800">
                         <div>
                            <Dialog.Title className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                              {title}
                            </Dialog.Title>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm mt-2 font-medium"
                            >
                              Visit Source <ExternalLink size={12} />
                            </a>
                         </div>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white dark:bg-zinc-900 text-zinc-400 hover:text-zinc-500 focus:outline-none"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <X size={24} />
                          </button>
                        </div>
                      </div>

                      {/* Panel Body */}
                      <div className="flex-1 overflow-y-auto px-6 py-6">
                         
                         {finalThumbnail && (
                             <div className="mb-6 rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
                                 <img src={finalThumbnail} alt="Thumbnail Preview" className="w-full object-cover" />
                             </div>
                         )}

                         <div className="space-y-8">
                             <section>
                                 <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
                                     <span className="p-1 bg-indigo-100 text-indigo-600 rounded">✨</span> 
                                     AI Summary
                                 </h4>
                                 <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm">
                                     {fullSummary || summary}
                                 </p>
                             </section>

                             <section>
                                 <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
                                     <span className="p-1 bg-emerald-100 text-emerald-600 rounded">🧠</span> 
                                     Key Takeaways
                                 </h4>
                                 <ul className="space-y-2">
                                     {['Core concept explained clearly', 'Practical examples provided', 'Good reference for future projects'].map((item, i) => (
                                         <li key={i} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                                             <span className="text-zinc-300">•</span> {item}
                                         </li>
                                     ))}
                                 </ul>
                             </section>

                             <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-100">
                                 {tags.map((tag, i) => (
                                     <span key={i} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 text-xs rounded-full">
                                         #{tag}
                                     </span>
                                 ))}
                             </div>
                         </div>
                      </div>

                      <div className="flex flex-shrink-0 justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <Menu as="div" className="relative inline-block text-left">
                          <Menu.Button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none">
                            Move to Nest
                            <MoreVertical size={14} className="text-zinc-400" />
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
                            <Menu.Items className="absolute bottom-full left-0 mb-2 w-56 origin-bottom-left rounded-md bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto">
                              <div className="py-1">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleMoveToNest(null)}
                                      className={`${
                                        active ? 'bg-zinc-100 dark:bg-zinc-700' : ''
                                      } group flex w-full items-center justify-between px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200`}
                                    >
                                      <span>Uncategorized</span>
                                      {currentNestId === null && <Check size={16} className="text-indigo-600" />}
                                    </button>
                                  )}
                                </Menu.Item>
                                
                                {nests.map((nest) => (
                                  <Menu.Item key={nest._id}>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleMoveToNest(nest._id)}
                                        className={`${
                                          active ? 'bg-zinc-100 dark:bg-zinc-700' : ''
                                        } group flex w-full items-center justify-between px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200`}
                                      >
                                        <span>📁 {nest.name}</span>
                                        {currentNestId === nest._id && <Check size={16} className="text-indigo-600" />}
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
                          className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none"
                        >
                          Read Full Article
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
