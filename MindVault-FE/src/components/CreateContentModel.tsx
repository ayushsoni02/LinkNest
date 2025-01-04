import { useRef, useState } from "react"
import CrossIcon from "../icons/CrossIcon"
import { Button } from "./Button"
import { Input } from "./Input"
import axios from "axios";
import { BACKEND_URL } from "../Config";


enum ContentType {
    Youtube = "youtube",
    Twitter = "twitter"
 }

 interface CreateContentModalProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateContentModel({ open, onClose }: CreateContentModalProps) {
     const titleRef = useRef<HTMLInputElement>();
     const linkRef = useRef<HTMLInputElement>(); 
     const [type, setType] = useState(ContentType.Youtube);

    async function addContent(){
           const title = titleRef.current?.value;
           const link = linkRef.current?.value;

           await axios.post(`${BACKEND_URL}/api/v1/content`,{
            link,
            title,
            type
           },{
              headers:{
                  "Authorization":localStorage.getItem("token")
              }
           })
           onClose();
    }
    
    return <div>
        {open &&    <div> 
            <div className="fixed top-0 left-0 w-screen h-screen bg-slate-600  opacity-60 flex justify-center">
              </div>
              <div className="fixed  left-0 w-screen h-screen top-0 flex justify-center">
             
              <div className="flex flex-col justify-center ">
                <span className="bg-white opacity-100 p-4 rounded fixed">
                    <div className="flex justify-end">
                        <div onClick={onClose} className="cursor-pointer">
                        <CrossIcon />
                        </div>
                    </div>
                    <div>
                        <Input reference={titleRef} placeholder={"Title"} />
                        <Input reference={linkRef} placeholder={"Link"} />
                    </div>
                    <div>
                        <h1 className="font-semibold">Type : </h1>
                        <div className="flex justify-center gap-2 pb-5 pt-2">
                        <Button text="Youtube" variant={type===ContentType.Youtube ? "primary" : "secondary"} onClick={()=>{
                            setType(ContentType.Youtube)
                        }}></Button>
                        <Button text="Twitter" variant={type===ContentType.Youtube ? "secondary" : "primary"} onClick={()=>{
                            setType(ContentType.Twitter)
                        }}></Button>
                        </div>
                    </div>
                    <div className="flex justify-center ">
                    <Button  onClick={addContent} variant="primary" text="Submit"/>
                    </div>
                </span>
            </div>
            </div>
        </div>}
    </div>
}



