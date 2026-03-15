import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { startInterview } from "../services/api"
import QuestionCard from "./QuestionCard"
import "../style/interview.css"

const Interview = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const role = location.state?.role

  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await startInterview(role)
        const questionArray = data.questions
          .split("\n")
          .filter(q => q.trim() !== "")
          .map(q => q.replace(/^Q\d+\.\s*/, ""))
        setQuestions(questionArray)
      } catch (error) {
        console.error(error)
      }
    }
    fetchQuestions()
  }, [role])

  const saveAnswer = (answer) => {
    const updated = [...answers]
    updated[currentQuestion] = {
      question: questions[currentQuestion],
      answer: answer
    }
    setAnswers(updated)
  }

  const nextQuestion = () => {
    setCurrentQuestion(currentQuestion + 1)
  }
  const prevQuestion = () => {
    setCurrentQuestion(currentQuestion - 1)
  }

  const submitInterview = async () => {
    const response = await fetch("http://127.0.0.1:8000/generate-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: role, interview_data: answers })
    })
    const data = await response.json()
    navigate("/feedback", { state: { feedback: data.feedback } })
  }

  if (questions.length === 0) {
    return (
      <div className="interview-loading">
        <h2>Generating Interview Questions</h2>
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    )
  }

  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100)
  const isLast = currentQuestion === questions.length - 1   // ← THIS WAS MISSING

  return (
    <div className="interview-page">

      {/* Header */}
      <div className="interview-header">
        <p className="interview-role-label">AI Mock Interview</p>
        <h1 className="interview-title">{role} Interview</h1>
      </div>

      {/* Progress */}
      <div className="interview-progress">
        <div className="progress-info">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="interview-card">
        <div className="question-badge">Question {currentQuestion + 1}</div>
        <QuestionCard
          key={currentQuestion}
          question={questions[currentQuestion]}
          index={currentQuestion}
          onAnswer={saveAnswer}
          setIsRecording={setIsRecording}
        />
      </div>

      {/* Navigation */}
      <div className="interview-nav">
        <span className="nav-hint">
          {isRecording ? "⏺ Stop recording before continuing" : isLast ? "Ready to submit?" : "Answer, then move on"}
        </span>

        <div className="nav-buttons">
          {currentQuestion > 0 && (
            <button className="btn-prev" onClick={prevQuestion} disabled={isRecording}>
              Prev
            </button>
          )}

          {!isLast ? (
            <button className="btn-next" onClick={nextQuestion} disabled={isRecording}>
              Next Question
            </button>
          ) : (
            <button className="btn-submit" onClick={submitInterview} disabled={isRecording}>
              Submit Interview
            </button>
          )}
        </div>
      </div>

    </div>
  )
}

export default Interview