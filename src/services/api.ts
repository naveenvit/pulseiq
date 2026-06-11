import axios from "axios"

// =============================
// BASE API INSTANCE
// =============================
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

// =============================
// REQUEST INTERCEPTOR
// =============================
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// =============================
// RESPONSE INTERCEPTOR
// =============================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data || error.message)
    return Promise.reject(error)
  }
)

// =============================
// CHAT API
// =============================
export const chatApi = {
  sendMessage: (message: string, sessionId?: string) =>
    api.post("/api/chat", { message, sessionId }),

  getSessions: () => api.get("/api/chat/sessions"),

  getSession: (sessionId: string) => api.get(`/api/chat/sessions/${sessionId}`),
}

// =============================
// REPORTS API
// =============================
export const reportsApi = {
  upload: (formData: FormData) =>
    api.post("/api/reports/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getAll: () => api.get("/api/reports"),

  getById: (id: string) => api.get(`/api/reports/${id}`),
}