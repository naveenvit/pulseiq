"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { fadeUp, stagger } from "@/lib/motion"
import apiClient from "@/lib/api-client"
import {
  AlertTriangle, Phone, Heart,
  Wind, Brain, Zap, ArrowRight,
  Shield, Loader2, CheckCircle, Clock, Send,
} from "lucide-react"

interface EmergencyResult {
  is_emergency: boolean
  confidence: string
  detected_keywords: string[]
  detection_method: string
  response_message: string
  call_emergency: boolean
  emergency_number: string
}

interface EmergencyEvent {
  id: string
  trigger_message: string
  detected_keywords: string[] | null
  detection_method: string
  escalated_to_911: boolean
  created_at: string
}

const emergencies = [
  {
    icon: Heart,
    title: "Chest Pain / Heart Attack",
    symptoms: ["Crushing chest pressure", "Pain spreading to arm or jaw", "Shortness of breath", "Cold sweats and nausea"],
    action: "Call emergency services immediately. Do not drive yourself.",
  },
  {
    icon: Brain,
    title: "Stroke Symptoms",
    symptoms: ["Sudden face drooping", "Arm weakness on one side", "Speech difficulty", "Sudden severe headache"],
    action: "Call emergency services immediately. Note the time symptoms started.",
  },
  {
    icon: Wind,
    title: "Severe Breathing Difficulty",
    symptoms: ["Cannot complete sentences", "Lips or face turning blue", "Rapid deteriorating breathing", "Extreme wheezing"],
    action: "Call emergency services immediately. Sit upright and stay calm.",
  },
  {
    icon: Zap,
    title: "Severe Allergic Reaction",
    symptoms: ["Throat tightening or swelling", "Difficulty swallowing", "Widespread hives with breathing issues", "Rapid heart rate with dizziness"],
    action: "Use epinephrine auto-injector if available. Call emergency services.",
  },
]

