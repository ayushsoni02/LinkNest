import Dashboard from "./Pages/Dashboard"
import SignIn from "./Pages/Signin"
import Signup from "./Pages/Signup"
import { BrowserRouter,Route,Routes } from "react-router-dom"
import Index from "./Pages/Index"
import About from "./Pages/About"


function App() {

  return <BrowserRouter>
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

