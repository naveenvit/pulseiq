"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Activity } from "lucide-react"
import { APP_NAME } from "@/lib/constants"
import { useAuth } from "@/contexts/AuthContext"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [isLoading, user, router])

  if (!isLoading && user) return null

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col
                   justify-between p-12 relative overflow-hidden flex-shrink-0"
        style={{
          background:
            "linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 55%, #0369a1 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.045] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="absolute -top-32 -right-32 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 translate-x-4 translate-y-4">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 bg-white/15 border border-white/25 rounded-xl
                         flex items-center justify-center
                         group-hover:bg-white/20 transition-colors duration-200"
            >
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>

            <span className="text-lg font-bold text-white tracking-tight">
              {APP_NAME}
            </span>
          </Link>
        </div>

        <div className="absolute z-10 left-20 right-12 top-1/2 -translate-y-1/2 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2
              className="text-white font-bold leading-tight"
              style={{
                fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)",
                letterSpacing: "-0.03em",
              }}
            >
              Your health,
              <br />
              clearly understood.
            </h2>

            <p className="text-blue-100/75 text-[1rem] leading-relaxed max-w-[320px]">
              Join PulseIQ and get AI-powered guidance for symptoms,
              medications, and medical reports — safely and clearly.
            </p>
          </div>

          <ul className="flex flex-col gap-3.5">
            {[
              "Understand symptoms in plain language",
              "Analyze medical reports instantly",
              "Emergency detection built in",
              "Trusted medical knowledge base",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span
                  className="w-5 h-5 bg-white/15 border border-white/20
                             rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                </span>

                <span className="text-sm text-blue-100/80 font-medium">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <p className="text-blue-200/40 text-xs leading-relaxed">
            PulseIQ is an educational platform and does not replace
            professional medical advice.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        <div
          className="lg:hidden flex items-center justify-between px-6 py-5
                     border-b border-slate-100"
        >
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div
              className="w-8 h-8 grad-brand rounded-lg flex items-center
                         justify-center shadow-sm"
            >
              <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>

            <span className="text-[1.0625rem] font-bold tracking-tight text-slate-900">
              {APP_NAME}
            </span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        <div className="px-6 py-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} {APP_NAME} · Not a substitute for
            professional medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}
