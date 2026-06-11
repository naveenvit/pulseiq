"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import { fadeUp, stagger } from "@/lib/motion"
import apiClient from "@/lib/api-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const inputStyle = {
    background: "#f8f9fb",
    border: "1px solid #e4e8ed",
    paddingLeft: "20px",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await apiClient.post(`/auth/forgot-password?email=${encodeURIComponent(email.trim())}`)
      setSent(true)
    } catch {
      // Always show success — never reveal if account exists
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={stagger(0.07)}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-7"
    >
      {/* Back link */}
      <motion.div variants={fadeUp()}>
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={fadeUp()} className="flex flex-col gap-2">
        <h1
          className="text-slate-900 font-bold tracking-tight"
          style={{ fontSize: "1.75rem", lineHeight: 1.15, letterSpacing: "-0.03em" }}
        >
          Forgot your password?
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Enter your email and we will send you a reset link.
        </p>
      </motion.div>

      {sent ? (
        <motion.div
          variants={fadeUp()}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-4 py-6 text-center"
        >
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
            <Mail className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-1">Check your terminal</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
              In dev mode, copy the link from the backend terminal.
            </p>
          </div>
          <Link href="/login" className="btn btn-primary mt-2" style={{ padding: "10px 24px" }}>
            Back to login
          </Link>
        </motion.div>
      ) : (
        <motion.form
          variants={fadeUp()}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 px-4 rounded-xl text-sm text-slate-800
                         placeholder:text-slate-400 outline-none transition-all duration-150"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full justify-center mt-1"
            style={{ padding: "13px 24px" }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </motion.form>
      )}
    </motion.div>
  )
}
