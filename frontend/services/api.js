import axios from "axios"

const API = axios.create({
  //baseURL: "http://127.0.0.1:8000"
  baseURL: "https://ai-mock-interview-platform-pryk.onrender.com"
})
export const startInterview = async (role, level) => {


  const response = await API.post("/start-interview", {
    role: role,
    level: level
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


export const loginUser = async (data) => {
  const response = await API.post("/auth/login", data)
  return response.data
}


export const registerUser = async (data) => {
  const response = await API.post("/auth/register", data)
  return response.data
}


export const uploadPDF = async (role, file, token) => {
  const formData = new FormData();
  formData.append("role", role);
  formData.append("file", file);

  const response = await API.post("/admin/upload-pdf", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // required (admin)
    },
  });

  return response.data;
};

export const sendInterviewLink = async (data, token) => {
  const response = await API.post("/admin/send-interview-link", data, {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });

  return response.data;
};

export const getQuestions = async (token) => {
  const response = await API.get("/admin/questions", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateQuestions = async (data, token) => {
  const response = await API.put("/admin/questions", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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