import Link from "next/link"
import { LucideIcon } from "lucide-react"

interface Props {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center
                    py-16 px-6 gap-5">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}
      >
        <Icon className="w-6 h-6 text-slate-400" />
      </div>

      <div className="flex flex-col gap-2 max-w-[300px]">
        <p className="text-base font-semibold text-slate-800 tracking-tight">
          {title}
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && (
        actionHref ? (
          <Link href={actionHref} className="btn btn-primary">
            {actionLabel}
          </Link>
        ) : (
          <button onClick={onAction} className="btn btn-primary">
            {actionLabel}
          </button>
        )
      )}
    </div>
  )
}