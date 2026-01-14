import { ReactElement } from "react";
import { motion } from "framer-motion";

export default function SidebarItem({text, icon, isActive, isCollapsed, onClick, badge}: {
    text: string;
    icon: ReactElement;
    isActive?: boolean;
    isCollapsed?: boolean;
    onClick?: () => void;
    badge?: string;
}) {
    return (
        <motion.div 
            whileHover={{ x: isCollapsed ? 0 : 4 }}
            onClick={onClick} 
            className={`
                flex items-center gap-3 py-3 px-3 mb-2 cursor-pointer transition-all duration-200 group rounded-xl relative
                ${isActive 
                    ? "bg-slate-800/50 text-indigo-400 border-l-2 border-indigo-500" 
                    : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-300"
                }
                ${isCollapsed ? "justify-center" : ""}
            `}
            title={isCollapsed ? text : ""}
        >
            <div className={`text-xl transition-colors ${isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-300"}`}>
                {icon}
            </div>
            
            {!isCollapsed && (
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 flex-1"
                >
                    <span className="text-sm font-medium whitespace-nowrap">
                        {text}
                    </span>
                    {badge && (
                        <span className="ml-auto px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full">
                            {badge}
                        </span>
                    )}
                </motion.div>
            )}
            
            {/* Badge indicator for collapsed state */}
            {isCollapsed && badge && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
            )}
        </motion.div>
  );
}