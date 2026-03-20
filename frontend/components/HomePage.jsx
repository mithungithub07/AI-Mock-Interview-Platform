import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import RoleSelection from "../components/RoleSelection"
import { startInterview } from "../services/api"
import heroImage from "../src/images/female.jpg"
import "../style/homepage.css"

const Home = () => {
    const navigate = useNavigate()
    const [selectedRole, setSelectedRole] = useState("")
    const [selectedLevel, setSelectedLevel] = useState("")

    useEffect(() => {
        sessionStorage.clear()
    }, [])


    const handleStart = async () => {
        if (!selectedRole || !selectedLevel) {
            alert("Please select both a role and level")
            return
        }
        try {
            const data = await startInterview(selectedRole, selectedLevel)

            if (!data.questions || data.questions.length === 0) {
                alert("No questions received from server")
                return
            }
            sessionStorage.clear()
            navigate("/interview", { state: { role: selectedRole, level: selectedLevel, questions: data.questions } })
        } catch (err) {
            console.error("Error starting interview:", err)
            alert("Failed to start interview. See console for details.")
        }
    }

    return (
        <div>
            <section className="hero-section">

                <div className="hero-content">
                    <p className="hero-brand">AI Mock Interview Platform</p>
                    <h1 className="hero-title">Prepare for Your Next Interview</h1>
                    <p className="hero-subtitle">
                        Practice with mock interviews and receive detailed feedback
                        to understand where you stand.
                    </p>


                    <div className="hero-actions">
                        <RoleSelection
                            selectedRoles={selectedRole}
                            setRole={setSelectedRole}
                        />

                        <select
                            className="level-select"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                        >
                            <option value="">Select Level</option>
                            <option value="fresher">🌱 Fresher (0–1 yrs)</option>
                            <option value="junior">💼 Junior (1–3 yrs)</option>
                            <option value="senior">⭐ Senior (3–8 yrs)</option>
                            <option value="architect">🏛 Architect (8+ yrs)</option>
                        </select>

                        <button className="btn-start" onClick={handleStart}>
                            Start Interview
                        </button>
                    </div>
                </div>


                <div className="hero-visual">
                    <img src={heroImage} alt="AI Interview" />
                </div>
            </section>
        </div>


    )
}

export default Home


