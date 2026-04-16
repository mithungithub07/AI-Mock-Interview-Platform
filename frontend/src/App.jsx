import { Routes, Route } from "react-router-dom"
import HomePage from "../components/HomePage"
import Interview from "../components/Interview"
import Feedback from "../components/Feedback"
import Login from "../components/Login"
import Register from "../components/Register"
import Admin from "../components/AdminDashboard"
import Navbar from "../components/NavBar"

function App() {

  return (
    <>
      <Navbar />
      <Routes>

        <Route path="/" element={<HomePage />} />

        <Route path="/interview" element={<Interview />} />

        <Route path="/feedback" element={<Feedback />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<Admin />} />

      </Routes>

    </>
  )
}

export default App