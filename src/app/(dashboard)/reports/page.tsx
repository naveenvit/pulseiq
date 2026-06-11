"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { fadeUp, stagger } from "@/lib/motion"
import { useAuth } from "@/contexts/AuthContext"
import apiClient from "@/lib/api-client"
import {
  Upload, FileText, CheckCircle,
  Clock, AlertCircle, Shield,
  Loader2, Trash2, ChevronDown, ChevronUp,
} from "lucide-react"

interface Report {
  id: string
  filename?: string
  original_filename?: string
  file_size_bytes?: number
  report_type?: string | null
  report_date?: string | null
  lab_name?: string | null
  status: "uploaded" | "processing" | "analyzed" | "failed"
  summary?: string | null
  ai_summary?: string | null
  ai_insights?: Insight[] | null
  abnormal_findings?: string[] | null
  confidence_score?: number | null
  created_at: string
  analyzed_at?: string | null
  model_used?: string
}

interface Insight {
  category: string
  parameter: string
  value: string
  normal_range: string
  status: string
  interpretation: string
}

const statusConfig = {
  uploaded: {
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Uploaded",
  },
  processing: {
    icon: Loader2,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Processing",
  },
  analyzed: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Ready",
  },
  failed: {
    icon: AlertCircle,
    color: "text-rose-600",
    bg: "bg-rose-50",
    label: "Error",
  },
}

