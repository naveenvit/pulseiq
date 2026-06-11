"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import { fadeUp, stagger } from "@/lib/motion"
import { useAuth } from "@/contexts/AuthContext"

function getErrorMessage(err: unknown): string {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response
    ?.data?.detail

  if (typeof detail === "string") return detail

  if (Array.isArray(detail)) {
    const firstError = detail[0] as { msg?: string } | undefined
    return firstError?.msg || "Invalid email or password"
  }

  return "Invalid email or password"
}

export default function LoginPage() {
  const { login } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(form.email, form.password)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
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
      {/* Header */}
      <motion.div variants={fadeUp()} className="flex flex-col gap-2">
        <h1
          className="text-slate-900 font-bold tracking-tight"
          style={{ fontSize: "1.75rem", lineHeight: 1.15, letterSpacing: "-0.03em" }}
        >
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Sign in to your PulseIQ account to continue.
        </p>
      </motion.div>

      {error && (
        <motion.div
          variants={fadeUp()}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <motion.form
        variants={fadeUp()}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full h-10 rounded-xl text-sm text-slate-800
                       placeholder:text-slate-400 outline-none
                       transition-all duration-150"
            style={{
              background: "#f8f9fb",
              border: "1px solid #e4e8ed",
              paddingLeft: "20px",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid #2563eb"
              e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)"
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid #e4e8ed"
              e.target.style.boxShadow = "none"
            }}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-700
                         font-medium transition-colors duration-150"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full h-10 px-4 pr-11 rounded-xl text-sm text-slate-800
                         placeholder:text-slate-400 outline-none
                         transition-all duration-150"
              style={{
                background: "#f8f9fb",
                border: "1px solid #e4e8ed",
                paddingLeft: "20px",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #2563eb"
                e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)"
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid #e4e8ed"
                e.target.style.boxShadow = "none"
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2
                         text-slate-400 hover:text-slate-600
                         transition-colors duration-150 p-0.5"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full justify-center mt-1"
          style={{ padding: "13px 24px" }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </motion.form>

      {/* Divider */}
      <motion.div variants={fadeUp()} className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-xs text-slate-400 font-medium">or</span>
        <div className="flex-1 h-px bg-slate-100" />
      </motion.div>

      {/* OAuth placeholder */}
      <motion.button
        variants={fadeUp()}
        type="button"
        className="btn btn-secondary w-full justify-center gap-3"
        style={{ padding: "13px 24px" }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </motion.button>

      {/* Sign up link */}
      <motion.p variants={fadeUp()} className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-blue-600 font-semibold hover:text-blue-700
                     transition-colors duration-150"
        >
          Sign up free
        </Link>
      </motion.p>
    </motion.div>
  )
}