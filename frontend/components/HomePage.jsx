import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import RoleSelection from "../components/RoleSelection"
import { startInterview } from "../services/api"
import heroImage from "../src/images/female.jpg"
import "../style/homepage.css"

const HomePage = () => {
    const navigate = useNavigate()
    const [selectedRole, setSelectedRole] = useState("")
    const [selectedLevel, setSelectedLevel] = useState("")
    const [showAdminModal, setShowAdminModal] = useState(false)
    const [adminPassword, setAdminPassword] = useState("")
    const [error, setError] = useState("")

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

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

    const handleAdminAccess = async () => {
        setError("")
        const ADMIN_PASSWORD = "your_secure_password_here"

        if (adminPassword === ADMIN_PASSWORD) {
            localStorage.setItem('isAdmin', 'true')
            localStorage.setItem('adminToken', Date.now().toString())
            navigate('/admin')
            setShowAdminModal(false)
            setAdminPassword("")
        } else {
            setError("Incorrect password")
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAdminAccess()
        }
    }

    return (
        <div className="homepage">
            {/* Auth Header */}
            <div className="auth-header">
                {user ? (
                    <div className="user-info">
                        <span className="welcome-text">Welcome, {user.name}</span>
                        <button className="btn-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <button className="btn-login" onClick={() => navigate('/login')}>
                            Login
                        </button>
                        <button className="btn-register" onClick={() => navigate('/register')}>
                            Register
                        </button>
                    </div>
                )}
            </div>

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

            {/* Admin Access Button */}
            <div className="admin-access-floating">
                <button
                    className="admin-access-btn"
                    onClick={() => setShowAdminModal(true)}
                    title="Admin dashboard access"
                >
                    ⚙️
                </button>
            </div>

            {/* Admin Modal */}
            {showAdminModal && (
                <div className="modal-overlay" onClick={() => setShowAdminModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Admin Access</h2>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowAdminModal(false)
                                    setAdminPassword("")
                                    setError("")
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <p>Enter admin password to access the dashboard:</p>
                            <input
                                type="password"
                                placeholder="Enter admin password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="modal-input"
                                autoFocus
                            />
                            {error && <div className="error-message">{error}</div>}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowAdminModal(false)
                                    setAdminPassword("")
                                    setError("")
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleAdminAccess}
                            >
                                Access Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>


    )
}

export default HomePage