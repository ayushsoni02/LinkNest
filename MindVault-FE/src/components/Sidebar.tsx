import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../icons/Logo";
import SidebarItem from "./SidebarItem";
import { 
  LayoutGrid, 
  Newspaper, 
  Youtube, 
  Twitter,
  Plus,
  FolderOpen
} from "lucide-react";
import 'react-toastify/dist/ReactToastify.css';
import ProfileDropdown from "./ProfileDropdown";
import CreateNestModal from "./CreateNestModal";
import { useNests } from "../hooks/useNests";
import { useContent } from "../hooks/UseContent";

type SidebarProps = {
  className?: string;
  onFilterChange?: (filter: { type: string; value: string | null }) => void;
};

export default function Sidebar({ className, onFilterChange }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("All");
  const [createNestOpen, setCreateNestOpen] = useState(false);

  // Fetch nests and content from API
  const { nests, createNest } = useNests();
  const { contents } = useContent();

  // Getting user from localStorage if available
  const userString = localStorage.getItem("user");
  let user = { username: "User" };
  try {
    if (userString) {
      user = JSON.parse(userString);
    }
  } catch (e) {
    console.error("Failed to parse user data", e);
    localStorage.removeItem("user");
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  }

  const handleFilter = (filterType: string, filterValue: string | null, itemName: string) => {
    setActiveItem(itemName);
    
    // If not on dashboard, navigate to dashboard with filter preference
    if (location.pathname !== "/Dashboard") {
      navigate("/Dashboard", { state: { filterType, filterValue, itemName } });
    } else {
      // If already on dashboard, just filter
      if (onFilterChange) onFilterChange({ type: filterType, value: filterValue });
    }
  };

  const handleCreateNest = async (nestData: { name: string; icon: string; color: string; description: string }) => {
    try {
      await createNest({ name: nestData.name, description: nestData.description });
    } catch (error) {
      alert("Failed to create nest");
    }
  };

  // Get dynamic tags and uncategorized count from API data
  const allTags = [...new Set(contents.flatMap(c => c.tags))].sort();
  const uncategorizedCount = contents.filter(c => c.nestId === null).length;

  return (
    <div
      className={`${className} h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 w-64 flex flex-col justify-between fixed top-0 left-0 z-30 transition-all duration-300`}
    >
      <CreateNestModal 
        open={createNestOpen} 
        onClose={() => setCreateNestOpen(false)}
        onCreate={handleCreateNest}
      />
        
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-8 px-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-10 px-2">
            <div className="text-indigo-600"><Logo /></div>
            <span className="text-2xl font-bold font-serif text-zinc-900 dark:text-white tracking-tight">LinkNest</span>
        </div>

        {/* Discover Section */}
        <div className="mb-8">
          <h3 className="px-3 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Discover</h3>
          
          <SidebarItem 
            text="All Content" 
            icon={<LayoutGrid size={20} />} 
            isActive={activeItem === "All"}
            onClick={() => handleFilter("all", null, "All")}
          />
          <SidebarItem 
            text="Blogs/Articles" 
            icon={<Newspaper size={20} />} 
            isActive={activeItem === "Blogs"}
            onClick={() => handleFilter("content-type", "article", "Blogs")}
          />
          <SidebarItem 
            text="Videos" 
            icon={<Youtube size={20} />} 
            isActive={activeItem === "Videos"}
            onClick={() => handleFilter("content-type", "youtube", "Videos")}
          />
          <SidebarItem 
            text="X/Twitter" 
            icon={<Twitter size={20} />} 
            isActive={activeItem === "Twitter"}
            onClick={() => handleFilter("content-type", "twitter", "Twitter")}
          />
          <SidebarItem 
            text="Uncategorized" 
            icon={<FolderOpen size={20} />} 
            isActive={activeItem === "Uncategorized"}
            onClick={() => handleFilter("uncategorized", null, "Uncategorized")}
            badge={uncategorizedCount > 0 ? uncategorizedCount.toString() : undefined}
          />
        </div>

        {/* Tags Section */}
        <div className="mb-8">
           <h3 className="px-3 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Tags</h3>
           
           <div className="flex flex-wrap gap-2 px-2">
             {allTags.slice(0, 8).map((tag) => (
                <button
                    key={tag}
                    onClick={() => handleFilter("tag", tag, `#${tag}`)}
                    className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200
                        ${activeItem === `#${tag}`
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-500/30 dark:text-indigo-400" 
                            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600"
                        }
                    `}
                >
                    {tag}
                </button>
             ))}
           </div>
        </div>

        {/* Your Nests Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-3 mb-3">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Your Nests</h3>
            <button
              onClick={() => setCreateNestOpen(true)}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors group"
              title="Create new nest"
            >
              <Plus size={14} className="text-zinc-400 group-hover:text-indigo-600" />
            </button>
          </div>
          
          {nests.map((nest) => (
            <SidebarItem 
              key={nest._id}
              text={nest.name} 
              icon={
                <div 
                  className="w-5 h-5 rounded flex items-center justify-center text-sm"
                  style={{ backgroundColor: '#6366f1' + '30' }}
                >
                  📁
                </div>
              } 
              isActive={activeItem === nest.name}
              onClick={() => {
                setActiveItem(nest.name);
                navigate(`/nest/${nest._id}`);
              }}
            />
          ))}
        </div>
      </div>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
             <ProfileDropdown username={user.username || "User"} onLogout={logout} />
          </div>
      </div>
    </div>
  );
}
