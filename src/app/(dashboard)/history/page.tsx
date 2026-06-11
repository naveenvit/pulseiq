"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { fadeUp, stagger } from "@/lib/motion"
import { useAuth } from "@/contexts/AuthContext"
import apiClient from "@/lib/api-client"
import {
  MessageCircle,
  Clock,
  Search,
  ArrowRight,
  Trash2,
  Loader2,
} from "lucide-react"

interface Session {
  id: string
  title: string
  created_at: string
  updated_at?: string
  message_count?: number
  topic?: string | null
}

export default function HistoryPage() {
  const { user } = useAuth()

  const [sessions, setSessions] = useState<Session[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return

    setSessions([])
    setIsLoading(true)

    apiClient
      .get<Session[]>("/chat/sessions")
      .then((res) => setSessions(res.data))
      .catch(() => setSessions([]))
      .finally(() => setIsLoading(false))
  }, [user?.id])

  const filtered = sessions.filter((session) =>
    session.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm("Delete this conversation?")) return

    setDeletingId(id)

    try {
      await apiClient.delete(`/chat/sessions/${id}`)
      setSessions((prev) => prev.filter((session) => session.id !== id))
    } catch {
      alert("Could not delete conversation")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto translate-x-75">
      <motion.div
        variants={stagger(0.07)}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-8"
      >
        {/* Header */}
        <motion.div variants={fadeUp()} className="flex flex-col gap-1">
          <h1
            className="text-slate-900 font-bold tracking-tight"
            style={{ fontSize: "1.75rem", letterSpacing: "-0.03em" }}
          >
            History
          </h1>
          <p className="text-sm text-slate-500">
            All your past conversations and report analyses in one place.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div variants={fadeUp()}>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "#f7f8fa", border: "1px solid #e4e8ed" }}
          >
            <Search
              className="w-4 h-4 text-slate-400 flex-shrink-0 translate-x-3"
              style={{ height: "30px" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your health history..."
              className="flex-1 bg-transparent text-sm text-slate-800
                         placeholder:text-slate-400 outline-none translate-x-3"
            />
          </div>
        </motion.div>

        {/* Filter tabs */}
        <motion.div variants={fadeUp()} className="flex items-center gap-2">
          {["All", "Chats", "Reports"].map((tab, i) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-xl text-sm font-medium
                          transition-all duration-150
                          ${
                            i === 0
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* History list */}
        <motion.div
          variants={stagger(0.05)}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          {isLoading ? (
            <motion.div
              variants={fadeUp()}
              className="card p-5 flex items-center justify-center gap-2 text-sm text-slate-500"
            >
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              Loading history...
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              variants={fadeUp()}
              className="card p-8 flex flex-col items-center justify-center gap-3 text-center"
            >
              <MessageCircle className="w-8 h-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">
                {search ? "No matching conversations" : "No conversations yet"}
              </p>
              <p className="text-xs text-slate-400">
                {search
                  ? "Try searching with a different keyword."
                  : "Start a new chat to see it here."}
              </p>

              {!search && (
                <Link href="/chat" className="btn btn-primary mt-2">
                  Start chatting
                </Link>
              )}
            </motion.div>
          ) : (
            filtered.map((session) => (
              <motion.div key={session.id} variants={fadeUp()}>
                <Link href={`/chat?session=${session.id}`}>
                  <div
                    className="card p-5 flex items-center gap-4 cursor-pointer group"
                    style={{ height: "55px" }}
                  >
                    <div
                      className="w-10 h-10 bg-blue-50 rounded-xl flex items-center
                                 justify-center flex-shrink-0 translate-x-3"
                    >
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-0.5 translate-x-2">
                      <p className="text-sm font-semibold text-slate-800 leading-tight truncate">
                        {session.title}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {formatDate(session.updated_at || session.created_at)}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-xs text-slate-400">
                          {session.message_count ?? 0} messages
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      disabled={deletingId === session.id}
                      className="p-2 rounded-lg text-slate-300
                                 hover:text-red-500 hover:bg-red-50
                                 transition-all duration-150 opacity-0
                                 group-hover:opacity-100"
                    >
                      {deletingId === session.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>

                    <ArrowRight
                      className="w-4 h-4 text-slate-300
                                 group-hover:text-blue-400
                                 group-hover:translate-x-0.5
                                 transition-all duration-150 flex-shrink-0 -translate-x-3"
                    />
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Empty state placeholder */}
        <motion.div variants={fadeUp()}>
          <div
            className="flex items-center justify-center gap-2
                       py-4 text-sm text-slate-400"
          >
            <Clock className="w-4 h-4" />
            <span>
              Showing all history — oldest entries archived after 7 days on Free plan.
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}