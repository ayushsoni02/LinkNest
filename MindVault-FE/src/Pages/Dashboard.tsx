import { useEffect, useState } from 'react'
import SmartLinkCard from '../components/SmartLinkCard'
import CreateContentModel from '../components/CreateContentModel'
import { Plusicon } from '../icons/PlusIcon'
import Sidebar from '../components/Sidebar'
import { useNavigate, useLocation } from 'react-router-dom'
import { useContent, Content } from '../hooks/UseContent'

function Dashboard() {
  const [modelOpen, setModelOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string | null }>({ 
    type: 'all', 
    value: null 
  });

  const { contents, refresh } = useContent();

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

  return (
    <div>
      <div className='min-h-screen bg-gray-50 dark:bg-zinc-950 text-black dark:text-white font-sans'>
        <Sidebar 
          className="hidden md:flex fixed h-full border-r border-zinc-200 dark:border-zinc-800" 
          onFilterChange={setActiveFilter} 
        />
        
        {/* Main Content - Offset by sidebar width (w-64 = 16rem) */}
        <div className='md:ml-64 p-8 transition-all duration-300' >
          <CreateContentModel open={modelOpen} onClose={() => setModelOpen(false)} />
          
          {/* Header Row: Search + Action Buttons */}
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12'>
            <div className="relative w-full max-w-2xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by title or tags..."
                  className="w-full pl-6 pr-4 py-3 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all text-lg placeholder:text-zinc-400"
                />
            </div>

            <div className='flex items-center gap-3'>
               <button
                  onClick={() => setModelOpen(true)}
                  className="px-6 py-3 bg-white dark:bg-white text-zinc-900 border border-zinc-200 dark:border-zinc-200 hover:bg-zinc-50 font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
               >
                  <Plusicon />
                  Add Content
               </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilter.type !== 'all' && (
            <div className="mb-6 flex items-center gap-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Active filter:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <span className="text-sm font-medium">
                  {activeFilter.type === 'content-type' && `Type: ${activeFilter.value}`}
                  {activeFilter.type === 'tag' && `Tag: ${activeFilter.value}`}
                  {activeFilter.type === 'nest' && `Nest`}
                  {activeFilter.type === 'uncategorized' && 'Uncategorized'}
                </span>
                <button
                  onClick={() => setActiveFilter({ type: 'all', value: null })}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {filteredLinks.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center pt-10 justify-center h-96 text-center gap-4 text-gray-500 dark:text-gray-300">
              <img
                src="/undraw_no-data_ig65.svg"
                alt="Empty"
                className="w-30 h-40 object-contain"
              />
              <h2 className="text-xl font-semibold">Looks like it's empty in here!</h2>
              <p className="max-w-md">
                {searchQuery || activeFilter.type !== 'all' 
                  ? "No links match your current filters. Try adjusting your search or filter."
                  : "You haven't added any content yet. Let's get started!"
                }
              </p>
              <button
                onClick={() => {
                  if (searchQuery || activeFilter.type !== 'all') {
                    setSearchQuery("");
                    setActiveFilter({ type: 'all', value: null });
                  } else {
                    setModelOpen(true);
                  }
                }}
                className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                {searchQuery || activeFilter.type !== 'all' ? 'Clear filters' : '+ Add your first link'}
              </button>
            </div>
          ) : (
            // Actual content
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-8">
              {filteredLinks.map((link) => {
                  return (
                    <SmartLinkCard
                      key={link._id}
                      id={link._id}
                      type={link.type}
                      url={link.link}
                      title={link.title}
                      tags={link.tags}
                      date={new Date(link.createdAt).toLocaleDateString()}
                      summary={`Content from ${link.nestId?.name || 'uncategorized'}`}
                      currentNestId={link.nestId?._id || null}
                      onDelete={handleDelete}
                    />
                  );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Dashboard;