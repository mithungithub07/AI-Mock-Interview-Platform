import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-mock-interview-platform-pryk.onrender.com",
});

// ✅ AUTO ATTACH TOKEN TO EVERY REQUEST
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= PUBLIC APIs =================

export const startInterview = async (role, level) => {
  const response = await API.post("/start-interview", {
    role,
    level,
  });
  return response.data;
};

export const generateFeedback = async (role, interviewData) => {
  const response = await API.post("/generate-feedback", {
    role,
    interview_data: interviewData,
  });
  return response.data;
};

export const loginUser = async (data) => {
  const response = await API.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

// ================= ADMIN APIs (NO TOKEN PARAM NEEDED) =================

export const uploadPDF = async (role, file) => {
  const formData = new FormData();
  formData.append("role", role);
  formData.append("file", file);

  const response = await API.post("/admin/upload-pdf", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const sendInterviewLink = async (data) => {
  const response = await API.post("/admin/send-interview-link", data);
  return response.data;
};

export const getQuestions = async () => {
  const response = await API.get("/admin/questions");
  return response.data;
};

export const updateQuestions = async (data) => {
  const response = await API.put("/admin/questions", data);
  return response.data;
};

export const validateInterviewToken = async (token) => {
  const formData = new FormData();
  formData.append("token", token);

  const response = await API.post(
    "/admin/validate-interview-token",
    formData
  );

  return response.data;
};