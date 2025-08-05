import Dashboard from "./Pages/Dashboard"
import SignIn from "./Pages/Signin"
import Signup from "./Pages/Signup"
import { BrowserRouter,Route,Routes } from "react-router-dom"
import Index from "./Pages/Index"
import About from "./Pages/About"
import { useEffect } from "react";
import { BACKEND_URL } from "./Config"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
    </Routes>
  </BrowserRouter>
  
}

export default App

