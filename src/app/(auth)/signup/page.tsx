"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react"
import { fadeUp, stagger } from "@/lib/motion"
import { useAuth } from "@/contexts/AuthContext"

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
]

export default function SignupPage() {
  const { register } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      await register(form.email, form.password, form.name)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Could not create account. Please try again."

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: "#f8f9fb",
    border: "1px solid #e4e8ed",
    paddingLeft: "20px",
  }

  const focusStyle = {
    border: "1px solid #2563eb",
    boxShadow: "0 0 0 3px rgba(37,99,235,0.10)",
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
          Create your account
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Free forever. No credit card required.
        </p>
      </motion.div>

      {error && (
        <motion.div
          variants={fadeUp()}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {typeof error === "string"
            ? error
            : (error as any)?.msg || (error as any)?.detail || "Something went wrong"}
        </motion.div>
      )}

      {/* Form */}
      <motion.form
        variants={fadeUp()}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        {/* Full name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            type="text"
            placeholder="John Smith"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full h-10 px-4 rounded-xl text-sm text-slate-800
                       placeholder:text-slate-400 outline-none transition-all duration-150"
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          />
        </div>

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
            className="w-full h-10 px-4 rounded-xl text-sm text-slate-800
                       placeholder:text-slate-400 outline-none transition-all duration-150"
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full h-10 px-4 pr-11 rounded-xl text-sm text-slate-800
                         placeholder:text-slate-400 outline-none transition-all duration-150"
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
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

          {/* Password strength */}
          {form.password.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-1.5 mt-1"
            >
              {passwordRules.map((rule) => {
                const passed = rule.test(form.password)

                return (
                  <li key={rule.label} className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center
                                  flex-shrink-0 transition-colors duration-200
                                  ${passed ? "bg-green-500" : "bg-slate-200"}`}
                    >
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </span>

                    <span
                      className={`text-xs transition-colors duration-200
                                  ${passed ? "text-green-600" : "text-slate-400"}`}
                    >
                      {rule.label}
                    </span>
                  </li>
                )
              })}
            </motion.ul>
          )}
        </div>

        {/* Terms */}
        <p className="text-xs text-slate-400 leading-relaxed">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-blue-600 hover:underline font-medium">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
            Privacy Policy
          </Link>.
        </p>

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
              Creating account...
            </>
          ) : (
            <>
              Create free account
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

      {/* Google */}
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

      {/* Login link */}
      <motion.p variants={fadeUp()} className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-600 font-semibold hover:text-blue-700
                     transition-colors duration-150"
        >
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  )
}