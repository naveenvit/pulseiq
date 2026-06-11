interface Props {
  size?: "sm" | "md" | "lg"
  label?: string
}

const sizes = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-[3px]",
}

export default function LoadingSpinner({ size = "md", label }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} rounded-full animate-spin`}
        style={{
          borderColor: "#e2e8f0",
          borderTopColor: "#2563eb",
        }}
        aria-label="Loading"
        role="status"
      />
      {label && (
        <p className="text-sm text-slate-400 font-medium">{label}</p>
      )}
    </div>
  )
}