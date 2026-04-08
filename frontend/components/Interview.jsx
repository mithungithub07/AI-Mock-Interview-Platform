import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import QuestionCard from "./QuestionCard"
import "../style/interview.css"

const Interview = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [role, setRole] = useState(() =>
    location.state?.role || sessionStorage.getItem("role") || ""
  )
  const [level, setLevel] = useState(() =>
    location.state?.level || sessionStorage.getItem("level") || ""
  )
  const [currentQuestion, setCurrentQuestion] = useState(() =>
    parseInt(sessionStorage.getItem("currentQuestion") || "0")
  )
  const [answers, setAnswers] = useState(() => {
    const saved = sessionStorage.getItem("answers")
    return saved ? JSON.parse(saved) : []
  })
  const [isRecording, setIsRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(() =>
    parseInt(sessionStorage.getItem("timeLeft") || "60")
  )
  const [questions, setQuestions] = useState(() => {
    const saved = sessionStorage.getItem("questions")
    if (saved) return JSON.parse(saved)
    return Array.isArray(location.state?.questions) ? location.state.questions : []
  })

  // ✅ NEW: Validate interview token if present
  useEffect(() => {
    const validateToken = async () => {
      const query = new URLSearchParams(location.search)
      const token = query.get('token')
      const urlRole = query.get('role')
      const urlLevel = query.get('level')

      if (token) {
        try {
          const formData = new FormData()
          formData.append('token', token)

          const res = await fetch(
            'https://ai-mock-interview-platform-pryk.onrender.com/admin/validate-interview-token',
            {
              method: 'POST',
              body: formData
            }
          )

          if (!res.ok) {
            alert('Invalid or expired interview link')
            navigate('/')
            return
          }

          const data = await res.json()

          if (data.valid) {
            setRole(data.role)
            setLevel(data.level)
            sessionStorage.setItem('role', data.role)
            sessionStorage.setItem('level', data.level)
            console.log('✅ Token validated:', data)
          } else {
            alert('Invalid interview link')
            navigate('/')
          }
        } catch (err) {
          console.error('Token validation error:', err)
          alert('Failed to validate interview link')
          navigate('/')
        }
      } else if (urlRole && urlLevel) {
        setRole(urlRole)
        setLevel(urlLevel)
      }
    }

    validateToken()
  }, [location.search, navigate])

  // Sync states to sessionStorage
  useEffect(() => { if (role) sessionStorage.setItem("role", role) }, [role])
  useEffect(() => { if (level) sessionStorage.setItem("level", level) }, [level])
  useEffect(() => { sessionStorage.setItem("currentQuestion", currentQuestion) }, [currentQuestion])
  useEffect(() => { sessionStorage.setItem("answers", JSON.stringify(answers)) }, [answers])
  useEffect(() => { sessionStorage.setItem("timeLeft", timeLeft) }, [timeLeft])
  useEffect(() => {
    if (questions.length > 0) sessionStorage.setItem("questions", JSON.stringify(questions))
  }, [questions])

  // ✅ FIXED: Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      if (questions.length === 0 && role && level) {
        try {
          console.log('📝 Fetching questions for:', role, level)

          const res = await fetch(
            'https://ai-mock-interview-platform-pryk.onrender.com/start-interview',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role, level })
            }
          )

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }

          const data = await res.json()
          console.log('✅ Questions received:', data.questions.length)

          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions)
            sessionStorage.setItem('questions', JSON.stringify(data.questions))
          } else {
            console.error('❌ No questions in response')
            alert('Failed to load questions. Please try again.')
            navigate('/')
          }
        } catch (err) {
          console.error('❌ Error fetching questions:', err)
          alert('Failed to load questions. Please check your connection.')
          navigate('/')
        }
      }
    }
    fetchQuestions()
  }, [questions.length, role, level, navigate])

  // Determine if current question is coding
  const isCodingQuestion = () => {
    if (!questions[currentQuestion]) return false
    const codingKeywords = [
      'write a program', 'write code', 'write a function', 'write a method',
      'create a function', 'create a method', 'create a program',
      'solve', 'algorithm to', 'code to', 'code for'
    ]
    const isJuniorOrSenior = level === 'junior' || level === 'senior'
    const questionLower = questions[currentQuestion].toLowerCase()
    return isJuniorOrSenior && codingKeywords.some(k => questionLower.includes(k))
  }

  // Set timer when question changes
  useEffect(() => {
    setTimeLeft(isCodingQuestion() ? 1200 : 60)
  }, [currentQuestion, questions, level])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1)
      else submitInterview()
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, currentQuestion])

  const saveAnswer = (answer) => {
    const updated = [...answers]
    updated[currentQuestion] = { question: questions[currentQuestion], answer }
    setAnswers(updated)
  }

  const nextQuestion = () => setCurrentQuestion(currentQuestion + 1)

  const submitInterview = async () => {
    const finalAnswers = answers.filter(a => a?.answer?.trim())

    try {
      const response = await fetch(
        "https://ai-mock-interview-platform-pryk.onrender.com/generate-feedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, level, interview_data: finalAnswers })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend Error:', errorText)
        throw new Error(`Backend Error: ${errorText}`)
      }

      const data = await response.json()
      sessionStorage.clear()
      navigate("/feedback", { state: { feedback: data.feedback } })

    } catch (error) {
      console.error('Submit Error:', error)
      alert('Failed to submit interview. Please try again.')
    }
  }

  if (questions.length === 0) {
    return (
      <div className="interview-loading">
        <h2>Loading Interview Questions...</h2>
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    )
  }

  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100)
  const isLast = currentQuestion === questions.length - 1

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
        <h1 className="interview-title">{role || "Unknown"} Interview</h1>
        <p className="interview-level">{level || "Unknown"}</p>
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
          >⏱ {formatTime(timeLeft)}</span>
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
          {isRecording ? "⏺ Stop recording before continuing" :
            isLast ? "Ready to submit?" : "Answer, then move on"}
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