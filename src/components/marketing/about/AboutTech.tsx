"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { fadeUp, stagger } from "@/lib/motion"
import { Cpu, Database, Globe, Lock } from "lucide-react"

const techPillars = [
  {
    icon: Cpu,
    title: "Large Language Models",
    description:
      "PulseIQ is powered by state-of-the-art AI language models capable of understanding nuanced health questions and generating accurate, structured responses.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Database,
    title: "RAG Architecture",
    description:
      "Retrieval-Augmented Generation ensures every answer is grounded in verified medical knowledge — not just model training data. Sources are always traceable.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  {
    icon: Globe,
    title: "Modern Web Stack",
    description:
      "Built with Next.js, TypeScript, and FastAPI — the same technologies used by the world's most reliable SaaS products. Fast, scalable, and maintainable.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
  },
  {
    icon: Lock,
    title: "Privacy by Design",
    description:
      "Your health data is sensitive. PulseIQ is architected with privacy as a core principle — not an afterthought. Data is encrypted, secured, and never sold.",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
  },
]

export default function AboutTech() {
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
          <p className="t-label mb-4">Technology</p>
          <h2 className="t-heading mb-4">
            Serious technology for a{" "}
            <span className="grad-text">serious purpose</span>
          </h2>
          <div className="h-2"/>
          <p className="t-body">
            PulseIQ is built on production-grade infrastructure designed
            for reliability, accuracy, and scale.
          </p>
        </motion.div>
        <div className="h-5"/>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[860px] mx-auto"
          variants={stagger(0.08)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {techPillars.map((t) => (
            <motion.div
              key={t.title}
              variants={fadeUp()}
              className="card px-8 py-7 min-h-[185px] flex flex-col gap-5 translate-x-30"
            >
              <div className="translate-x-4 translate-y-4">
              <div className={`w-11 h-11 ${t.bg} border ${t.border}
                               rounded-xl flex items-center justify-center flex-shrink-0`}>
                <t.icon className={`w-5 h-5 ${t.color}`} />
              </div>
              <div className="flex flex-col gap-2 max-w-[93%]">
                <h3 className="t-subheading">{t.title}</h3>
                <p className="t-body text-sm">{t.description}</p>
              </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div className="h-5"/>
        {/* Tech stack strip */}
        <motion.div
          variants={fadeUp()}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-10 max-w-[860px] mx-auto translate-x-30"
        >
          <div className="card px-8 py-5">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              <div className="h-8"/>
              <p className="t-label text-slate-400 w-full text-center sm:w-auto">
                Built with
              </p>
              {[
                "Next.js", "TypeScript", "FastAPI",
                "Python", "PostgreSQL", "Tailwind CSS",
              ].map((tech) => (
                <span
                  key={tech}
                  className="text-sm font-semibold text-slate-500
                             hover:text-slate-800 transition-colors duration-150"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}