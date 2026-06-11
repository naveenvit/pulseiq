"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import apiClient from "@/lib/api-client"
import {
  MessageCircle, FileText, AlertTriangle,
  Clock, ArrowRight, TrendingUp,
  Shield, Loader2,
} from "lucide-react"
import { fadeUp, stagger } from "@/lib/motion"

interface DashboardStats {
  session_count: number
  report_count: number
  emergency_count: number
  recent_sessions: Array<{
    id: string
    title: string
    created_at: string
    message_count?: number
  }>
}

const quickActions = [
  {
    icon: MessageCircle,
    title: "Ask AI",
    description: "Start a new health conversation",
    href: "/chat",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: FileText,
    title: "Upload Report",
    description: "Analyze a medical document",
    href: "/reports",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: AlertTriangle,
    title: "Emergency",
    description: "Get urgent symptom guidance",
    href: "/emergency",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
  {
    icon: Clock,
    title: "History",
    description: "Review past conversations",
    href: "/history",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    setStats(null)
    setIsLoading(true)

    apiClient
      .get<DashboardStats>("/chat/stats")
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setIsLoading(false))
  }, [user?.id])

  const firstName = user?.full_name?.split(" ")[0] || "there"

  const totalSessions = stats?.session_count ?? 0
  const totalReports = stats?.report_count ?? 0
  const emergencyEvents = stats?.emergency_count ?? 0
  const recentSessions = stats?.recent_sessions ?? []

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto translate-x-75">
      <motion.div
        variants={stagger(0.07)}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-8"
      >
        <div className="h-[px]" />

        {/* Welcome header */}
        <motion.div variants={fadeUp()} className="flex flex-col gap-1">
          <h1
            className="text-slate-900 font-bold tracking-tight"
            style={{ fontSize: "1.75rem", letterSpacing: "-0.03em" }}
          >
            Good {getTimeOfDay()}, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500">
            How can PulseIQ help you today?
          </p>
        </motion.div>

        {/* Disclaimer banner */}
        <motion.div variants={fadeUp()}>
          <div
            className="flex items-start gap-3 px-5 py-4 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
              border: "1px solid #bfdbfe",
              width: "920px",
            }}
          >
            <Shield className="w-5 h-6 text-blue-600 flex-shrink-0 mt-5 translate-x-2" />
            <p className="text-sm text-blue-700 leading-relaxed">
              <span className="font-semibold">Remember: </span>
              PulseIQ provides educational guidance only. Always consult a
              qualified healthcare professional for medical decisions.
            </p>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp()} className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-800 tracking-tight">
            Quick actions
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 min-h-[120px]">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="card p-5 flex flex-col gap-4 group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 ${action.bg} border ${action.border}
                              rounded-xl flex items-center justify-center
                              group-hover:scale-105 transition-transform duration-200
                              translate-x-3 translate-y-3`}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>

                <div className="flex flex-col gap-1 translate-x-3 translate-y-3">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {action.title}
                  </p>
                  <p className="text-xs text-slate-400 leading-snug">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Main grid */}
        <motion.div
          variants={fadeUp()}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          {/* Recent activity */}
          <div className="lg:col-span-2 card p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between translate-x-5 translate-y-3">
              <h2 className="text-base font-semibold text-slate-800 tracking-tight">
                Recent activity
              </h2>

              <Link
                href="/history"
                className="text-xs font-medium text-blue-600
                           hover:text-blue-700 transition-colors duration-150
                           flex items-center gap-1 group -translate-x-10"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
              </Link>
            </div>

            <div className="h-1" />

            <div className="flex flex-col gap-3 translate-x-6">
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading your activity...
                </div>
              ) : recentSessions.length > 0 ? (
                recentSessions.slice(0, 3).map((session) => (
                  <Link key={session.id} href={`/chat?session=${session.id}`}>
                    <div
                      className="flex items-start gap-3 p-4 rounded-xl
                                 hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                      style={{ border: "1px solid #f1f5f9", width: "680px" }}
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">
                          {session.title}
                        </p>
                        <p className="text-xs text-slate-500 leading-snug truncate">
                          {session.message_count ?? 0} messages
                        </p>
                      </div>

                      <span className="text-[0.6875rem] text-slate-400 flex-shrink-0 mt-0.5 -translate-x-5">
                        {formatRelativeTime(session.created_at)}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-400 px-4 py-3">
                  No recent activity yet.
                </p>
              )}
            </div>

            <div className="h-3" />

            <Link
              href="/chat"
              className="flex items-center justify-between p-4 rounded-xl
                         border border-dashed border-slate-200
                         hover:border-blue-200 hover:bg-blue-50/30
                         transition-all duration-150 group translate-x-5"
              style={{ width: "680px", height: "30px" }}
            >
              <div className="flex items-center gap-3 translate-x-3">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-500 group-hover:text-blue-600 transition-colors duration-150">
                  Start a new health conversation
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-150 -translate-x-1" />
            </Link>
          </div>

          {/* Health summary panel */}
          <div className="flex flex-col gap-4">
            <div className="card p-5 flex flex-col gap-4" style={{ height: "130px" }}>
              <div className="flex items-center justify-between translate-x-3 translate-y-3">
                <h3 className="text-sm font-semibold text-slate-800">
                  AI Status
                </h3>

                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full -translate-x-6"
                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", width: "55px" }}
                >
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full translate-x-1" />
                  <span className="text-[0.6875rem] font-medium text-green-700 translate-x-1">
                    Online
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 translate-x-3 translate-y-3">
                {[
                  { label: "Health Chat", status: "Ready" },
                  { label: "Report Analysis", status: "Ready" },
                  { label: "Emergency Check", status: "Active" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{s.label}</span>
                    <span className="text-xs font-medium text-green-600 -translate-x-8">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5 flex flex-col gap-4" style={{ height: "160px" }}>
              <div className="flex items-center gap-2 translate-x-3 translate-y-3">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Your activity
                </h3>
              </div>

              <div className="flex flex-col gap-3 translate-x-3 translate-y-3">
                <ActivityBar label="Conversations" value={totalSessions} multiplier={5} />
                <ActivityBar label="Reports analyzed" value={totalReports} multiplier={10} />
              </div>

              <Link
                href="/pricing"
                className="text-xs font-medium text-blue-600
                           hover:text-blue-700 transition-colors duration-150 translate-x-3 translate-y-3"
              >
                Upgrade for unlimited access →
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function ActivityBar({
  label,
  value,
  multiplier,
}: {
  label: string
  value: number
  multiplier: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-semibold text-slate-800 -translate-x-7">
          {value}
        </span>
      </div>

      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden" style={{ width: "93%" }}>
        <div
          className="h-full grad-brand rounded-full"
          style={{ width: `${Math.min(value * multiplier, 100)}%` }}
        />
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  return "evening"
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

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}