import Dashboard from "./Pages/Dashboard"
import SignIn from "./Pages/Signin"
import Signup from "./Pages/Signup"
import { BrowserRouter,Route,Routes } from "react-router-dom"
import Index from "./Pages/Index"
import About from "./Pages/About"
import Features from "./Pages/Features"
import { useEffect } from "react";
import { BACKEND_URL } from "./Config"
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OAuthCallback from "./Pages/OAuthCallback"
import NestWorkspace from "./Pages/NestWorkspace"


function App() {

   useEffect(() => {
    fetch(`${BACKEND_URL}/ping`)
      .then(() => console.log("Backend pinged"))
      .catch(err => console.error("Ping failed", err));
  }, []);

  return <BrowserRouter>
    <ToastContainer position="top-right" autoClose={3000} />

    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/signin" element={<SignIn/>}/>
      <Route path="/Dashboard" element={<Dashboard/>}/>
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/nest/:id" element={<NestWorkspace />} />
      <Route path="oauth-callback" element={<OAuthCallback/>}/>
    </Routes>
  </BrowserRouter>
  
}

export default App

