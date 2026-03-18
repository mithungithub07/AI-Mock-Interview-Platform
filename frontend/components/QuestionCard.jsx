import { useState, useRef, useEffect } from "react"
import axios from "axios"

const DEEPGRAM_URL = [
    "wss://api.deepgram.com/v1/listen",
    "?model=nova-2",
    "&language=en-IN",
    "&punctuate=true",
    "&smart_format=true",
    "&no_delay=true",
    "&endpointing=150",
].join("")

const AUDIO_CONSTRAINTS = {
    channelCount: 1,
    sampleRate: 16000,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    latency: 0,
}

const MIME_TYPE = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
].find(t => MediaRecorder.isTypeSupported(t)) || "audio/webm"

// Tech term corrections for Indian English mishearings
const TECH_CORRECTIONS = {
    "topple": "tuple",
    "accept": "except",
    "que": "queue",
    "pollen": "polling",
    "reacts": "React",
    "java script": "JavaScript",
    "get": "Git",
    "pie thon": "Python",
}

const applyCorrections = (text) => {
    let result = text
    Object.entries(TECH_CORRECTIONS).forEach(([wrong, correct]) => {
        const regex = new RegExp(`\\b${wrong}\\b`, "gi")
        result = result.replace(regex, correct)
    })
    return result
}

const QuestionCard = ({ question, index, onAnswer, setIsRecording }) => {
    const [answer, setAnswer] = useState("")
    const [listening, setListening] = useState(false)
    const [status, setStatus] = useState("idle")
    const [isEditing, setIsEditing] = useState(false)

    const socketRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const answerRef = useRef("")

    useEffect(() => { answerRef.current = answer }, [answer])
    useEffect(() => () => stopAll(), [])

    const stopAll = () => {
        if (mediaRecorderRef.current?.state !== "inactive") {
            try { mediaRecorderRef.current?.stop() } catch { }
        }
        mediaRecorderRef.current?.stream?.getTracks()?.forEach(t => t.stop())
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.close()
        }
    }

    const finaliseAnswer = () => {
        onAnswer(answerRef.current.trim())
    }

    const appendTranscript = (transcript) => {
        const corrected = applyCorrections(transcript)
        setAnswer(prev => {
            const updated = prev ? prev + " " + corrected : corrected
            answerRef.current = updated
            return updated
        })
    }

    const startRecording = async () => {
        if (listening) return
        setStatus("connecting")

        try {
            const tokenRes = await axios.get(
                "https://ai-mock-interview-platform-pryk.onrender.com/deepgram-token"
            )
            const token = tokenRes.data.token

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: AUDIO_CONSTRAINTS
            })

            const mediaRecorder = new MediaRecorder(stream, { mimeType: MIME_TYPE })
            mediaRecorderRef.current = mediaRecorder

            const socket = new WebSocket(DEEPGRAM_URL, ["token", token])
            socketRef.current = socket

            socket.onopen = () => {
                setStatus("live")
                setListening(true)
                setIsRecording(true)
                mediaRecorder.start(100)
            }

            socket.onmessage = (msg) => {
                const data = JSON.parse(msg.data)

                if (data.type === "Results") {
                    const transcript = data.channel?.alternatives?.[0]?.transcript?.trim()
                    if (!transcript) return
                    if (data.speech_final) {
                        appendTranscript(transcript)
                    }
                }

                if (data.type === "UtteranceEnd") {
                    finaliseAnswer()
                }
            }

            socket.onerror = () => {
                setStatus("error")
                stopAll()
                setListening(false)
                setIsRecording(false)
            }

            socket.onclose = () => {
                setStatus(prev => prev === "live" ? "idle" : prev)
            }

            mediaRecorder.ondataavailable = ({ data }) => {
                if (data.size > 0 && socket.readyState === WebSocket.OPEN) {
                    socket.send(data)
                }
            }

            mediaRecorder.onstop = () => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: "CloseStream" }))
                }
            }

        } catch (err) {
            console.error("Recording error:", err)
            setStatus("error")
            setListening(false)
            setIsRecording(false)
        }
    }

    const stopRecording = () => {
        setStatus("stopping")
        stopAll()
        setListening(false)
        setIsRecording(false)
        finaliseAnswer()
        setStatus("idle")
    }

    const resetRecording = () => {
        stopAll()
        setAnswer("")
        answerRef.current = ""
        setListening(false)
        setIsRecording(false)
        setIsEditing(false)
        setStatus("idle")
    }

    const handleEdit = (e) => {
        setAnswer(e.target.value)
        answerRef.current = e.target.value
    }

    const saveEdit = () => {
        setIsEditing(false)
        onAnswer(answer)
    }

    const statusLabel = {
        idle: "",
        connecting: "",
        live: "",
        stopping: "Saving answer...",
        error: "⚠️ Mic error — check permissions",
    }[status]

    return (
        <div className="qcard">
            <h3 className="qcard-number">Question {index + 1}</h3>
            <p className="qcard-question">{question}</p>

            {statusLabel && (
                <p className={`qcard-status ${status === "error" ? "qcard-status-error" : ""}`}>
                    {statusLabel}
                </p>
            )}

            {!listening ? (
                <button
                    className="qcard-btn-record"
                    onClick={startRecording}
                    disabled={status === "connecting" || status === "stopping"}
                >
                    {status === "connecting" ? "Connecting..." : "Start Recording"}
                </button>
            ) : (
                <button className="qcard-btn-record qcard-btn-recording" onClick={stopRecording}>
                    Stop Recording
                </button>
            )}

            <p className="qcard-answer-label"><strong>Your Answer</strong></p>

            {isEditing ? (
                <textarea
                    className="qcard-answer-edit"
                    value={answer}
                    onChange={handleEdit}
                    rows={4}
                    autoFocus
                />
            ) : (
                <p className={`qcard-answer-text ${answer ? "has-answer" : ""}`}>
                    {answer || "No answer recorded yet"}
                </p>
            )}

            <div className="qcard-btn-row">
                <button className="qcard-btn-reset" onClick={resetRecording}>
                    Reset Answer
                </button>

                {answer && !listening && (
                    isEditing ? (
                        <button className="qcard-btn-save" onClick={saveEdit}>
                            Save Answer
                        </button>
                    ) : (
                        <button className="qcard-btn-edit" onClick={() => setIsEditing(true)}>
                            Edit Answer
                        </button>
                    )
                )}
            </div>
        </div>
    )
}

export default QuestionCard