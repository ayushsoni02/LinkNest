
import Navigation from "../components/Navigation";
import { Button } from "../components/custom/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/custom/Card";
import { Input } from "../components/custom/Input";
import { Label } from "../components/custom/Label";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../Config";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const SignUp = () => {

   const usernameRef = useRef<HTMLInputElement>();
    const passwordRef = useRef<HTMLInputElement>();
    const emailRef = useRef<HTMLInputElement>();  
    const navigate  = useNavigate();

   async function signup(){
         const username = usernameRef.current?.value;
         const password = passwordRef.current?.value;
         const email = emailRef.current?.value;
     const response = await axios.post(BACKEND_URL+"/api/v1/signup",{            
                username,
                password,
                email
         })
          const jwt = response.data.token;
          localStorage.setItem("token",jwt);
          localStorage.setItem("user", username ?? "");
          toast.success("signUp successful");
          navigate("/Dashboard");
         //alert("You have signup !");
    }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <div className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Start organizing your digital content today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">userName</Label>
              <Input  reference={usernameRef} placeholder="Enter your username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input reference={emailRef} placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input reference={passwordRef} type="password" placeholder="Create a password" />
            </div>
            <Button onClick={signup} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Create Account
            </Button>
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/signin" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