export default function ReportsPage() {
  const { user } = useAuth()

  const [dragging, setDragging] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadReports = async () => {
    try {
      const res = await apiClient.get<Report[]>("/reports")
      setReports(res.data)
    } catch {
      setReports([])
    }
  }

  useEffect(() => {
    if (!user?.id) return

    setReports([])
    setIsLoading(true)

    loadReports().finally(() => setIsLoading(false))
  }, [user?.id])

  useEffect(() => {
    const hasPending = reports.some(
      (r) => r.status === "uploaded" || r.status === "processing"
    )

    if (hasPending && !pollingRef.current) {
      pollingRef.current = setInterval(loadReports, 4000)
    }

    if (!hasPending && pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [reports])

  const handleUploadFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF files are accepted")
      return
    }

    setUploadError("")
    setIsUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      await apiClient.post("/reports/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      await loadReports()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Upload failed. Please try again."

      setUploadError(message)
    } finally {
      setIsUploading(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleInputUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUploadFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) handleUploadFile(file)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this report?")) return

    setDeletingId(id)

    try {
      await apiClient.delete(`/reports/${id}`)
      setReports((prev) => prev.filter((report) => report.id !== id))
    } catch {
      alert("Could not delete report")
    } finally {
      setDeletingId(null)
    }
  }

  const handleReanalyse = async (id: string) => {
    try {
      await apiClient.post(`/reports/${id}/reanalyse`)
      await loadReports()
    } catch {
      alert("Could not start re-analysis")
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
        <div className="h-[px]" />

        {/* Header */}
        <motion.div variants={fadeUp()} className="flex flex-col gap-1">
          <h1
            className="text-slate-900 font-bold tracking-tight"
            style={{ fontSize: "1.75rem", letterSpacing: "-0.03em" }}
          >
            Medical Reports
          </h1>
          <p className="text-sm text-slate-500">
            Upload and analyze your lab results, blood panels, and health documents.
          </p>
        </motion.div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleInputUpload}
          className="hidden"
        />

        {/* Upload zone */}
        <motion.div variants={fadeUp()}>
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center gap-4
                       px-8 py-14 rounded-2xl text-center cursor-pointer
                       transition-all duration-200"
            style={{
              border: `2px dashed ${dragging ? "#2563eb" : "#cbd5e1"}`,
              background: dragging ? "#eff6ff" : "#f8fafc",
              height: "160px",
            }}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center
                          transition-colors duration-200
                          ${dragging ? "bg-blue-100" : "bg-white"}`}
              style={{ border: "1px solid #e2e8f0" }}
            >
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              ) : (
                <Upload
                  className={`w-6 h-6 transition-colors duration-200
                              ${dragging ? "text-blue-600" : "text-slate-400"}`}
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-slate-800">
                {isUploading ? "Uploading report..." : "Drop your report here, or"}{" "}
                {!isUploading && (
                  <span className="text-blue-600 cursor-pointer hover:underline">
                    browse files
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400">
                Supports PDF files up to 10MB — Blood reports, lab results, health summaries
              </p>
            </div>
          </div>
        </motion.div>

        {uploadError && (
          <motion.div
            variants={fadeUp()}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            {uploadError}
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.div variants={fadeUp()}>
          <div
            className="flex items-start gap-3 px-5 py-4 rounded-2xl"
            style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
          >
            <Shield className="w-5 h-6 text-blue-600 flex-shrink-0 mt-5 translate-x-2" />
            <p className="text-sm text-blue-700 leading-relaxed">
              <span className="font-semibold">Important: </span>
              Report analysis is for educational purposes only. Always discuss
              your results with your healthcare provider for proper interpretation.
            </p>
          </div>
        </motion.div>

        {/* Reports list */}
        <motion.div variants={fadeUp()} className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-800 tracking-tight">
            Previous reports
          </h2>

          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="card p-5 flex items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                Loading reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="card p-8 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">
                  No reports yet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Upload your first medical report to get started.
                </p>
              </div>
            ) : (
              reports.map((report) => {
                const cfg =
                  statusConfig[report.status as keyof typeof statusConfig] ||
                  statusConfig.uploaded

                const StatusIcon = cfg.icon
                const expanded = expandedId === report.id
                const filename = report.original_filename || report.filename || "Medical report"
                const summary = report.ai_summary || report.summary

                return (
                  <div key={report.id} className="card overflow-hidden">
                    <div
                      className="p-5 flex items-center gap-4 cursor-pointer
                                 hover:shadow-md transition-all duration-200"
                      style={{ minHeight: "60px" }}
                    >
                      <div
                        className="w-10 h-10 bg-violet-50 border border-violet-100
                                   rounded-xl flex items-center justify-center flex-shrink-0 translate-x-3"
                      >
                        <FileText className="w-5 h-5 text-violet-600" />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <p className="text-sm font-semibold text-slate-800 leading-tight truncate">
                          {filename}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {summary || report.lab_name || "Report uploaded for analysis."}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0 -translate-x-3">
                        <span className="text-xs text-slate-400 hidden sm:block">
                          {formatDate(report.created_at)}
                        </span>

                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1.5
                                      rounded-full ${cfg.bg}`}
                        >
                          <StatusIcon
                            className={`w-3.5 h-3.5 ${cfg.color} ${
                              report.status === "processing" ? "animate-spin" : ""
                            }`}
                          />
                          <span className={`text-[0.6875rem] font-semibold ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>

                        {report.status === "analyzed" && (
                          <button
                            onClick={() =>
                              setExpandedId(expanded ? null : report.id)
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            {expanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {report.status === "failed" && (
                          <button
                            onClick={() => handleReanalyse(report.id)}
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >
                            Retry
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(report.id)}
                          disabled={deletingId === report.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          {deletingId === report.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="border-t border-slate-100 px-5 py-4">
                        {report.ai_insights && report.ai_insights.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            {report.ai_insights.map((insight, i) => (
                              <div
                                key={i}
                                className="rounded-xl bg-slate-50 p-4 text-sm"
                              >
                                <p className="font-semibold text-slate-800">
                                  {insight.parameter}: {insight.value}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  Normal range: {insight.normal_range}
                                </p>
                                <p className="text-sm text-slate-500 mt-2">
                                  {insight.interpretation}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            {summary || "No detailed insights available."}
                          </p>
                        )}

                        {report.abnormal_findings &&
                          report.abnormal_findings.length > 0 && (
                            <div className="mt-4 flex flex-col gap-2">
                              {report.abnormal_findings.map((finding, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-amber-700"
                                >
                                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <span>{finding}</span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
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