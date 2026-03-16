import { useState } from "react"
import { useNavigate } from "react-router-dom"
import RoleSelection from "../components/RoleSelection"
import { startInterview } from "../services/api"
import "../style/homepage.css"
import heroImage from "../src/images/female.jpg"

const Home = () => {
    const navigate = useNavigate()
    const [selectedRole, setSelectedRole] = useState("")
    console.log("selectedRole")

    const handleStart = async () => {
        if (!selectedRole) {
            alert("Please select a role")
            return
        }
        try {
            const data = await startInterview(selectedRole)

            if (!data.questions || data.questions.length === 0) {
                alert("No questions received from server")
                return
            }

            navigate("/interview", { state: { role: selectedRole, questions: data.questions } })
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


