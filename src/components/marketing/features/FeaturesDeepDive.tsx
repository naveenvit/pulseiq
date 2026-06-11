"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { fadeUp, stagger } from "@/lib/motion"
import {
  MessageCircle, FileText, AlertTriangle, CheckCircle,
} from "lucide-react"

const deepDives = [
  {
    icon: MessageCircle,
    tag: "AI Chat",
    title: "Conversations that actually understand you",
    description:
      "Most health tools give you a list of links. PulseIQ gives you a conversation. Describe your situation the way you'd explain it to a doctor — in your own words — and get a clear, structured response that actually addresses what you asked.",
    points: [
      "Multi-turn context memory within sessions",
      "Follow-up questions understood naturally",
      "Answers structured for easy reading",
      "Detects emotional tone and responds appropriately",
    ],
    align: "left" as const,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: FileText,
    tag: "Report Analysis",
    title: "Your lab results — finally explained",
    description:
      "Medical reports are full of numbers and abbreviations that mean nothing without a medical degree. PulseIQ reads your uploaded reports, identifies what's outside normal range, and explains every finding in plain language.",
    points: [
      "Supports blood panels, CBC, lipid profiles, and more",
      "Highlights abnormal values clearly",
      "Explains what each marker means",
      "Suggests follow-up questions for your doctor",
    ],
    align: "right" as const,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: AlertTriangle,
    tag: "Emergency Detection",
    title: "Recognizes when you need help — fast",
    description:
      "Some symptoms need immediate attention. PulseIQ is trained to recognize patterns associated with medical emergencies — chest pain, stroke symptoms, severe allergic reactions, breathing difficulties — and responds immediately with clear escalation guidance.",
    points: [
      "Automatic detection of high-risk symptom patterns",
      "Immediate escalation with clear next steps",
      "Emergency contact guidance included",
      "Never delays critical information",
    ],
    align: "left" as const,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
]

export default function FeaturesDeepDive() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="section" style={{ background: "#f8fafc" }}>
      <div className="container">

        <motion.div
          variants={fadeUp()}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center max-w-[1250px] mx-auto mb-16"
        >
          <p className="t-label mb-4">Deep Dive</p>
          <h2 className="t-heading mb-4">
            Features that go{" "}
            <span className="grad-text">beyond the surface</span>
          </h2>
          <div className="h-2"/>
          <p className="t-body">
            Here's what makes PulseIQ different from a simple search engine.
          </p>
        </motion.div>
        <div className="h-4"/>
        <motion.div
          className="flex flex-col gap-12"
          variants={stagger(0.12)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {deepDives.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp()}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center
                          ${item.align === "right" ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              {/* Text side */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${item.bg} border ${item.border}
                                   rounded-xl flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="t-label">{item.tag}</span>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="t-heading" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}>
                    {item.title}
                  </h3>
                  <p className="t-body-lg" style={{ fontSize: "1rem" }}>
                    {item.description}
                  </p>
                </div>

                <ul className="flex flex-col gap-3">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="t-body text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual side */}
              <div className="card p-8 flex items-center justify-center min-h-[240px]"
                   style={{ background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)" }}>
                <div className="text-center">
                  <div className={`w-16 h-16 ${item.bg} border ${item.border}
                                   rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                  </div>
                  <p className="t-subheading mb-2">{item.tag}</p>
                  <p className="t-small">Available in PulseIQ</p>
                </div>
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}