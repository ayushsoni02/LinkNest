
import axios from "axios";
import { BACKEND_URL } from "../Config";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Button } from "../components/custom/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/custom/Card";
import { Input } from "../components/custom/Input";
import { Label } from "../components/custom/Label";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const SignIn = () => {
    const usernameRef = useRef<HTMLInputElement>();
    const passwordRef = useRef<HTMLInputElement>();
    const navigate = useNavigate();

     async function signin(){
         const username = usernameRef.current?.value;
         const password = passwordRef.current?.value;
         console.log("usernameRef:", usernameRef.current);
         console.log("passwordRef:", passwordRef.current);
         console.log("Username:", usernameRef.current?.value);
         console.log("Password:", passwordRef.current?.value);
       const response =  await axios.post(BACKEND_URL+"/api/v1/signin",{            
                 username,
                 password
          })
        
          // const jwt = response.data.token;
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", username ?? "");
          toast.success("login successful");
          navigate("/Dashboard")
     }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="text-black dark:text-white flex items-center justify-center px-4 py-12">
        <Card className=" w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to your LinkNest account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input reference={usernameRef}   placeholder="Enter your username" />
            </div>
            <div className="space-y-2">
              <Label  htmlFor="password">Password</Label>
              <Input reference={passwordRef} type="password" placeholder="Enter your password" />
            </div>
            <Button onClick={signin} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Sign In
            </Button>
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
