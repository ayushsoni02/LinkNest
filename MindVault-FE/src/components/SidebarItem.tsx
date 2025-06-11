import { ReactElement } from "react";

export default function SidebarItem({text,icon,isExpanded,onClick}:{
    text:string;
    icon:ReactElement;
    isExpanded:boolean;
     onClick?: () => void;
}){
    return (
    <div  onClick={onClick} className="bg-white dark:bg-gray-900 dark:text-white flex items-center gap-4 text-gray-700 pr-5 hover:text-purple-600 hover:bg-slate-300 rounded-xl p-1 transition-all duration-200 mb-6 cursor-pointer">
      <div className=" text-xl">{icon}</div>
      {isExpanded && <span className="text-base">{text}</span>}
    </div>
  );
}