export default function EmergencyPage() {
  const [message, setMessage] = useState("")
  const [result, setResult] = useState<EmergencyResult | null>(null)
  const [events, setEvents] = useState<EmergencyEvent[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    apiClient
      .get("/emergency/events")
      .then((res) => setEvents(res.data))
      .catch(console.error)
      .finally(() => setIsLoadingEvents(false))
  }, [])

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setError("")
    setIsChecking(true)
    setResult(null)

    try {
      const res = await apiClient.post("/emergency/detect", {
        message: message.trim(),
      })

      setResult(res.data)

      if (res.data.is_emergency) {
        const eventsRes = await apiClient.get("/emergency/events")
        setEvents(eventsRes.data)
      }
    } catch {
      setError("Check failed. Please try again.")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto translate-x-75">
      <motion.div
        variants={stagger(0.07)}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5"
      >
        {/* Header */}
        <motion.div variants={fadeUp()}>
          <div
            className="flex items-start gap-4 p-6 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #fef2f2, #fff1f2)",
              border: "2px solid #fecaca",
              height: "150px",
            }}
          >
            <div className="w-12 h-12 bg-rose-100 border border-rose-200
                            rounded-2xl flex items-center justify-center flex-shrink-0 translate-x-3 translate-y-3">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>

            <div className="flex flex-col gap-2">
              <h1
                className="text-rose-900 font-bold tracking-tight translate-x-2 translate-y-3"
                style={{ fontSize: "1.5rem", letterSpacing: "-0.025em" }}
              >
                Emergency Guidance
              </h1>

              <p className="text-sm text-rose-700 leading-relaxed translate-x-2 translate-y-1">
                This page provides general emergency information only. If you believe
                you have a medical emergency,{" "}
                <span className="font-bold">call emergency services immediately</span>.
                Do not rely solely on this information.
              </p>

              <a
                href="tel:112"
                className="inline-flex items-center gap-2 mt-1 px-4 py-2.5
                           bg-rose-600 text-white text-sm font-bold rounded-xl
                           hover:bg-rose-700 transition-colors duration-150 w-fit translate-x-2 translate-y-1"
                style={{ width: "200px", height: "28px" }}
              >
                <Phone className="w-4 h-4 translate-x-1" />
                Call Emergency Services
              </a>
            </div>
          </div>
        </motion.div>

        {/* Symptom checker */}
        <motion.div variants={fadeUp()}>
          <form
            onSubmit={handleCheck}
            className="card p-6 flex flex-col gap-4" style={{height: "210px"}}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 translate-x-3 translate-y-3" />
              <h2 className="text-base font-semibold text-slate-800 tracking-tight translate-x-3 translate-y-3">
                Symptom Emergency Check
              </h2>
            </div>

            <p className="text-sm text-slate-500 translate-x-4 translate-y-2">
              Describe what you are experiencing. PulseIQ will check if emergency care may be needed.
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Example: I have severe chest pain and difficulty breathing..."
              rows={4}
              className="w-full rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none translate-x-3 translate-y-2"
              style={{
                background: "#f8f9fb",
                border: "1px solid #e4e8ed",
                padding: "14px 18px",
                width: "900px",
                height: "50px"
              }}
            />

            {error && (
              <p className="text-sm text-rose-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={!message.trim() || isChecking}
              className="btn btn-primary justify-center translate-x-2 translate-y-2"
              style={{ width: "170px", padding: "12px 20px" }}
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Check symptoms
                </>
              )}
            </button>

            {result && (
              <div
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{
                  background: result.is_emergency ? "#fef2f2" : "#f0fdf4",
                  border: result.is_emergency ? "1px solid #fecaca" : "1px solid #bbf7d0",
                }}
              >
                <div className="flex items-center gap-2">
                  {result.is_emergency ? (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}

                  <p
                    className={`text-sm font-bold ${
                      result.is_emergency ? "text-rose-700" : "text-green-700"
                    }`}
                  >
                    {result.is_emergency
                      ? "Emergency signals detected"
                      : "No emergency signals detected"}
                  </p>
                </div>

                <p
                  className={`text-sm leading-relaxed ${
                    result.is_emergency ? "text-rose-700" : "text-green-700"
                  }`}
                >
                  {result.response_message ||
                    "If symptoms worsen or you feel unsafe, seek medical help immediately."}
                </p>

                {result.detected_keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.detected_keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-1 bg-white border border-rose-200 text-rose-600 rounded-full text-xs"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}

                {result.call_emergency && (
                  <a
                    href={`tel:${result.emergency_number}`}
                    className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700
                               text-white font-bold px-5 py-2.5 rounded-xl transition w-fit"
                  >
                    <Phone className="w-4 h-4" />
                    Call {result.emergency_number} Now
                  </a>
                )}
              </div>
            )}
          </form>
        </motion.div>

        {/* Emergency cards */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          variants={stagger(0.08)}
          initial="hidden"
          animate="visible"
        >
          {emergencies.map((emergency) => (
            <motion.div
              key={emergency.title}
              variants={fadeUp()}
              className="flex flex-col gap-5 p-6 rounded-2xl"
              style={{
                background: "#ffffff",
                border: "1px solid #fecaca",
                boxShadow: "0 2px 8px rgba(239,68,68,0.06)",
                height: "250px",
              }}
            >
              <div className="flex items-center gap-3 translate-x-3 translate-y-3">
                <div className="w-10 h-10 bg-rose-50 border border-rose-100
                                rounded-xl flex items-center justify-center flex-shrink-0">
                  <emergency.icon className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                  {emergency.title}
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide translate-x-3 translate-y-3">
                  Warning signs
                </p>
                <ul className="flex flex-col gap-2">
                  {emergency.symptoms.map((s) => (
                    <li key={s} className="flex items-start gap-2.5 translate-x-5 translate-y-3">
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full flex-shrink-0 mt-1.5 translate-y-1.5" />
                      <span className="text-sm text-slate-600 leading-snug">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="flex items-start gap-3 p-4 rounded-xl translate-x-5"
                style={{ background: "#fef2f2", border: "1px solid #fecaca", height: "30px", width: "500px" }}
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5 translate-x-2 translate-y-1" />
                <p className="text-sm font-semibold text-rose-700 leading-relaxed">
                  {emergency.action}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Detection history */}
        <motion.div variants={fadeUp()} className="card p-6 flex flex-col gap-4" style={{height:"80px"}}>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500 translate-x-3 translate-y-2" />
            <h2 className="text-base font-semibold text-slate-800 tracking-tight translate-x-3 translate-y-2">
              Detection History
            </h2>
          </div>

          {isLoadingEvents ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <p className="text-sm text-slate-400 translate-x-3 translate-y-2">
              No emergency events recorded.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl p-4 flex items-start gap-3"
                  style={{
                    background: event.escalated_to_911 ? "#fef2f2" : "#fffbeb",
                    border: event.escalated_to_911 ? "1px solid #fecaca" : "1px solid #fde68a",
                  }}
                >
                  <AlertTriangle
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      event.escalated_to_911 ? "text-rose-600" : "text-amber-600"
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {event.trigger_message}
                    </p>

                    {event.detected_keywords && event.detected_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {event.detected_keywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-500 rounded text-xs"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {formatRelativeTime(event.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* AI chat redirect */}
        <motion.div variants={fadeUp()}>
          <a
            href="/chat"
            className="flex items-center justify-between gap-4 p-6 rounded-2xl cursor-pointer group"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", height: "65px" }}
          >
            <div className="flex flex-col gap-1 translate-x-3">
              <p className="text-sm font-semibold text-slate-800">
                Not sure if it's an emergency?
              </p>
              <p className="text-sm text-slate-500">
                Describe your symptoms to PulseIQ AI for guidance.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400
                                   group-hover:text-blue-500
                                   group-hover:translate-x-1
                                   transition-all duration-150 flex-shrink-0 -translate-x-2" />
          </a>
        </motion.div>
        <div className="h-1"/>
      </motion.div>
    </div>
  )
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  return `${Math.floor(diffHours / 24)}d ago`
}