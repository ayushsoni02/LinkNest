import { ReactElement } from "react";

export default function SidebarItem({text,icon}:{
    text:string;
    icon:ReactElement;
}){
    return <div className="flex text-gray-700 py-2 cursor-pointer hover:bg-gray-300  
    rounded-md max-w-48 pl-4 transition-all duration-350">
     <div className="pr-3" >
    {icon}
    </div>
    <div>
    {text}
    </div>
    </div>
}