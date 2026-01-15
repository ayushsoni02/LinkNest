import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BentoCard, { BentoCardSkeleton } from '../components/BentoCard'
import EmptyNestState from '../components/EmptyNestState'
import CreateContentModel from '../components/CreateContentModel'
import { Plusicon } from '../icons/PlusIcon'
import Layout from '../components/Layout'
import { useNavigate, useLocation } from 'react-router-dom'
import { useContent, Content } from '../hooks/UseContent'
import AddLink from '../components/AddLink'
import { Search, X } from 'lucide-react'

function Dashboard() {
  const [modelOpen, setModelOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string | null }>({ 
    type: 'all', 
    value: null 
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { contents, refresh } = useContent();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Check for navigation state (filters passed from sidebar)
  useEffect(() => {
    if (location.state?.filterType) {
       setActiveFilter({ 
         type: location.state.filterType, 
         value: location.state.filterValue 
       });
    }
  }, [location.state]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
  }, [navigate]);

  // Set initial load to false after contents load
  useEffect(() => {
    if (contents.length > 0) {
      setIsInitialLoad(false);
    }
    // Also set to false after a timeout to handle empty states
    const timeout = setTimeout(() => setIsInitialLoad(false), 1000);
    return () => clearTimeout(timeout);
  }, [contents]);

  const handleDelete = async (id: string) => {
    console.log('Deleting link:', id);
    await refresh(); // Refresh after delete
  };

  // Enhanced filter logic working with API data
  const getFilteredLinks = (): Content[] => {
    let filtered = [...contents];

    // Apply filter based on type
    switch (activeFilter.type) {
      case 'content-type':
        filtered = filtered.filter(link => link.type === activeFilter.value);
        break;
      case 'tag':
        filtered = filtered.filter(link => link.tags.includes(activeFilter.value || ''));
        break;
      case 'nest':
        filtered = filtered.filter(link => link.nestId?._id === activeFilter.value);
        break;
      case 'uncategorized':
        filtered = filtered.filter(link => link.nestId === null);
        break;
      case 'all':
      default:
        // No filtering needed
        break;
    }

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(link => 
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredLinks = getFilteredLinks();

  // Determine if content is rich media for Bento layout
  const isRichMedia = (type: string) => {
    return ['youtube', 'instagram', 'twitter'].includes(type);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveFilter({ type: 'all', value: null });
  };

  return (
    <Layout onFilterChange={setActiveFilter}>
      <div className='min-h-screen bg-slate-950 text-slate-200'>
        <div className='p-6 md:p-8 max-w-[1800px] mx-auto'>
          <CreateContentModel open={modelOpen} onClose={() => setModelOpen(false)} />
          
          {/* Add Link - Simple URL input */}
          <AddLink onSuccess={refresh} />
          
          {/* Header Row: Search + Action Buttons */}
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
            {/* Search Bar */}
            <motion.div 
              className="relative w-full max-w-xl"
              animate={{ 
                scale: isSearchFocused ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <div className={`
                relative flex items-center
                rounded-2xl border transition-all duration-300
                ${isSearchFocused 
                  ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10 bg-slate-900/80' 
                  : 'border-slate-700/50 bg-slate-900/50'
                }
              `}>
                <Search 
                  size={20} 
                  className={`absolute left-4 transition-colors ${
                    isSearchFocused ? 'text-indigo-400' : 'text-slate-500'
                  }`} 
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search by title or tags..."
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent text-slate-100 focus:outline-none text-base placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 p-1 rounded-full hover:bg-slate-700/50 transition-colors"
                  >
                    <X size={16} className="text-slate-500" />
                  </button>
                )}
              </div>
            </motion.div>

            <div className='flex items-center gap-3'>
               <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModelOpen(true)}
                  className="px-5 py-3 bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2"
               >
                  <Plusicon />
                  Manual Add
               </motion.button>
            </div>
          </div>

          {/* Active Filter Chips */}
          <AnimatePresence>
            {activeFilter.type !== 'all' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 flex items-center gap-3"
              >
                <span className="text-sm text-slate-500">Active filter:</span>
                <motion.div 
                  layout
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-xl"
                >
                  <span className="text-sm font-medium">
                    {activeFilter.type === 'content-type' && `Type: ${activeFilter.value}`}
                    {activeFilter.type === 'tag' && `Tag: ${activeFilter.value}`}
                    {activeFilter.type === 'nest' && `Nest`}
                    {activeFilter.type === 'uncategorized' && 'Uncategorized'}
                  </span>
                  <button
                    onClick={() => setActiveFilter({ type: 'all', value: null })}
                    className="text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Grid */}
          {isInitialLoad ? (
            // Loading skeleton grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
              {[...Array(8)].map((_, i) => (
                <BentoCardSkeleton key={i} isLarge={i < 2} />
              ))}
            </div>
          ) : filteredLinks.length === 0 ? (
            // Beautiful empty state
            <EmptyNestState 
              hasFilters={searchQuery !== '' || activeFilter.type !== 'all'}
              onClearFilters={handleClearFilters}
              onAddContent={() => setModelOpen(true)}
            />
          ) : (
            // Bento Grid Layout
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-auto"
              layout
            >
              {filteredLinks.map((link, index) => {
                const richMedia = isRichMedia(link.type);
                
                return (
                  <BentoCard
                    key={link._id}
                    id={link._id}
                    url={link.link}
                    title={link.title}
                    description={link.summary}
                    image={link.image}
                    siteName={link.nestId?.name || undefined}
                    favicon={`https://www.google.com/s2/favicons?domain=${new URL(link.link).hostname}&sz=64`}
                    tags={link.tags}
                    contentType={link.type as any}
                    isRichMedia={richMedia}
                    date={new Date(link.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                    currentNestId={link.nestId?._id || null}
                    onDelete={handleDelete}
                    onRefresh={refresh}
                    index={index}
                  />
                );
              })}
            </motion.div>
          )}

        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;