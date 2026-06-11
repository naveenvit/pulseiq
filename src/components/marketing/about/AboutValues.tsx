"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { fadeUp, stagger } from "@/lib/motion"
import {
  ShieldCheck, Users, BookOpen,
  MessageCircle, Zap, Heart,
} from "lucide-react"

const values = [
  {
    icon: ShieldCheck,
    title: "Safety First",
    description:
      "Every design decision prioritizes user safety. We never sacrifice accuracy for engagement.",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
  },
  {
    icon: Users,
    title: "Accessibility",
    description:
      "Built for everyone — students, elderly users, rural populations, and people with limited medical knowledge.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: BookOpen,
    title: "Trusted Knowledge",
    description:
      "Our AI draws from WHO guidelines, peer-reviewed sources, and curated medical knowledge — not random internet content.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    icon: MessageCircle,
    title: "Clarity",
    description:
      "Medical jargon explained in plain language. If you can't understand it, it doesn't help you.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: Zap,
    title: "Responsiveness",
    description:
      "Fast, always available, and designed to give you what you need when you need it — not after a long wait.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
  },
  {
    icon: Heart,
    title: "Empathy",
    description:
      "Health concerns are personal. PulseIQ is designed to respond with care, patience, and understanding.",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
]

export default function AboutValues() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="section bg-white">
      <div className="container">

        <motion.div
          variants={fadeUp()}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-[1250px] mx-auto text-center mb-14"
        >
          <p className="t-label mb-4">Our Values</p>
          <h2 className="t-heading mb-4">
            Principles that guide{" "}
            <span className="grad-text">everything we build</span>
          </h2>
          <div className="h-2"/>
          <p className="t-body">
            These aren't just words. Every feature, every response, and
            every design decision reflects these values.
          </p>
        </motion.div>
        <div className="h-5"/>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={stagger(0.07)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {values.map((v) => (
            <motion.div
              key={v.title}
              variants={fadeUp()}
              className="card px-8 py-7 min-h-[178px] flex flex-col gap-5"
            >
              <div className="translate-x-4 translate-y-4">
              <div className={`w-10 h-10 ${v.bg} border ${v.border}
                               rounded-xl flex items-center justify-center flex-shrink-0
                               group-hover:scale-105 transition-transform duration-200`}>
                <v.icon className={`w-[18px] h-[18px] ${v.color}`} />
              </div>
              <div className="flex flex-col gap-2 max-w-[93%]">
                <h3 className="t-subheading">{v.title}</h3>
                <p className="t-body text-sm">{v.description}</p>
              </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}