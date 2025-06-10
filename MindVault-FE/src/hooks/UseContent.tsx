import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../Config";

// Define Content type for type safety
export type Content = { _id: string; title: string; type: string; link: string };

export function useContent(){
   const [contents,setContents] = useState<Content[]>([]);
 
   function refresh() {
    axios.get(`${BACKEND_URL}/api/v1/content`, { 
        headers: {
            'Authorization': localStorage.getItem('token') || ''
        }
    })
        .then((response) => {
            setContents(response.data.content);
        })
        .catch((error) => {
            console.error("Error fetching content:", error);
        });
}


useEffect(() => {
    refresh(); 

    let interval = setInterval(() => {
        refresh();
    }, 10 * 1000); 

    return () => {
        clearInterval(interval); 
    };
}, []); 

return { contents, refresh };
}