import { Shield } from "lucide-react"

interface Props {
  compact?: boolean
}

export default function DisclaimerBanner({ compact = false }: Props) {
  if (compact) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
        style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
      >
        <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
        <p className="text-xs text-blue-600 leading-none">
          Educational guidance only — not a substitute for professional medical advice.
        </p>
      </div>
    )
  }

  return (
    <div
      className="flex items-start gap-3 px-5 py-4 rounded-2xl"
      style={{
        background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
        border: "1px solid #bfdbfe",
      }}
    >
      <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-blue-700 leading-relaxed">
        <span className="font-semibold">Disclaimer: </span>
        PulseIQ is an educational platform and does not provide medical
        diagnoses or replace professional medical advice. Always consult a
        qualified healthcare provider for medical concerns.
      </p>
    </div>
  )
}