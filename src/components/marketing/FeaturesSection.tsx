"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import {
  MessageCircle, FileText, AlertTriangle,
  Pill, BookOpen, Activity,
} from "lucide-react"
import { fadeUp, stagger } from "@/lib/motion"

const features = [
  {
    icon: MessageCircle,
    title: "AI Health Chat",
    description: "Natural conversations about your health. Ask anything, get clear and reliable answers instantly.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100/80",
  },
  {
    icon: Activity,
    title: "Symptom Guidance",
    description: "Describe symptoms and understand possible explanations with automatic red flag detection.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100/80",
  },
  {
    icon: FileText,
    title: "Report Analysis",
    description: "Upload blood work or lab results and get plain-language breakdowns of what they mean.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100/80",
  },
  {
    icon: Pill,
    title: "Medicine Information",
    description: "Understand medications, side effects, interactions, and general safety information.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100/80",
  },
  {
    icon: AlertTriangle,
    title: "Emergency Detection",
    description: "Automatic identification of emergency symptoms with immediate guidance and escalation.",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100/80",
  },
  {
    icon: BookOpen,
    title: "Health Knowledge",
    description: "WHO guidelines and trusted medical resources through our RAG-powered knowledge system.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100/80",
  },
]

export default function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="section bg-white">
      <div className="container">

        {/* Header */}
        <motion.div
          variants={fadeUp()}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-[1250px] mx-auto text-center mb-14"
        >
          <p className="t-label mb-4">Features</p>
          <h2 className="t-heading mb-5">
            Everything you need to{" "}
            <span className="grad-text">understand your health</span>
          </h2>
          <div className="h-3"/>
          <p className="t-body">
            PulseIQ combines advanced AI with trusted medical knowledge to give
            you clear, safe, and reliable health guidance.
          </p>
        </motion.div>
        <div className="h-6"/>

        {/* Grid */}
        <div className="pl-6">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 translate-x-10"
            variants={stagger(0.06)}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp()}
                className="card min-h-[150px] p-6 pt-10 group cursor-default flex flex-col gap-5"
              >
                <div className="relative left-4 top-2">
                  {/* Icon */}
                  <div className={`
                    self-start w-10 h-10 ${f.bg} border ${f.border}
                    rounded-xl flex items-center justify-center
                    group-hover:scale-105 transition-transform duration-200
                  `}>
                    <f.icon className={`w-[18px] h-[18px] ${f.color}`} />
                  </div>
              

                {/* Text */}
                  <div className="flex flex-col gap-3">
                    <h3 className="t-subheading">{f.title}</h3>
                    <p className="t-body text-sm leading-7">{f.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}