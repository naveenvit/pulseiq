"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { fadeUp, stagger } from "@/lib/motion"
import { ShieldCheck, AlertTriangle, UserCheck, FileCheck } from "lucide-react"

const safetyPillars = [
  {
    icon: ShieldCheck,
    title: "Never Diagnoses",
    description:
      "PulseIQ is an educational tool. It explains and informs — it never claims to diagnose a condition or replace a doctor's opinion.",
  },
  {
    icon: AlertTriangle,
    title: "Emergency Escalation",
    description:
      "When symptoms suggest a medical emergency, PulseIQ stops the conversation and directs you to emergency services immediately.",
  },
  {
    icon: UserCheck,
    title: "Always Recommends Professionals",
    description:
      "Every significant health topic ends with a recommendation to consult a qualified healthcare provider for personal medical decisions.",
  },
  {
    icon: FileCheck,
    title: "Transparent Disclaimers",
    description:
      "PulseIQ clearly communicates what it is and what it is not — an AI assistant, not a doctor. Disclaimers are always visible.",
  },
]

export default function FeaturesSafety() {
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
          <p className="t-label mb-4">Safety Framework</p>
          <h2 className="t-heading mb-4">
            Built with safety{" "}
            <span className="grad-text">at every layer</span>
          </h2>
        <div className="h-2"/>
          <p className="t-body">
            PulseIQ is designed to help — never to mislead. Our safety
            framework ensures every interaction is responsible and honest.
          </p>
        </motion.div>
        <div className="h-5"/>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[860px] mx-auto translate-x-30"
          variants={stagger(0.08)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {safetyPillars.map((pillar) => (
            <motion.div
              key={pillar.title}
              variants={fadeUp()}
              className="card px-8 py-7 min-h-[180px] flex flex-col gap-5"
            >
            <div className="translate-x-5 translate-y-4">
              <div className="w-10 h-10 bg-green-50 border border-green-100 
                              rounded-xl flex items-center justify-center flex-shrink-0">
                <pillar.icon className="w-5 h-5 text-green-600" />
              </div>
                <div className="flex flex-col gap-2 pr-8 max-w-[93%]">
                    <h3 className="t-subheading">{pillar.title}</h3>
                    <p className="t-body text-sm leading-7 break-words">
                    {pillar.description}
                    </p>
              </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div className="h-6"/>
        {/* Disclaimer bar */}
        <motion.div
          variants={fadeUp()}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-10 max-w-[1000px] mx-auto translate-x-10"
        >
          <div
            className="rounded-2xl px-6 py-4 text-center"
            style={{
              background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
              border: "1px solid #bfdbfe",
            }}
          >
            <div className="h-2"/>
            <p className="text-sm text-blue-700 leading-relaxed">
              <span className="font-semibold">Disclaimer: </span>
              PulseIQ is an educational platform and does not provide medical
              diagnoses or replace professional medical advice. Always consult a
              qualified healthcare provider for medical concerns.
            </p>
            <div className="h-2"/>
          </div>
        </motion.div>

      </div>
    </section>
  )
}