// import { useRef } from "react";
// import { Button } from "../components/Button";
// import { Input } from "../components/Input";
// import axios from "axios";
// import { BACKEND_URL } from "../Config";
// import { useNavigate } from "react-router-dom";



 
//  export default function Signup(){
//     const usernameRef = useRef<HTMLInputElement>();
//     const passwordRef = useRef<HTMLInputElement>();  
//     const navigate  = useNavigate();

//    async function signup(){
//          const username = usernameRef.current?.value;
//          const password = passwordRef.current?.value;
//      const response = await axios.post(BACKEND_URL+"/api/v1/signup",{            
//                 username,
//                 password
//          })
//           const jwt = response.data.token;
//           localStorage.setItem("token",jwt);
//           navigate("/Dashboard");
//          alert("You have signup !");
//     }
    


// return  <div className="h-screen w-screen bg-gray-300 flex justify-center items-center">
//         <div className="bg-white rounded-xl border=0  min-w-48 p-8">
//               <Input reference={usernameRef} placeholder="username"/>
//               <Input reference={passwordRef} placeholder="password"/>
//               <div className="flex justify-center pt-4">
//               <Button onClick={signup} loading={false} variant="primary" text="Signup" fullWidth={true}/>
//               </div>
//         </div>
//     </div>
// }


 // ------------                  lovable created signup page              ---------------------

// import Navigation from "../components/Navigation";
// import { Button } from "../components/custom/Button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/custom/Card";
// import { Input } from "../components/custom/Input";
// import { Label } from "../components/custom/Label";
// import { Link } from "react-router-dom";

// const SignUp = () => {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <Navigation />
//       <div className="flex items-center justify-center px-4 py-12">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center">
//             <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
//             <CardDescription>Start organizing your digital content today</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="name">Full Name</Label>
//               <Input  placeholder="Enter your full name" />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input placeholder="Enter your email" />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input  placeholder="Create a password" />
//             </div>
//             <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
//               Create Account
//             </Button>
//             <div className="text-center text-sm text-gray-600">
//               Already have an account?{" "}
//               <Link to="/signin" className="text-blue-600 hover:underline">
//                 Sign in
//               </Link>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default SignUp;



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
          navigate("/Dashboard");
         alert("You have signup !");
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <div className="flex items-center justify-center px-4 py-12">
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
              <Input reference={passwordRef} placeholder="Create a password" />
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
