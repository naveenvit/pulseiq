"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { fadeUp, stagger } from "@/lib/motion"
import { useAuth } from "@/contexts/AuthContext"
import apiClient from "@/lib/api-client"
import {
  User, Bell, Shield, Save,
  ChevronRight, Loader2, LogOut,
} from "lucide-react"

const sections = [
  { icon: User, label: "Profile", id: "profile" },
  { icon: Bell, label: "Notifications", id: "notifs" },
  { icon: Shield, label: "Privacy", id: "privacy" },
]

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth()

  const [active, setActive] = useState("profile")
  const [fullName, setFullName] = useState(user?.full_name || "")
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || "")
  const [gender, setGender] = useState(user?.gender || "")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const inputStyle = {
    background: "#f8f9fb",
    border: "1px solid #e4e8ed",
    height: "35px",
    paddingLeft: "20px",
    width: "500px",
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSaving(true)

    try {
      const res = await apiClient.put("/auth/me", {
        full_name: fullName,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
      })

      updateUser(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError("Failed to save changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto translate-x-8">
      <motion.div
        variants={stagger(0.07)}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-8"
      >
        <div className="h-[px]" />

        <motion.div variants={fadeUp()} className="flex flex-col gap-1">
          <h1
            className="text-slate-900 font-bold tracking-tight"
            style={{ fontSize: "1.75rem", letterSpacing: "-0.03em" }}
          >
            Settings
          </h1>
          <p className="text-sm text-slate-500">
            Manage your account preferences and privacy settings.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp()}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          <div className="lg:col-span-1 flex flex-col gap-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex items-center justify-between gap-3 px-4 py-3
                            rounded-xl text-sm font-medium transition-all duration-150 w-full
                            ${
                              active === s.id
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                style={{ height: "40px" }}
              >
                <div className="flex items-center gap-3">
                  <s.icon
                    className={`w-4 h-4 ${
                      active === s.id ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  {s.label}
                </div>
                <ChevronRight
                  className={`w-4 h-4 ${
                    active === s.id ? "text-blue-400" : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 card p-7 flex flex-col gap-7">
            {active === "profile" && (
              <form onSubmit={handleSave} style={{ height: "590px" }}>
                <div className="flex flex-col gap-1.5 translate-x-4 translate-y-4">
                  <h2 className="text-base font-semibold text-slate-800 tracking-tight">
                    Profile Information
                  </h2>
                  <p className="text-sm text-slate-500">
                    Update your personal details.
                  </p>
                </div>

                <div className="h-8" />

                {error && (
                  <div className="translate-x-4 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {saved && (
                  <div className="translate-x-4 mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    ✓ Changes saved successfully
                  </div>
                )}

                <div className="flex flex-col gap-5 translate-x-4 translate-y-4">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 grad-brand rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-sm font-semibold text-slate-800">
                        Profile photo
                      </p>
                      <p className="text-xs text-slate-400">
                        Profile image upload can be added later.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="rounded-xl text-sm text-slate-400 outline-none cursor-not-allowed"
                      style={inputStyle}
                    />
                    <p className="text-xs text-slate-400">
                      Email cannot be changed.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="rounded-xl text-sm text-slate-800 outline-none"
                      style={inputStyle}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Date of birth
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="rounded-xl text-sm text-slate-800 outline-none"
                      style={inputStyle}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="rounded-xl text-sm text-slate-800 outline-none"
                      style={inputStyle}
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn btn-primary justify-center mt-2"
                    style={{ padding: "13px 24px", width: "180px" }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {active === "notifs" && (
              <div style={{ height: "590px" }} className="translate-x-4 translate-y-4">
                <h2 className="text-base font-semibold text-slate-800 tracking-tight">
                  Notifications
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Notification preferences can be added later.
                </p>
              </div>
            )}

            {active === "privacy" && (
              <div style={{ height: "590px" }} className="translate-x-4 translate-y-4">
                <h2 className="text-base font-semibold text-slate-800 tracking-tight">
                  Privacy
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Manage account privacy and session controls.
                </p>

                <button
                  onClick={logout}
                  className="mt-8 flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}