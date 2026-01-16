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
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import CreateNestModal from "./CreateNestModal";
import DeleteNestConfirmModal from "./DeleteNestConfirmModal";
import RenameNestModal from "./RenameNestModal";
import NestDropdownMenu from "./NestDropdownMenu";
import { useNests, Nest } from "../hooks/useNests";
import { useContent } from "../hooks/UseContent";

type SidebarProps = {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onFilterChange?: (filter: { type: string; value: string | null }) => void;
};

export default function Sidebar({ isCollapsed, onToggleCollapse, onFilterChange }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("All");
  const [createNestOpen, setCreateNestOpen] = useState(false);
  
  // Modal states for nest actions
  const [selectedNest, setSelectedNest] = useState<Nest | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { nests, createNest, deleteNest, renameNest } = useNests();
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
    
    if (location.pathname !== "/Dashboard") {
      navigate("/Dashboard", { state: { filterType, filterValue, itemName } });
    } else {
      if (onFilterChange) onFilterChange({ type: filterType, value: filterValue });
    }
  };

  const handleCreateNest = async (nestData: { name: string; color: string }) => {
    try {
      await createNest({ name: nestData.name });
    } catch (error) {
      alert("Failed to create nest");
    }
  };

  const handleRenameNest = async (newName: string) => {
    if (selectedNest) {
      try {
        await renameNest(selectedNest._id, newName);
      } catch (error) {
        alert("Failed to rename nest");
      }
    }
  };

  const handleDeleteNest = async () => {
    if (selectedNest) {
      try {
        await deleteNest(selectedNest._id);
        // Navigate to dashboard if currently viewing deleted nest
        if (location.pathname === `/nest/${selectedNest._id}`) {
          navigate("/Dashboard");
        }
      } catch (error) {
        alert("Failed to delete nest");
      }
    }
  };

  const openRenameModal = (nest: Nest) => {
    setSelectedNest(nest);
    setRenameModalOpen(true);
  };

  const openDeleteModal = (nest: Nest) => {
    setSelectedNest(nest);
    setDeleteModalOpen(true);
  };

  const allTags = [...new Set(contents.flatMap(c => c.tags))].sort();
  const uncategorizedCount = contents.filter(c => c.nestId === null).length;

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? "5rem" : "16rem" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-slate-950/80 backdrop-blur-md border-r border-slate-800 text-slate-200 flex flex-col justify-between fixed top-0 left-0 z-30"
    >
      {/* Modals */}
      <CreateNestModal 
        open={createNestOpen} 
        onClose={() => setCreateNestOpen(false)}
        onCreate={handleCreateNest}
      />
      <RenameNestModal
        open={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        onRename={handleRenameNest}
        currentName={selectedNest?.name || ""}
      />
      <DeleteNestConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteNest}
        nestName={selectedNest?.name || ""}
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6 px-3">
        
        {/* Header with Collapse Toggle */}
        <div className="mb-8">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between px-2 mb-4"
              >
                <div className="flex items-center gap-2">
                  <div className="text-indigo-400"><Logo /></div>
                  <span className="text-xl font-bold text-white tracking-tight">LinkNest</span>
                </div>
                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 hover:bg-slate-800/50 rounded-lg transition-colors"
                  title="Collapse sidebar"
                >
                  <ChevronLeft size={18} className="text-slate-400 hover:text-slate-200" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 mb-4"
              >
                <div className="text-indigo-400"><Logo /></div>
                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 hover:bg-slate-800/50 rounded-lg transition-colors"
                  title="Expand sidebar"
                >
                  <ChevronRight size={18} className="text-slate-400 hover:text-slate-200" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Discover Section */}
        <div className="mb-8">
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Discover
            </h3>
          )}
          
          <SidebarItem 
            text="All Content" 
            icon={<LayoutGrid size={20} />} 
            isActive={activeItem === "All"}
            isCollapsed={isCollapsed}
            onClick={() => handleFilter("all", null, "All")}
          />
          <SidebarItem 
            text="Blogs/Articles" 
            icon={<Newspaper size={20} />} 
            isActive={activeItem === "Blogs"}
            isCollapsed={isCollapsed}
            onClick={() => handleFilter("content-type", "article", "Blogs")}
          />
          <SidebarItem 
            text="Videos" 
            icon={<Youtube size={20} />} 
            isActive={activeItem === "Videos"}
            isCollapsed={isCollapsed}
            onClick={() => handleFilter("content-type", "youtube", "Videos")}
          />
          <SidebarItem 
            text="X/Twitter" 
            icon={<Twitter size={20} />} 
            isActive={activeItem === "Twitter"}
            isCollapsed={isCollapsed}
            onClick={() => handleFilter("content-type", "twitter", "Twitter")}
          />
          <SidebarItem 
            text="Uncategorized" 
            icon={<FolderOpen size={20} />} 
            isActive={activeItem === "Uncategorized"}
            isCollapsed={isCollapsed}
            onClick={() => handleFilter("uncategorized", null, "Uncategorized")}
            badge={uncategorizedCount > 0 ? uncategorizedCount.toString() : undefined}
          />
        </div>

        {/* Tags Section */}
        {!isCollapsed && (
          <div className="mb-8">
            <h3 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tags</h3>
            
            <div className="flex flex-wrap gap-2 px-2">
              {allTags.slice(0, 8).map((tag) => (
                <motion.button
                  key={tag}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFilter("tag", tag, `#${tag}`)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200
                    ${activeItem === `#${tag}`
                      ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" 
                      : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70"
                    }
                  `}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Your Nests Section */}
        <div className="mb-4">
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-3 mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Nests</h3>
              <button
                onClick={() => setCreateNestOpen(true)}
                className="p-1 hover:bg-slate-800/50 rounded-md transition-colors group"
                title="Create new nest"
              >
                <Plus size={14} className="text-slate-400 group-hover:text-indigo-400" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <button
                onClick={() => setCreateNestOpen(true)}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                title="Create new nest"
              >
                <Plus size={18} className="text-slate-400 hover:text-indigo-400" />
              </button>
            </div>
          )}
          
          {nests.map((nest) => (
            <div
              key={nest._id}
              className="group relative"
            >
              <motion.div 
                whileHover={{ x: isCollapsed ? 0 : 4 }}
                onClick={() => {
                  setActiveItem(nest.name);
                  navigate(`/nest/${nest._id}`);
                }}
                className={`
                  flex items-center gap-3 py-3 px-3 mb-2 cursor-pointer transition-all duration-200 rounded-xl relative
                  ${activeItem === nest.name 
                    ? "bg-slate-800/50 text-indigo-400 border-l-2 border-indigo-500" 
                    : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-300"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                title={isCollapsed ? nest.name : ""}
              >
                <div 
                  className="w-5 h-5 rounded flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: '#6366f1' + '30' }}
                >
                  📁
                </div>
                
                {!isCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 flex-1 min-w-0"
                  >
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {nest.name}
                    </span>
                  </motion.div>
                )}

                {/* Three-dot menu - only visible on hover when not collapsed */}
                {!isCollapsed && (
                  <NestDropdownMenu
                    onRename={() => openRenameModal(nest)}
                    onDelete={() => openDeleteModal(nest)}
                  />
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Profile */}
      <div className="p-3 border-t border-slate-800">
        <ProfileDropdown 
          username={user.username || "User"} 
          onLogout={logout}
          isCollapsed={isCollapsed}
        />
      </div>
    </motion.div>
  );
}

