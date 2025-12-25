import { ReactElement } from "react";

export default function SidebarItem({text, icon, isExpanded, isActive, onClick}: {
    text: string;
    icon: ReactElement;
    isExpanded: boolean;
    isActive?: boolean;
    onClick?: () => void;
}) {
    return (
        <div 
            onClick={onClick} 
            className={`
                flex items-center gap-4 py-3 px-3 mb-2 cursor-pointer transition-all duration-200 group
                ${isActive 
                    ? "bg-zinc-100 border-l-4 border-indigo-600 text-indigo-700" 
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 border-l-4 border-transparent"
                }
            `}
        >
            <div className={`text-xl transition-colors ${isActive ? "text-indigo-600" : "text-zinc-500 group-hover:text-zinc-700"}`}>
                {icon}
            </div>
            
            {isExpanded && (
                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-opacity duration-200 ${isActive ? "font-semibold" : ""}`}>
                    {text}
                </span>
            )}
        </div>
  );
}