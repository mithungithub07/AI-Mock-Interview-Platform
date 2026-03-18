import { useState, useRef, useEffect } from "react"
import axios from "axios"

const DEEPGRAM_URL = [
    "wss://api.deepgram.com/v1/listen",
    "?model=nova-3",
    "&language=en-IN",
    "&punctuate=true",
    "&smart_format=true",
    "&no_delay=true",
    "&endpointing=150",
].join("")

const QuestionCard = ({ question, index, onAnswer, setIsRecording }) => {

    const [answer, setAnswer] = useState("")
    const [listening, setListening] = useState(false)
    const [status, setStatus] = useState("idle")
    const [isEditing, setIsEditing] = useState(false)  // ← edit state

    const socketRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const answerRef = useRef("")
    const silenceTimer = useRef(null)

    useEffect(() => { answerRef.current = answer }, [answer])
    useEffect(() => () => stopAll(), [])

    const stopAll = () => {
        clearTimeout(silenceTimer.current)
        if (mediaRecorderRef.current?.state !== "inactive") {
            try { mediaRecorderRef.current?.stop() } catch { }
        }
        mediaRecorderRef.current?.stream
            ?.getTracks()
            ?.forEach(t => t.stop())
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.close()
        }
    }

    const finaliseAnswer = () => {
        onAnswer(answerRef.current.trim())
    }

    const startRecording = async () => {
        if (listening) return
        setStatus("connecting")
        try {
            const tokenRes = await axios.get("https://ai-mock-interview-platform-pryk.onrender.com/deepgram-token")
            const token = tokenRes.data.token

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    latency: 0,          // ← add this
                    suppressLocalAudioPlayback: true  // ← add this
                }
            })

            const mimeType = [
                "audio/webm;codecs=opus",
                "audio/webm",
                "audio/ogg;codecs=opus",
            ].find(t => MediaRecorder.isTypeSupported(t)) || "audio/webm"

            const mediaRecorder = new MediaRecorder(stream, { mimeType })
            mediaRecorderRef.current = mediaRecorder

            const socket = new WebSocket(DEEPGRAM_URL, ["token", token])
            socketRef.current = socket

            socket.onopen = () => {
                setStatus("live")
                setListening(true)
                setIsRecording(true)
                mediaRecorder.start(50)
            }

            socket.onmessage = (msg) => {
                const data = JSON.parse(msg.data)
                if (data.type === "Results") {
                    const alt = data.channel?.alternatives?.[0]
                    if (!alt?.transcript) return
                    const transcript = alt.transcript.trim()
                    if (!transcript) return
                    if (data.speech_final) {
                        setAnswer(prev => {
                            const updated = prev ? prev + " " + transcript : transcript
                            answerRef.current = updated
                            return updated
                        })
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
                if (status === "live") setStatus("idle")
            }

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                    socket.send(event.data)
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