// =============================
// USER TYPES
// =============================
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
}

// =============================
// CHAT TYPES
// =============================
export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  isEmergency?: boolean
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

// =============================
// REPORT TYPES
// =============================
export interface MedicalReport {
  id: string
  fileName: string
  fileUrl: string
  uploadedAt: string
  summary?: string
  status: "processing" | "ready" | "error"
}

// =============================
// EMERGENCY TYPES
// =============================
export interface EmergencyAlert {
  detected: boolean
  type?: string
  message?: string
  level: "none" | "warning" | "critical"
}

// =============================
// API TYPES
// =============================
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}