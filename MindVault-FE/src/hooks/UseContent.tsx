import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../Config";

// Updated Content type to match backend schema
export type Content = { 
    _id: string; 
    title: string; 
    type: string; 
    link: string;
    tags: string[];
    summary?: string;
    aiMetadata?: {
        model: string;
        tokensUsed?: number;
        processingTime: number;
        extractedContentLength: number;
    };
    extractedContent?: string;
    nestId: { _id: string; name: string; description?: string } | null;
    createdAt: string;
};


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