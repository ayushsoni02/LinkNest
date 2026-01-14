import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../icons/Logo";
import SidebarItem from "./SidebarItem";
import { 
  LayoutGrid, 
  Newspaper, 
  Youtube, 
  Twitter,
  Plus,
  FolderOpen,
  Menu,
  X
} from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import CreateNestModal from "./CreateNestModal";
import { useNests } from "../hooks/useNests";
import { useContent } from "../hooks/UseContent";

type MobileNavProps = {
  isOpen: boolean;
  onToggle: () => void;
  onFilterChange?: (filter: { type: string; value: string | null }) => void;
};

export default function MobileNav({ isOpen, onToggle, onFilterChange }: MobileNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("All");
  const [createNestOpen, setCreateNestOpen] = useState(false);

  const { nests, createNest } = useNests();
  const { contents } = useContent();

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
    onToggle(); // Close menu after selection
    
    if (location.pathname !== "/Dashboard") {
      navigate("/Dashboard", { state: { filterType, filterValue, itemName } });
    } else {
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

  const allTags = [...new Set(contents.flatMap(c => c.tags))].sort();
  const uncategorizedCount = contents.filter(c => c.nestId === null).length;

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-3 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl text-slate-200 hover:text-indigo-400 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-screen w-80 bg-slate-900/95 backdrop-blur-md border-r border-slate-700 text-slate-200 z-50 flex flex-col overflow-hidden"
          >
            <CreateNestModal 
              open={createNestOpen} 
              onClose={() => setCreateNestOpen(false)}
              onCreate={handleCreateNest}
            />

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-20 px-4">
              
              {/* Header */}
              <div className="flex items-center gap-3 mb-10 px-2">
                <div className="text-indigo-400"><Logo /></div>
                <span className="text-2xl font-bold text-white tracking-tight">LinkNest</span>
              </div>

              {/* Discover Section */}
              <div className="mb-8">
                <h3 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Discover</h3>
                
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
                <h3 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tags</h3>
                
                <div className="flex flex-wrap gap-2 px-2">
                  {allTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleFilter("tag", tag, `#${tag}`)}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200
                        ${activeItem === `#${tag}`
                          ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" 
                          : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600"
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
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Nests</h3>
                  <button
                    onClick={() => setCreateNestOpen(true)}
                    className="p-1 hover:bg-slate-800 rounded-md transition-colors group"
                    title="Create new nest"
                  >
                    <Plus size={14} className="text-slate-400 group-hover:text-indigo-400" />
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
                      onToggle();
                      navigate(`/nest/${nest._id}`);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Footer / Profile */}
            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <ProfileDropdown username={user.username || "User"} onLogout={logout} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
