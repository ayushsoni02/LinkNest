import axios from "axios";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { BACKEND_URL } from "../Config";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Signin(){
    const usernameRef = useRef<HTMLInputElement>();
    const passwordRef = useRef<HTMLInputElement>();  
    const navigate = useNavigate();
   async function signin(){
         const username = usernameRef.current?.value;
         const password = passwordRef.current?.value;
      const response =  await axios.post(BACKEND_URL+"/api/v1/signin",{            
                username,
                password
         })
         const jwt = response.data.token;
         localStorage.setItem("token",jwt);
         navigate("/Dashboard")
    }
   
   return  <div className="h-screen w-screen bg-gray-300 flex justify-center items-center">
        <div className="bg-white rounded-xl border=0  min-w-48 p-8">
              <Input reference={usernameRef} placeholder="username"/>
              <Input reference={passwordRef} placeholder="password"/>
              <div className="flex justify-center pt-4">
              <Button onClick={signin} loading={false} variant="primary" text="Signin" fullWidth={true}/>
              </div>
        </div>
    </div>
}