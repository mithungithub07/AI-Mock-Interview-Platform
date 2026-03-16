import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "../style/feedback.css"


const scoreColor = (score) => {
    if (score === 1) return "score-high"
    return "score-low"
}

const correctnessTag = (correctness) => {
    if (!correctness) return null
    const map = {
        "Correct": "tag-correct",
        "Incorrect": "tag-incorrect",
    }
    return map[correctness] || "tag-incorrect"
}

const Feedback = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const raw = location.state?.feedback

    const [expanded, setExpanded] = useState({})

    let data = null
    try {
        data = typeof raw === "string" ? JSON.parse(raw) : raw
        console.log("FEEDBACK DATA:", data)
    } catch {
        data = null
    }

    if (!data) {
        return (
            <div className="fb-error">
                <p>Could not load feedback. Please try again.</p>
                <button onClick={() => navigate("/")}>Back to Home</button>
            </div>
        )
    }

    const { overall_score, overall_summary, questions = [] } = data
    const totalQuestions = questions.length


    const scorePercent = Math.round((overall_score / totalQuestions) * 100)

    const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }))

    return (
        <div className="fb-page">


            <div className="fb-header">
                <p className="fb-label">AI Mock Interview</p>
                <h1 className="fb-title">Interview Complete 🎉</h1>
                <p className="fb-subtitle">Here's a detailed breakdown of your performance</p>
            </div>


            <div className="fb-scorecard">
                <div className="fb-score-ring">
                    <svg viewBox="0 0 120 120" className="fb-ring-svg">
                        <circle cx="60" cy="60" r="50" className="fb-ring-track" />
                        <circle
                            cx="60" cy="60" r="50"
                            className="fb-ring-fill"
                            strokeDasharray={`${scorePercent * 3.14} 314`}
                        />
                    </svg>
                    <div className="fb-score-inner">
                        <span className="fb-score-number">{overall_score}</span>

                        <span className="fb-score-denom">/{totalQuestions}</span>
                    </div>
                </div>

                <div className="fb-score-info">
                    <h2 className="fb-score-label">Overall Score</h2>
                    <p className="fb-score-summary">{overall_summary}</p>
                    <div className="fb-stats">
                        <div className="fb-stat">
                            <span className="fb-stat-num">{totalQuestions}</span>
                            <span className="fb-stat-label">Questions</span>
                        </div>
                        <div className="fb-stat">
                            <span className="fb-stat-num">
                                {questions.filter(q => q.correctness === "Correct").length}
                            </span>
                            <span className="fb-stat-label">Correct</span>
                        </div>
                        <div className="fb-stat">
                            <span className="fb-stat-num">
                                {questions.filter(q => q.correctness === "Incorrect").length}
                            </span>
                            <span className="fb-stat-label">Incorrect</span>
                        </div>
                    </div>
                </div>
            </div>


            <div className="fb-questions">
                <h2 className="fb-section-title">Question Breakdown</h2>

                {questions.map((q, i) => (
                    <div key={i} className={`fb-qcard ${expanded[i] ? "fb-qcard-open" : ""}`}>

                        <button className="fb-qcard-header" onClick={() => toggle(i)}>
                            <div className="fb-qcard-left">
                                <span className="fb-qnum">Q{i + 1}</span>
                                <span className="fb-qtext">{q.question}</span>
                            </div>
                            <div className="fb-qcard-right">

                                <span className={`fb-score-badge ${scoreColor(q.score)}`}>
                                    {q.score}/1
                                </span>
                                <span className={`fb-tag ${correctnessTag(q.correctness)}`}>
                                    {q.correctness}
                                </span>
                                <span className="fb-chevron">{expanded[i] ? "▲" : "▼"}</span>
                            </div>
                        </button>

                        {expanded[i] && (
                            <div className="fb-qcard-body">

                                <div className="fb-block fb-block-answer">
                                    <p className="fb-block-label">Your Answer</p>
                                    <p className="fb-block-text">
                                        {q.candidate_answer || <em>No answer provided</em>}
                                    </p>
                                </div>

                                <div className="fb-block fb-block-better">
                                    <p className="fb-block-label">Correct Answer</p>
                                    <p className="fb-block-text">{q.better_answer}</p>
                                </div>

                                <div className="fb-block fb-block-feedback">
                                    <p className="fb-block-label">Feedback</p>
                                    <p className="fb-block-text">{q.feedback}</p>
                                </div>

                            </div>
                        )}
                    </div>
                ))}
            </div>


            <button className="fb-btn-home" onClick={() => navigate("/")}>
                ← Back to Home
            </button>

        </div>
    )
}

export default Feedback