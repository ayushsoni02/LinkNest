import { useRef } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import axios from "axios";
import { BACKEND_URL } from "../Config";
import { useNavigate } from "react-router-dom";



 
 export default function Signup(){
    const usernameRef = useRef<HTMLInputElement>();
    const passwordRef = useRef<HTMLInputElement>();  
    const navigate  = useNavigate();

   async function signup(){
         const username = usernameRef.current?.value;
         const password = passwordRef.current?.value;
       await axios.post(BACKEND_URL+"/api/v1/signup",{            
                username,
                password
         })
         navigate("/signin")    
         alert("You have signup !");
    }
    


return  <div className="h-screen w-screen bg-gray-300 flex justify-center items-center">
        <div className="bg-white rounded-xl border=0  min-w-48 p-8">
              <Input reference={usernameRef} placeholder="username"/>
              <Input reference={passwordRef} placeholder="password"/>
              <div className="flex justify-center pt-4">
              <Button onClick={signup} loading={false} variant="primary" text="Signup" fullWidth={true}/>
              </div>
        </div>
    </div>
}