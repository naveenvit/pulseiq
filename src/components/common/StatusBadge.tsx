interface Props {
  status: "online" | "offline" | "processing" | "ready" | "error"
  label?: string
}

const config = {
  online:     { dot: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
  offline:    { dot: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0", text: "#64748b" },
  processing: { dot: "#f59e0b", bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
  ready:      { dot: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
  error:      { dot: "#ef4444", bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
}

const defaultLabels = {
  online:     "Online",
  offline:    "Offline",
  processing: "Processing",
  ready:      "Ready",
  error:      "Error",
}

export default function StatusBadge({ status, label }: Props) {
  const c = config[status]
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: c.dot }}
      />
      <span
        className="text-[0.6875rem] font-semibold"
        style={{ color: c.text }}
      >
        {label ?? defaultLabels[status]}
      </span>
    </div>
  )
}