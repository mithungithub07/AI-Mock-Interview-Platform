import axios from "axios"

const API = axios.create({
  baseURL: "https://ai-mock-interview-platform-pryk.onrender.com"
})

export const startInterview = async (role) => {

  const response = await API.post("/start-interview", {
    role: role
  })

  return response.data
}

export const generateFeedback = async (role, interviewData) => {

  const response = await API.post("/generate-feedback", {
    role: role,
    interview_data: interviewData
  })

  return response.data
}