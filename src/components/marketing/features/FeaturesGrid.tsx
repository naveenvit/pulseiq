"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  MessageCircle, FileText, AlertTriangle,
  Pill, BookOpen, Activity, Brain,
  ShieldCheck, Clock,
} from "lucide-react"
import { fadeUp, stagger } from "@/lib/motion"

const features = [
  {
    icon: MessageCircle,
    title: "AI Health Chat",
    description:
      "Have natural, multi-turn conversations about any health topic. PulseIQ understands context, remembers follow-up questions, and gives clear, structured answers.",
    tag: "Core",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Activity,
    title: "Symptom Guidance",
    description:
      "Describe what you're feeling in plain language. PulseIQ explains possible causes, flags concerning patterns, and tells you when to seek professional care.",
    tag: "Core",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
  },
  {
    icon: FileText,
    title: "Medical Report Analysis",
    description:
      "Upload blood reports, lab results, or health summaries as PDFs. PulseIQ reads them, highlights abnormal values, and explains what they mean in simple terms.",
    tag: "Core",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: Pill,
    title: "Medicine Information",
    description:
      "Ask about any medication — what it's used for, common side effects, interactions, precautions, and general safety guidelines.",
    tag: "Core",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: AlertTriangle,
    title: "Emergency Detection",
    description:
      "PulseIQ automatically detects high-risk symptoms — chest pain, stroke signs, severe allergic reactions — and immediately escalates with clear emergency guidance.",
    tag: "Safety",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
  {
    icon: BookOpen,
    title: "Health Knowledge Base",
    description:
      "Every answer is grounded in trusted medical sources — WHO guidelines, peer-reviewed content, and curated healthcare resources via RAG architecture.",
    tag: "Knowledge",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    icon: Brain,
    title: "Context Memory",
    description:
      "PulseIQ remembers your conversation history within a session so you never need to repeat yourself. Follow-up questions feel natural and connected.",
    tag: "AI",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  {
    icon: ShieldCheck,
    title: "Safety-First Design",
    description:
      "Every response includes appropriate disclaimers. PulseIQ never diagnoses diseases or prescribes medication — it educates and guides, always responsibly.",
    tag: "Safety",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
  },
  {
    icon: Clock,
    title: "Health History",
    description:
      "All your past conversations and uploaded reports are saved securely so you can review your health journey at any time.",
    tag: "Dashboard",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
]

const tagColors: Record<string, string> = {
  Core:      "bg-blue-50 text-blue-700 border-blue-100",
  Safety:    "bg-rose-50 text-rose-700 border-rose-100",
  Knowledge: "bg-amber-50 text-amber-700 border-amber-100",
  AI:        "bg-indigo-50 text-indigo-700 border-indigo-100",
  Dashboard: "bg-slate-100 text-slate-600 border-slate-200",
}

export default function FeaturesGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="section bg-white">
      <div className="container">

        <motion.div
          variants={fadeUp()}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center max-w-[1250px] mx-auto mb-14"
        >
          <p className="t-label mb-4">All Features</p>
          <h2 className="t-heading mb-4">
            Built for real{" "}
            <span className="grad-text">health needs</span>
          </h2>
          <div className="h-1"/>
          <p className="t-body">
            Every feature is designed with safety, clarity, and
            accessibility in mind.
          </p>
        </motion.div>
        <div className="h-4"/>
            <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger(0.06)}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            >
            {features.map((f) => (
                <motion.div
                    key={f.title}
                    variants={fadeUp()}
                    className="card px-8 py-7 min-h-[210px] flex flex-col gap-5"
                >
                <div className="translate-x-4 translate-y-4">
                    <div className="flex items-start justify-between gap-3 px-2 pt-2">
                        <div className={`w-10 h-10 ${f.bg} border ${f.border}
                                    rounded-xl flex items-center justify-center
                                    group-hover:scale-105 transition-transform duration-200 flex-shrink-0`}>
                        <f.icon className={`w-[18px] h-[18px] ${f.color}`} />
                    </div>

                        <span className={`text-[0.6875rem] font-semibold px-2.5 py-1
                                            rounded-full border ${tagColors[f.tag]}
                                            -translate-x-6`}>
                            {f.tag}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3 max-w-[93%]">
                        <h3 className="t-subheading">{f.title}</h3>
                        <p className="t-body text-sm leading-7">{f.description}</p>
                    </div>
                </div>
                </motion.div>
            ))}
            </motion.div>
        </div>
    </section>
  )
}