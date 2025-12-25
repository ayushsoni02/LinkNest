import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Share2, Trash2, ExternalLink, X, Calendar, Hash, MoreVertical, PlayCircle, FileText } from 'lucide-react';

interface SmartLinkCardProps {
  title: string;
  url: string;
  type: 'youtube' | 'twitter' | 'article';
  tags: string[];
  date: string;
  summary: string;     // Short summary for card
  fullSummary?: string; // Long summary for slide-over
  thumbnailUrl?: string; // For videos/media
  onDelete?: () => void;
  onShare?: () => void;
}

export default function SmartLinkCard({
  title,
  url,
  type,
  tags,
  date,
  summary,
  fullSummary,
  thumbnailUrl,
  onDelete,
  onShare
}: SmartLinkCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to determine icon based on type
  const getTypeIcon = () => {
    switch (type) {
      case 'youtube': return <PlayCircle size={16} className="text-red-500" />;
      case 'twitter': return <span className="text-blue-400 font-bold text-xs">𝕏</span>;
      default: return <FileText size={16} className="text-zinc-500" />;
    }
  };

  return (
    <>
      {/* --- Collapsed Card View --- */}
      <div 
        onClick={() => setIsOpen(true)}
        className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden"
      >
        {/* Header: Title, Date, Actions */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-3">
             <div className="flex items-center gap-2 mb-1">
                {getTypeIcon()}
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{date}</span>
             </div>
             <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
               {title}
             </h3>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={(e) => { e.stopPropagation(); onShare?.(); }}
                className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 rounded-md transition-colors"
            >
              <Share2 size={16} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-100 rounded-md transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex gap-4">
          {/* Media Split Layout for YouTube/Twitter */}
          {(type === 'youtube' || type === 'twitter') && thumbnailUrl ? (
             <>
               <div className="w-2/5 shrink-0 bg-zinc-100 rounded-lg overflow-hidden relative aspect-video self-start mt-1">
                  <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  {type === 'youtube' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center pl-0.5 shadow-sm">
                              <PlayCircle size={16} className="text-zinc-900" />
                          </div>
                      </div>
                  )}
               </div>
               <div className="w-3/5">
                 <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-4">
                   {summary}
                 </p>
               </div>
             </>
          ) : (
            /* Full Text Layout for Articles */
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-4">
               {summary}
            </p>
          )}
        </div>

        {/* Footer: Tags */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
           {tags.map((tag, i) => (
             <span key={i} className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-[10px] font-medium uppercase tracking-wide rounded-md whitespace-nowrap">
               #{tag}
             </span>
           ))}
        </div>
      </div>

      {/* --- Expanded Slide-over Panel --- */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
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
            <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          {/* Slide-over Panel */}
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
                         
                         {/* Thumbnail in expanded view if exists */}
                         {thumbnailUrl && (
                             <div className="mb-6 rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
                                 <img src={thumbnailUrl} alt="Thumbnail Preview" className="w-full object-cover" />
                             </div>
                         )}

                         <div className="space-y-8">
                             {/* AI Summary Section */}
                             <section>
                                 <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
                                     <span className="p-1 bg-indigo-100 text-indigo-600 rounded">✨</span> 
                                     AI Summary
                                 </h4>
                                 <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm">
                                     {fullSummary || summary}
                                 </p>
                             </section>

                             {/* Key Takeaways (Simulated for now) */}
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

                             {/* Metadata */}
                             <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-100">
                                 {tags.map((tag, i) => (
                                     <span key={i} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 text-xs rounded-full">
                                         #{tag}
                                     </span>
                                 ))}
                             </div>
                         </div>
                      </div>

                      {/* Panel Footer */}
                      <div className="flex flex-shrink-0 justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <button
                          type="button"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg shadow-sm hover:bg-zinc-50 focus:outline-none"
                        >
                           Move to Nest
                           <MoreVertical size={14} className="text-zinc-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)} // Close for now, maybe custom action later
                          className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none"
                        >
                          Read Full Article
                        </button>
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
