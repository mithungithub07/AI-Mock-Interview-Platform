import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import QuestionCard from "./QuestionCard"
import "../style/interview.css"

const Interview = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const role = location.state?.role || sessionStorage.getItem("role")
  const level = location.state?.level || sessionStorage.getItem("level")

  const [currentQuestion, setCurrentQuestion] = useState(() => {
    return parseInt(sessionStorage.getItem("currentQuestion") || "0")
  })

  const [answers, setAnswers] = useState(() => {
    const saved = sessionStorage.getItem("answers")
    return saved ? JSON.parse(saved) : []
  })

  const [isRecording, setIsRecording] = useState(false)

  // ✅ NEW: Dynamic timer based on question type
  const [timeLeft, setTimeLeft] = useState(() => {
    return parseInt(sessionStorage.getItem("timeLeft") || "60")
  })

  const [questions, setQuestions] = useState(() => {
    const saved = sessionStorage.getItem("questions")
    if (saved) return JSON.parse(saved)
    return Array.isArray(location.state?.questions) ? location.state.questions : []
  })

  useEffect(() => {
    if (questions.length > 0) {
      sessionStorage.setItem("questions", JSON.stringify(questions))
      sessionStorage.setItem("role", role)
      sessionStorage.setItem("level", level)
    }
  }, [questions, role, level])

  useEffect(() => {
    sessionStorage.setItem("currentQuestion", currentQuestion)
  }, [currentQuestion])

  useEffect(() => {
    sessionStorage.setItem("answers", JSON.stringify(answers))
  }, [answers])

  useEffect(() => {
    sessionStorage.setItem("timeLeft", timeLeft)
  }, [timeLeft])

  // ✅ NEW: Check if current question is a coding question
  const isCodingQuestion = () => {
    if (!questions[currentQuestion]) return false

    const codingKeywords = [
      'write a program', 'write code', 'write a function', 'write a method',
      'create a function', 'create a method', 'create a program',
      'solve', 'algorithm to', 'code to', 'code for'
    ]

    const isJuniorOrSenior = level === 'junior' || level === 'senior'
    const questionLower = questions[currentQuestion].toLowerCase()

    return isJuniorOrSenior && codingKeywords.some(keyword =>
      questionLower.includes(keyword)
    )
  }

  // ✅ NEW: Set timer based on question type when question changes
  useEffect(() => {
    if (isCodingQuestion()) {
      setTimeLeft(1200) // 20 minutes for coding questions
    } else {
      setTimeLeft(60) // 60 seconds for theory questions
    }
  }, [currentQuestion])

  const saveAnswer = (answer) => {
    const updated = [...answers]
    updated[currentQuestion] = {
      question: questions[currentQuestion],
      answer: answer
    }
    setAnswers(updated)
  }

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        submitInterview()
      }
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, currentQuestion])

  const nextQuestion = () => {
    setCurrentQuestion(currentQuestion + 1)
  }

  const submitInterview = async () => {
    const finalAnswers = answers.filter(a => a && a.answer && a.answer.trim() !== '')

    if (finalAnswers.length === 0) {
      alert('Please answer at least one question before submitting')
      return
    }

    try {
      const response = await fetch("https://ai-mock-interview-platform-pryk.onrender.com/generate-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role,
          level: level,
          interview_data: finalAnswers
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate feedback')
      }

      const data = await response.json()
      sessionStorage.clear()
      navigate("/feedback", { state: { feedback: data.feedback } })
    } catch (error) {
      console.error('Submit interview error:', error)
      alert('Failed to submit interview. Please try again.')
    }
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
  const isLast = currentQuestion === questions.length - 1

  // ✅ NEW: Format time display (MM:SS for coding, SS for theory)
  const formatTime = (seconds) => {
    if (isCodingQuestion()) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${seconds}s`
  }

  return (
    <div className="interview-page">
      <div className="interview-header">
        <p className="interview-role-label">AI Mock Interview</p>
        <h1 className="interview-title">{role} Interview</h1>
        <p className="interview-level">{level}</p>
      </div>

      <div className="interview-progress">
        <div className="progress-info">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{progress}%</span>
          <span
            className={
              timeLeft <= 10 ? "timer-critical" :
                timeLeft <= 20 ? "timer-warning" : "timer-safe"
            }
          >
            ⏱ {formatTime(timeLeft)}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="interview-card">
        <div className="question-badge">Question {currentQuestion + 1}</div>
        <QuestionCard
          key={currentQuestion}
          question={questions[currentQuestion]}
          index={currentQuestion}
          onAnswer={saveAnswer}
          setIsRecording={setIsRecording}
          role={role}
          level={level}
        />
      </div>

      <div className="interview-nav">
        <span className="nav-hint">
          {isRecording ? "⏺ Stop recording before continuing" : isLast ? "Ready to submit?" : "Answer, then move on"}
        </span>

        <div className="nav-buttons">
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