import axios from "axios"

const API = axios.create({
  baseURL: "http://127.0.0.1:8000"
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