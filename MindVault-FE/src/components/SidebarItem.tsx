import { ReactElement } from "react";

export default function SidebarItem({text, icon, isActive, onClick, badge}: {
    text: string;
    icon: ReactElement;
    isActive?: boolean;
    onClick?: () => void;
    badge?: string;
}) {
    return (
        <div 
            onClick={onClick} 
            className={`
                flex items-center gap-4 py-3 px-3 mb-2 cursor-pointer transition-all duration-200 group rounded-xl
                ${isActive 
                    ? "bg-zinc-100 dark:bg-zinc-800 text-indigo-600 font-semibold" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200"
                }
            `}
        >
            <div className={`text-xl transition-colors ${isActive ? "text-indigo-600" : "text-zinc-400 group-hover:text-zinc-600"}`}>
                {icon}
            </div>
            
            <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium whitespace-nowrap">
                    {text}
                </span>
                {badge && (
                    <span className="ml-auto px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
                        {badge}
                    </span>
                )}
            </div>
        </div>
  );
}