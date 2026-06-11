"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Activity, Shield, ArrowRight, Zap, Lock } from "lucide-react"
import { fadeUp, stagger, transition } from "@/lib/motion"

const trust = [
  { icon: Shield,   label: "HIPAA Safe Design" },
  { icon: Activity, label: "24/7 AI Guidance" },
  { icon: Lock,     label: "Private & Secure" },
]

// ── Chat messages data ──────────────────────────────────────────
const messages = [
  {
    role: "assistant" as const,
    text: "Hello! I'm PulseIQ. How can I help with your health today? 👋",
  },
  {
    role: "user" as const,
    text: "I've had a headache and slight fever since yesterday. Should I be worried?",
  },
  {
    role: "assistant" as const,
    text: "A mild headache with a low-grade fever is usually a sign of a common viral infection. I'd recommend staying well-hydrated and getting plenty of rest.\n\nIf your fever rises above 103°F or symptoms persist beyond 3 days, please consult a doctor. 🩺",
    highlights: ["103°F", "3 days"],
  },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-16">

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        <div className="absolute top-0 right-0 w-[65%] h-full
                        bg-gradient-to-bl from-blue-50/60 via-sky-50/25 to-transparent" />
        <div className="absolute top-1/4 right-[15%] w-[480px] h-[480px]
                        bg-blue-100/20 rounded-full blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.014]"
          style={{
            backgroundImage: "radial-gradient(circle, #1d4ed8 1.5px, transparent 1.5px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      <div className="container relative z-10 py-20 lg:py-0
                      lg:min-h-screen lg:flex lg:items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2
                        gap-12 lg:gap-16 xl:gap-20 items-center w-full">

          {/* ════════════════════════════════════
              LEFT COLUMN — DO NOT CHANGE
              ════════════════════════════════════ */}
          <motion.div
            variants={stagger(0.08)}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start text-left"
          >
            {/* Badge */}
            <motion.div variants={fadeUp()}>
              <div className="badge badge-brand mb-7">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full anim-pulse-dot" />
                AI-Powered Healthcare Guidance
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp()} className="t-display mb-6">
              Your Personal
              <br />
              <span className="grad-text">AI Health</span>
              <br />
              Companion
            </motion.h1>

            {/* Subheadline */}
            <motion.p variants={fadeUp()} className="t-body-lg max-w-[460px] mb-9">
              Understand symptoms, analyze medical reports, and get reliable
              health guidance through a simple, safe conversation.
            </motion.p>
            <div className="h-3"/>
            {/* CTAs */}
            <motion.div variants={fadeUp()}
                        className="flex flex-wrap items-center gap-3 mb-10">
              <Link href="/signup" className="btn btn-primary">
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/features" className="btn btn-secondary">
                <Zap className="w-4 h-4 text-blue-500" />
                See how it works
              </Link>
            </motion.div>
            <div className="h-4"/>
            {/* Trust */}
            <motion.div variants={fadeUp()}
                        className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
              {trust.map(({ icon: Icon, label }) => (
                <div key={label}
                     className="flex items-center gap-2 t-small font-medium text-slate-400">
                  <Icon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Chat card ── */}
          <motion.div
            initial={{ opacity: 0, x: 32, y: 16 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ ...transition.slow, delay: 0.3 }}
            className="relative w-full max-w-[500px] mx-auto lg:mx-0 lg:justify-self-end"
          >
            {/* Ambient glow */}
            <div className="absolute -inset-8 rounded-[40px] -z-10"
                 style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(37,99,235,0.08) 0%, transparent 70%)" }} />

            {/* Card */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e4e8ed",
                borderRadius: "24px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.03), 0 12px 32px rgba(0,0,0,0.07), 0 32px 64px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >

              {/* ── Header ── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "20px 24px 18px 24px",
                  background: "linear-gradient(180deg, #fafbfc 0%, #f7f8fa 100%)",
                  borderBottom: "1px solid #eef0f3",
                }}
              >
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Activity style={{ width: 18, height: 18, color: "white" }} />
                  </div>
                  <span
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: "#22c55e",
                      border: "2px solid white",
                    }}
                  />
                </div>

                {/* Title */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e293b", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                    PulseIQ
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2, lineHeight: 1 }}>
                    AI Health Assistant
                  </p>
                </div>

                {/* Online pill */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "block" }} />
                  <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#15803d" }}>Online</span>
                </div>
              </div>

              {/* ── Messages ── */}
              <div
                style={{
                  padding: "24px 24px 16px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  background: "#ffffff",
                }}
              >

                {/* AI — greeting */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Activity style={{ width: 12, height: 12, color: "white" }} />
                  </div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "#475569",
                      lineHeight: 1.7,
                      padding: "10px 14px",
                      borderRadius: "16px 16px 16px 4px",
                      background: "#f8f9fb",
                      border: "1px solid #eef0f3",
                      maxWidth: "85%",
                    }}
                  >
                    Hi! I'm PulseIQ. Ask me anything about your health. 👋
                  </div>
                </div>

                {/* User message */}
                <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 2 }}>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "#ffffff",
                      lineHeight: 1.7,
                      padding: "10px 14px",
                      borderRadius: "16px 16px 4px 16px",
                      background: "#2563eb",
                      maxWidth: "80%",
                    }}
                  >
                    I have a headache and fever since yesterday. Should I be worried?
                  </div>
                </div>

                {/* AI — response */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Activity style={{ width: 12, height: 12, color: "white" }} />
                  </div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "#475569",
                      lineHeight: 1.7,
                      padding: "10px 14px",
                      borderRadius: "16px 16px 16px 4px",
                      background: "#f8f9fb",
                      border: "1px solid #eef0f3",
                      maxWidth: "85%",
                    }}
                  >
                    Commonly caused by a viral infection. Rest and stay hydrated.
                    See a doctor if fever exceeds{" "}
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>103°F</span>{" "}
                    or lasts more than{" "}
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>3 days</span>. 🩺
                  </div>
                </div>

                {/* Typing indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Activity style={{ width: 12, height: 12, color: "white" }} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "10px 14px",
                      borderRadius: "16px 16px 16px 4px",
                      background: "#f8f9fb",
                      border: "1px solid #eef0f3",
                    }}
                  >
                    {[0, 140, 280].map((d) => (
                      <span
                        key={d}
                        className="animate-bounce"
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#cbd5e1",
                          display: "block",
                          animationDelay: `${d}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>

              </div>

              {/* ── Input bar ── */}
              <div
                style={{
                  padding: "12px 24px 24px 24px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 16,
                    background: "#f7f8fa",
                    border: "1px solid #e4e8ed",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: "#94a3b8",
                      flex: 1,
                      userSelect: "none",
                      lineHeight: 1,
                    }}
                  >
                    Ask a health question...
                  </span>
                  <button
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(37,99,235,0.28)",
                    }}
                    aria-label="Send"
                  >
                    <ArrowRight style={{ width: 14, height: 14, color: "white" }} />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}