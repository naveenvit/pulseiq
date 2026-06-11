"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { fadeUp, stagger } from "@/lib/motion"
import { Target, Eye, Lightbulb } from "lucide-react"

const pillars = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To make high-quality health guidance accessible to every person — students, families, elderly individuals, and rural communities — through the power of AI.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "A world where no one makes a health decision without understanding it. Where medical knowledge is not locked behind expensive consultations or complex terminology.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: Lightbulb,
    title: "Our Approach",
    description:
      "We combine the reasoning power of large language models with trusted medical knowledge and a safety-first design philosophy — so guidance is always reliable and responsible.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
]

export default function AboutMission() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="section" style={{ background: "#f8fafc" }}>
      <div className="container">

        <motion.div
          variants={fadeUp()}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-[1250px] mx-auto text-center mb-14"
        >
          <p className="t-label mb-4">Why We Exist</p>
          <h2 className="t-heading mb-4">
            A problem worth{" "}
            <span className="grad-text">solving</span>
          </h2>
          <div className="h-2"/>
          <p className="t-body">
            Millions of people search for health information daily and
            find confusing, contradictory, or outright dangerous content.
            PulseIQ exists to change that.
          </p>
        </motion.div>
        <div className="h-5"/>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={stagger(0.09)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {pillars.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUp()}
              className="card px-8 py-7 min-h-[225px] flex flex-col gap-5"
            >
              <div className="translate-x-4 translate-y-4">
              <div className={`w-11 h-11 ${p.bg} border ${p.border}
                               rounded-xl flex items-center justify-center`}>
                <p.icon className={`w-5 h-5 ${p.color}`} />
              </div>
              <div className="h-2"/>
              <div className="flex flex-col gap-3 pr-8 max-w-[93%]">
                <h3 className="t-subheading">{p.title}</h3>
                <p className="t-body text-sm">{p.description}</p>
              </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}