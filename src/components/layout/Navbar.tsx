"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  X,
  Activity,
  LogOut,
  User,
  LayoutDashboard,
  MessageSquare,
  FileText,
  type LucideIcon,
} from "lucide-react"
import { APP_NAME, NAV_LINKS } from "@/lib/constants"
import { ease } from "@/lib/motion"
import { useAuth } from "@/contexts/AuthContext"
type NavItem = {
  label: string
  href: string
  icon?: LucideIcon
}
const dashboardLinks: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Reports", href: "/reports", icon: FileText },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/emergency")

  const activeLinks: NavItem[] =
    isDashboard && isAuthenticated ? dashboardLinks : NAV_LINKS

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      {/* Outer strip */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: ease.out }}
        className="fixed top-5 inset-x-0 z-50 flex justify-center pt-6 px-4"
      >
        {/* Pill container */}
        <div
          className={`
            w-full max-w-[1100px] h-14
            flex items-center justify-between gap-6
            px-8 rounded-2xl
            transition-all duration-300
            ${
              scrolled
                ? "glass border border-slate-200/70 shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
                : "bg-white/80 border border-slate-200/60 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
            }
          `}
          style={{
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
          }}
        >
          {/* Logo */}
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 flex-shrink-0 group translate-x-3"
          >
            <div
              className="w-8 h-8 grad-brand rounded-lg flex items-center justify-center
                         shadow-sm group-hover:shadow-md group-hover:scale-105
                         transition-all duration-200"
            >
              <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>

            <span className="text-[1.0625rem] font-bold tracking-tight text-slate-900">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop center nav */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {activeLinks.map((link) => {
              const Icon = link.icon
              const active = pathname === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium
                              rounded-xl transition-all duration-150
                              flex items-center gap-1.5
                              ${
                                active
                                  ? "text-blue-600 bg-blue-50"
                                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                              }`}
                >
                  {Icon ? <Icon className="w-4 h-4" /> : null}
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop right CTAs */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0 -translate-x-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl
                             hover:bg-slate-100/80 transition-all duration-150"
                >
                  <div
                    className="w-7 h-7 grad-brand rounded-lg flex items-center
                               justify-center shadow-sm"
                  >
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    {user?.full_name?.split(" ")[0] || "Account"}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                             text-slate-500 hover:text-rose-600 hover:bg-rose-50
                             rounded-xl transition-all duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600
                             hover:text-slate-900 hover:bg-slate-100/80
                             rounded-xl transition-all duration-150"
                >
                  Sign in
                </Link>

                <Link
                  href="/signup"
                  className="btn btn-primary"
                  style={{ padding: "9px 20px", fontSize: "0.875rem" }}
                >
                  Get started free
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500
                       hover:text-slate-900 hover:bg-slate-100
                       transition-colors duration-150"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: ease.out }}
            className="fixed top-[84px] inset-x-4 z-40 bg-white/90 rounded-2xl
                       shadow-xl border border-slate-200/70 p-5 md:hidden"
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <nav className="flex flex-col gap-1 mb-4">
              {activeLinks.map((link) => {
                const Icon =link.icon
                const active = pathname === link.href

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-2.5 text-sm font-medium
                                rounded-xl transition-colors duration-150
                                flex items-center gap-2
                                ${
                                  active
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
                                }`}
                  >
                    {Icon ? <Icon className="w-4 h-4" /> : null}
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/settings"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-secondary w-full justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {user?.full_name || "My Account"}
                  </Link>

                  <button
                    onClick={() => {
                      logout()
                      setMobileOpen(false)
                    }}
                    className="btn btn-secondary w-full justify-center gap-2 text-rose-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-secondary w-full justify-center"
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-primary w-full justify-center"
                  >
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}