"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Send, Plus, Shield, Loader2, AlertTriangle } from "lucide-react"
import { fadeUp } from "@/lib/motion"
import { useChat } from "@/hooks/useChat"

const suggestions = [
  "What does a high white blood cell count mean?",
  "I have a sore throat and mild fever — what should I do?",
  "What are common side effects of ibuprofen?",
  "How do I read my blood pressure numbers?",
]

function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }

    return <span key={i}>{part}</span>
  })
}

function ChatContent() {
  const searchParams = useSearchParams()

  const {
    messages,
    isStreaming,
    isLoading,
    error,
    sendMessage,
    loadSession,
    loadSessions,
    startNewSession,
    clearError,
  } = useChat()

  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const initialSessionLoaded = useRef(false)

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  useEffect(() => {
    if (initialSessionLoaded.current) return

    const sessionId = searchParams.get("session")

    if (sessionId) {
      initialSessionLoaded.current = true
      loadSession(sessionId)
    }
  }, [searchParams, loadSession])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (text: string) => {
    const content = text.trim()
    if (!content || isStreaming) return

    setInput("")
    await sendMessage(content)
  }

  const handleNewChat = () => {
    startNewSession()
    window.history.replaceState(null, "", "/chat")
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col max-w-[1220px] mx-auto w-full translate-x-75">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4
                      border-b border-slate-100 bg-white flex-shrink-0 translate-y-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 grad-brand rounded-xl flex items-center
                          justify-center shadow-sm">
            <Activity className="w-[18px] h-[18px] text-white" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              PulseIQ Assistant
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span className="text-xs text-slate-400">
                {isStreaming ? "Thinking..." : "Online"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs
                     font-medium text-slate-500 hover:text-slate-900
                     hover:bg-slate-100 transition-all duration-150"
        >
          <Plus className="w-3.5 h-3.5" />
          New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5 translate-y-3">
        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
          <motion.div
            variants={fadeUp()}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center gap-6 py-12"
          >
            <div className="w-14 h-14 grad-brand rounded-2xl flex items-center
                            justify-center shadow-md">
              <Activity className="w-7 h-7 text-white" />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
                How can I help you today?
              </h2>
              <p className="text-sm text-slate-500 max-w-[360px] leading-relaxed">
                Ask me anything about symptoms, medications, or health topics.
                I'll give you clear, reliable guidance.
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[520px]">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left px-4 py-3 rounded-xl text-sm text-slate-600
                             hover:text-blue-700 hover:bg-blue-50
                             transition-all duration-150 w-full"
                  style={{ border: "1px solid #e8ecf0", height: "40px" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading session */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Message bubbles */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 grad-brand rounded-lg flex-shrink-0
                                flex items-center justify-center shadow-sm mt-0.5">
                  <Activity className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`flex flex-col gap-1 max-w-[78%]
                            ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    background: msg.role === "user" ? "#2563eb" : "#f8f9fb",
                    color: msg.role === "user" ? "#ffffff" : "#475569",
                    border: msg.role === "user" ? "none" : "1px solid #eef0f3",
                  }}
                >
                  {msg.role === "assistant"
                    ? renderContent(msg.content)
                    : msg.content}
                </div>

                <span className="text-[0.6875rem] text-slate-400 px-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 grad-brand rounded-lg flex-shrink-0
                            flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4 text-white" />
            </div>

            <div
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
              style={{
                background: "#f8f9fb",
                border: "1px solid #eef0f3",
                borderRadius: "18px 18px 18px 4px",
              }}
            >
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-6 py-4 bg-white border-t border-slate-100 flex-shrink-0 translate-x-50 -translate-y-6">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl
                     focus-within:border-blue-400
                     focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.10)]
                     transition-all duration-150"
          style={{
            background: "#f7f8fa",
            border: "1px solid #e4e8ed",
            width: "800px",
            height: "45px",
          }}
        >
          <input
            type="text"
            placeholder="Ask about symptoms, medications, or health topics..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend(input)
              }
            }}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-sm text-slate-800
                       placeholder:text-slate-400 outline-none translate-x-3
                       disabled:opacity-60"
          />

          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isStreaming}
            className="w-8 h-8 grad-brand rounded-xl flex items-center
                       justify-center flex-shrink-0 shadow-sm
                       hover:opacity-90 transition-opacity duration-150
                       disabled:opacity-40 disabled:cursor-not-allowed -translate-x-2"
            aria-label="Send message"
          >
            {isStreaming ? (
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-6 py-2 flex-shrink-0">
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl translate-x-80 -translate-y-3"
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            width: "500px",
          }}
        >
          <Shield className="w-4 h-5 text-blue-600 flex-shrink-0 mt-5 translate-x-3" />
          <p className="text-xs text-blue-600 leading-none translate-x-2">
            Educational guidance only — not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  )
}

function formatTime(value?: string) {
  if (!value) {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}