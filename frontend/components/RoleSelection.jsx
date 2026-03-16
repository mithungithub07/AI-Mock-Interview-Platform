import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { startInterview } from "../services/api"



const RoleSelection = ({ setQuestions, setRole, selectedRole }) => {


  const navigate = useNavigate()

  const roles = [
    "Java Developer",
    "Python Developer",
    "Full Stack Developer",
    "React Developer"

  ]


  const handleChange = (e) => {
    setRole(e.target.value)
  }

  const handleStart = async () => {
    if (!selectedRole) return
    try {
      const data = await startInterview(selectedRole)
      setQuestions(data.questions)
      navigate("/interview")
    } catch (err) {
      console.error("Error starting interview:", err)
    }


  }

  return (
    <div>

      <select value={selectedRole} onChange={handleChange}>
        <option value="">Select Role</option>
        {roles.map((r, index) => (
          <option key={index} value={r}>
            {r}
          </option>
        ))}
      </select>


    </div>
  )
}

export default RoleSelection