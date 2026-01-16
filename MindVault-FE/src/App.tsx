import Dashboard from "./Pages/Dashboard"
import SignIn from "./Pages/Signin"
import Signup from "./Pages/Signup"
import { BrowserRouter,Route,Routes } from "react-router-dom"
import Index from "./Pages/Index"
import About from "./Pages/About"
import Features from "./Pages/Features"
import { useEffect, useState } from "react";
import { BACKEND_URL } from "./Config"
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OAuthCallback from "./Pages/OAuthCallback"
import NestWorkspace from "./Pages/NestWorkspace"
import ServerWakeup from "./components/ServerWakeup"
import { AnimatePresence } from "framer-motion"


function App() {
  const [isServerReady, setIsServerReady] = useState(false);

  useEffect(() => {
    // Ping the backend to wake it up
    fetch(`${BACKEND_URL}/health`)
      .then(() => {
        console.log("Backend is ready");
        setIsServerReady(true);
      })
      .catch(err => {
        console.error("Health check failed", err);
        // Allow app usage even if ping fails (backend might be down)
        setIsServerReady(true);
      });
  }, []);

  return (
    <>
      {/* Server wake-up overlay */}
      <AnimatePresence>
        {!isServerReady && <ServerWakeup isVisible={!isServerReady} />}
      </AnimatePresence>

      <BrowserRouter>
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
    </>
  );
}

export default App

