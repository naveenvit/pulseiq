interface Props {
  title: string
  description?: string
  children?: React.ReactNode
}

export default function PageHeader({ title, description, children }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex flex-col gap-1">
        <h1
          className="text-slate-900 font-bold tracking-tight"
          style={{ fontSize: "1.75rem", letterSpacing: "-0.03em" }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}