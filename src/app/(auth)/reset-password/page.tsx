"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, Check } from "lucide-react"
import { fadeUp, stagger } from "@/lib/motion"
import apiClient from "@/lib/api-client"

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",  test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number",            test: (p: string) => /[0-9]/.test(p) },
]

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) setError("Invalid reset link. Please request a new one.")
  }, [token])

  const inputStyle = {
    background: "#f8f9fb",
    border: "1px solid #e4e8ed",
    paddingLeft: "20px",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setError("")
    setLoading(true)
    try {
      await apiClient.post(
        `/auth/reset-password?token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(password)}`
      )
      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail
      setError(detail || "This link is invalid or has expired. Please request a new one.")
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
      <motion.div variants={fadeUp()} className="flex flex-col gap-2">
        <h1
          className="text-slate-900 font-bold tracking-tight"
          style={{ fontSize: "1.75rem", lineHeight: 1.15, letterSpacing: "-0.03em" }}
        >
          Set new password
        </h1>
        <p className="text-sm text-slate-500">Choose a strong password for your account.</p>
      </motion.div>

      {success ? (
        <motion.div variants={fadeUp()} className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
            <Check className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-1">Password updated!</p>
            <p className="text-sm text-slate-500">Redirecting you to login in a moment...</p>
          </div>
        </motion.div>
      ) : (
        <motion.form variants={fadeUp()} onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
              {error.includes("invalid or has expired") && (
                <span> <Link href="/forgot-password" className="underline font-medium">Request a new one.</Link></span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">New password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 px-4 pr-11 rounded-xl text-sm text-slate-800
                           placeholder:text-slate-400 outline-none transition-all duration-150"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {password.length > 0 && (
              <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-1.5 mt-1">
                {passwordRules.map((rule) => {
                  const passed = rule.test(password)
                  return (
                    <li key={rule.label} className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${passed ? "bg-green-500" : "bg-slate-200"}`}>
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </span>
                      <span className={`text-xs ${passed ? "text-green-600" : "text-slate-400"}`}>{rule.label}</span>
                    </li>
                  )
                })}
              </motion.ul>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="btn btn-primary w-full justify-center mt-1"
            style={{ padding: "13px 24px" }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : "Set new password"}
          </button>
        </motion.form>
      )}

      <motion.p variants={fadeUp()} className="text-center text-sm text-slate-500">
        Remember it now?{" "}
        <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in</Link>
      </motion.p>
    </motion.div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
