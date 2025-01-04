import Dashboard from "./Pages/Dashboard"
import Signin from "./Pages/Signin"
import Signup from "./Pages/Signup"
import { BrowserRouter,Route,Routes } from "react-router-dom"

function App() {

  return <BrowserRouter>
    <Routes>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/signin" element={<Signin/>}/>
      <Route path="/Dashboard" element={<Dashboard/>}/>
    </Routes>
  </BrowserRouter>
}

export default App

