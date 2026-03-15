import { Routes, Route } from "react-router-dom"
import HomePage from "../components/HomePage"
import Interview from "../components/Interview"
import Feedback from "../components/Feedback"


function App() {

  return (
    <>
      <Routes>

        <Route path="/" element={<HomePage />} />

        <Route path="/interview" element={<Interview />} />

        <Route path="/feedback" element={<Feedback />} />

      </Routes>

    </>
  )
}

export default App