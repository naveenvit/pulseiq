"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import apiClient from "@/lib/api-client"
import {
  Activity, LayoutDashboard, MessageCircle,
  FileText, Clock, AlertTriangle,
  Menu, X, LogOut, User, Loader2, Settings,
} from "lucide-react"
import { APP_NAME } from "@/lib/constants"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Chat", href: "/chat", icon: MessageCircle },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Emergency", href: "/emergency", icon: AlertTriangle },
  { label: "History", href: "/history", icon: Clock },
]

function VerificationBanner({ userEmail }: { userEmail: string }) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function resend() {
    setLoading(true)

    try {
      await apiClient.post("/auth/resend-verification")
      setSent(true)
    } catch {
      // ignore silently
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2.5 flex items-center gap-3 flex-wrap">
      <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />

      <p className="text-sm text-yellow-800 flex-1">
        Please verify your email address{" "}
        <strong>{userEmail}</strong> to unlock all features.
      </p>

      {sent ? (
        <span className="text-sm font-medium text-green-600">
          Email sent! Check your inbox.
        </span>
      ) : (
        <button
          onClick={resend}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-white border border-yellow-300
                     text-xs font-medium text-yellow-800 hover:bg-yellow-100
                     disabled:opacity-60 transition-colors"
        >
          {loading ? "Sending..." : "Resend verification"}
        </button>
      )}
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoading, user, logout } = useAuth()

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500">Loading PulseIQ...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Chat page has its own full-screen layout

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-40 flex flex-col
          bg-white border-r border-slate-100
          transition-all duration-300 ease-in-out
          ${open ? "w-64" : "w-[72px]"}
          lg:w-64
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 flex-shrink-0">
          <div className="w-9 h-9 grad-brand rounded-xl flex items-center
                          justify-center shadow-sm flex-shrink-0 translate-x-3">
            <Activity className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </div>

          <span
            className={`text-[1.0625rem] font-bold tracking-tight text-slate-900
                        transition-opacity duration-200 translate-x-3
                        ${open ? "opacity-100" : "opacity-0 lg:opacity-100"}`}
          >
            {APP_NAME}
          </span>
        </div>

        <div className="h-5" />

        {/* Nav items */}
        <nav
          className="flex-1 px-3 py-4 flex flex-col gap-3 overflow-y-auto translate-x-3"
          style={{ width: "240px" }}
        >
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-3 h-8 rounded-xl
                  transition-all duration-150 group relative
                  ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors duration-150
                              ${
                                active
                                  ? "text-blue-600"
                                  : "text-slate-400 group-hover:text-slate-700"
                              }`}
                />

                <span
                  className={`text-sm font-medium transition-opacity duration-200 whitespace-nowrap
                              ${open ? "opacity-100" : "opacity-0 lg:opacity-100"}`}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="h-10" />

        {/* User section */}
        <div className="mt-auto px-3 py-4 border-t border-slate-100 flex flex-col gap-1 flex-shrink-0">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                       text-slate-500 hover:text-slate-900 hover:bg-slate-50
                       transition-all duration-150 group translate-x-3 -translate-y-3"
          >
            <div className="w-7 h-7 grad-brand rounded-lg flex items-center
                            justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-white" />
            </div>

            <div
              className={`flex flex-col transition-opacity duration-200
                          ${open ? "opacity-100" : "opacity-0 lg:opacity-100"}`}
            >
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.full_name || "My Account"}
              </span>

              <span className="text-[0.6875rem] text-slate-400 leading-tight">
                {user?.email || "user@example.com"}
              </span>
            </div>
          </Link>

          <div className="h-2" />

          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                       text-slate-400 hover:text-rose-600 hover:bg-rose-50
                       transition-all duration-150 group w-full translate-x-3 -translate-y-3"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />

            <span
              className={`text-sm font-medium transition-opacity duration-200
                          ${open ? "opacity-100" : "opacity-0 lg:opacity-100"}`}
            >
              Sign out
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="min-h-screen flex flex-col min-w-0 lg:ml-64">
        {/* Verification banner */}
        {user && !user.is_verified && (
          <VerificationBanner userEmail={user.email} />
        )}

        {/* Top bar */}
        <header
          className="h-16 bg-white border-b border-slate-100 flex items-center
                     justify-between px-6 flex-shrink-0 sticky top-0 z-20"
        >
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg text-slate-500
                       hover:text-slate-900 hover:bg-slate-100
                       transition-colors duration-150"
            aria-label="Toggle sidebar"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-400 translate-x-3">
            <Activity className="w-4 h-4 text-blue-500" />
            <span>PulseIQ Dashboard</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full -translate-x-3"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs font-medium text-green-700">AI Online</span>
            </div>

            <div
              className="w-8 h-8 grad-brand rounded-lg flex items-center
                         justify-center shadow-sm -translate-x-3"
            >
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}