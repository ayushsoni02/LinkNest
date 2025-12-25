import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../icons/Logo";
import SidebarItem from "./SidebarItem";
import { 
  ChevronRight, 
  ChevronLeft, 
  LayoutGrid, 
  Newspaper, 
  Youtube, 
  Hash, 
  Folder, 
  Plus, 
  LogOut 
} from "lucide-react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type SidebarProps = {
  className?: string;
  onFilterChange?: (tag: string | null) => void;
};

export default function Sidebar({ className, onFilterChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeItem, setActiveItem] = useState("All");
  const navigate = useNavigate();

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
    navigate("/signin");
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // Changed to 1024px for tablet handling
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFilter = (tag: string | null, itemName: string) => {
    setActiveItem(itemName);
    if (onFilterChange) onFilterChange(tag);
  };

  return (
    <div
      className={`${className} h-screen bg-zinc-50 border-r border-zinc-200 text-zinc-800 fixed top-14 left-0 transition-all duration-300 ease-in-out z-30 flex flex-col justify-between
      ${isExpanded ? "w-64" : "w-20"}`}
    >
        
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6">
        
        {/* Header / Toggle */}
        <div className={`flex items-center justify-between mb-8 px-4 ${!isExpanded && "justify-center"}`}>
           {isExpanded ? (
               <div className="flex items-center gap-2">
                 <div className="text-indigo-600"><Logo /></div>
                 <span className="text-xl font-bold text-zinc-800 tracking-tight">LinkNest</span>
               </div>
           ) : (
             <div className="text-indigo-600"><Logo /></div>
           )}
           
           {isExpanded && (
            <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-500 transition-colors">
              <ChevronLeft size={20} />
            </button>
           )}
        </div>

        {/* Primary Sections */}
        <div className="px-3 mb-6">
          {isExpanded && <h3 className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Discover</h3>}
          
          <SidebarItem 
            text="All Content" 
            icon={<LayoutGrid size={20} />} 
            isExpanded={isExpanded} 
            isActive={activeItem === "All"}
            onClick={() => handleFilter(null, "All")}
          />
          <SidebarItem 
            text="Blogs/Articles" 
            icon={<Newspaper size={20} />} 
            isExpanded={isExpanded} 
            isActive={activeItem === "Blogs"}
            onClick={() => handleFilter("Blogs", "Blogs")}
          />
          <SidebarItem 
            text="Videos/Tutorials" 
            icon={<Youtube size={20} />} 
            isExpanded={isExpanded} 
            isActive={activeItem === "Videos"}
            onClick={() => handleFilter("Videos", "Videos")}
          />
        </div>

        {/* Tags Section */}
        <div className="px-3 mb-6">
           {isExpanded && <h3 className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Trending Tags</h3>}
           
           <div className="space-y-1">
             <SidebarItem 
                text="#React" 
                icon={<Hash size={18} />} 
                isExpanded={isExpanded} 
                isActive={activeItem === "#React"}
                onClick={() => handleFilter("#React", "#React")}
             />
             <SidebarItem 
                text="#Startup" 
                icon={<Hash size={18} />} 
                isExpanded={isExpanded} 
                isActive={activeItem === "#Startup"}
                onClick={() => handleFilter("#Startup", "#Startup")}
             />
             <SidebarItem 
                text="#Design" 
                icon={<Hash size={18} />} 
                isExpanded={isExpanded} 
                isActive={activeItem === "#Design"}
                onClick={() => handleFilter("#Design", "#Design")}
             />
              <SidebarItem 
                text="#Javascript" 
                icon={<Hash size={18} />} 
                isExpanded={isExpanded} 
                isActive={activeItem === "#Javascript"}
                onClick={() => handleFilter("#Javascript", "#Javascript")}
             />
           </div>
        </div>

        {/* Your Nests Section */}
        <div className="px-3 mb-6">
          {isExpanded && (
             <div className="flex items-center justify-between px-3 mb-2">
                 <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Your Nests</h3>
                 <button className="text-zinc-400 hover:text-indigo-600 transition-colors">
                     <Plus size={16} />
                 </button>
             </div>
          )}
          
          <SidebarItem 
            text="Project Resources" 
            icon={<Folder size={18} />} 
            isExpanded={isExpanded} 
            isActive={activeItem === "Project Resources"}
            onClick={() => {
                setActiveItem("Project Resources");
                navigate("/nest/project-resources");
            }}
          />
           <SidebarItem 
            text="Read Later" 
            icon={<Folder size={18} />} 
            isExpanded={isExpanded} 
            isActive={activeItem === "Read Later"}
            onClick={() => {
                setActiveItem("Read Later");
                navigate("/nest/read-later");
            }}
          />
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-zinc-200 bg-zinc-50">
          <button 
             onClick={logout}
             className={`flex items-center gap-3 w-full p-2 rounded-lg text-zinc-600 hover:bg-zinc-200 hover:text-red-600 transition-all group ${!isExpanded && "justify-center"}`}
          >
              <LogOut size={20} className="group-hover:text-red-600" />
              {isExpanded && <span className="font-medium text-sm">Logout</span>}
          </button>
           {!isExpanded && (
            <button onClick={toggleSidebar} className="mt-4 w-full flex justify-center text-zinc-400 hover:text-zinc-600">
              <ChevronRight size={20} />
            </button>
           )}
      </div>
    </div>
  );
}
