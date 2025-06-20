import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../icons/Logo";
import TwitterIcon from "../icons/TwitterIcon";
import { YouTubeIcon } from "../icons/Youtubeicon";
import DEVIcon from "../icons/DEVIcon";
import OtherIcon from "../icons/Other";
import { Button1 } from "./Button";
import SidebarItem from "./SidebarItem";
import { ChevronRight, ChevronLeft } from "lucide-react"; // optional icons
import LinkedinIcon from "../icons/LinkedinIcon";
import MediumIcon from "../icons/MediumIcon";


type SidebarProps = {
  className?: string;
  onFilterChange?: (tag: string | null) => void;  // 👈 allow null
};

export default function Sidebar({ className, onFilterChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    handleResize(); // initial call
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`${className} dark:bg-gray-900 text-black dark:text-white h-screen bg-white border-r fixed top-14 left-0 shadow-2xl transition-all duration-300 ease-in-out z-30
  ${isExpanded ? "w-64 pl-6" : "w-16 pl-2"}`}
    >
      <div className=" flex items-center justify-between py-6 pr-20">
        <div className=" flex items-center">
          <div className=" text-purple-600 pr-2">
            <Logo />
          </div>
          {isExpanded && (
            <span className=" text-2xl font-bold text-blue-700">LinkNest</span>
          )}
        </div>
        <button onClick={toggleSidebar} className="text-gray-600">
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="pt-8 ">
        <SidebarItem
          text="All"
          icon={<span className="text-lg font-bold ">🌐</span>}
          isExpanded={isExpanded}
          onClick={() => onFilterChange?.(null)}
        />
        <SidebarItem
          text="Twitter"
          icon={<TwitterIcon />}
          isExpanded={isExpanded}
          onClick={() => onFilterChange?.("twitter")}
        />
        <SidebarItem
          text="YouTube"
          icon={<YouTubeIcon />}
          isExpanded={isExpanded}
          onClick={() => onFilterChange?.("youtube")}
        />
        <SidebarItem
          text="DEV Community"
          icon={<DEVIcon />}
          isExpanded={isExpanded}
          onClick={() => onFilterChange?.("Dev.to")}
        />
        <SidebarItem
          text="Linkedin"
          icon={<LinkedinIcon />}
          isExpanded={isExpanded}
          onClick={() => onFilterChange?.("linkedin")}
        />
        <SidebarItem
          text="medium"
          icon={<MediumIcon />}
          isExpanded={isExpanded}
          onClick={() => onFilterChange?.("medium")}
        />
        <SidebarItem
          text="Other one"
          icon={<OtherIcon />}
          isExpanded={isExpanded}
          onClick={() => onFilterChange?.("other")}
        />
      </div>

      <div className="mt-auto px-4 pb-6">
        {isExpanded && (
          <Button1 fullWidth={true} variant="primary" text="Logout" onClick={logout} />
        )}
      </div>
    </div>
  );
}
