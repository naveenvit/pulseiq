"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { UserPlus, MessageCircle, FileSearch, CheckCircle } from "lucide-react"
import { fadeUp, stagger } from "@/lib/motion"

const steps = [
  {
    icon: UserPlus,
    title: "Create your account",
    description: "Sign up for free in seconds. No credit card required.",
  },
  {
    icon: MessageCircle,
    title: "Ask your question",
    description: "Type your symptoms or health concern in plain language.",
  },
  {
    icon: FileSearch,
    title: "Get AI analysis",
    description: "PulseIQ analyzes your query against trusted medical knowledge.",
  },
  {
    icon: CheckCircle,
    title: "Understand & act",
    description: "Receive clear guidance and know exactly when to see a doctor.",
  },
]

export default function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="section" style={{ background: "#f8fafc" }}>
      <div className="container">

        {/* Header */}
        <motion.div
          variants={fadeUp()}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-[1250px] mx-auto text-center mb-14"
        >
          <p className="t-label mb-4">How it works</p>
          <h2 className="t-heading mb-5">
            Health guidance in{" "}
            <span className="grad-text">4 simple steps</span>
          </h2>
          <div className="h-3"/>
          <p className="t-body">
            Getting reliable health information has never been this fast or easy.
          </p>
        </motion.div>
        <div className="h-5"/>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={stagger(0.09)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {steps.map((step, i) => (
            <motion.div key={step.title} variants={fadeUp()} className="relative">

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute
                                top-[32px] left-[calc(50%+40px)] right-[-12px]
                                h-px z-0"
                     style={{
                       background: "linear-gradient(90deg, #bfdbfe 0%, rgba(191,219,254,0.2) 100%)"
                     }} />
              )}

              <div className="card px-6 py-12 min-h-[170px] text-center relative z-10 h-full
                              flex flex-col items-center justify-center">
                {/* Icon block */}
                <div className="relative mb-5">
                  <div className="w-16 h-16 bg-white border border-slate-200
                                  rounded-2xl flex items-center justify-center
                                  shadow-sm mx-auto">
                    <step.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6
                                   grad-brand rounded-full text-white
                                   text-[11px] font-bold flex items-center
                                   justify-center shadow-md">
                    {i + 1}
                  </span>
                </div>

                <h3 className="text-[0.9375rem] font-semibold text-slate-800
                               tracking-tight mb-2.5 leading-snug">
                  {step.title}
                </h3>
                <p className="text-[0.8125rem] text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}