"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { ArrowRight, Shield, Zap, Users } from "lucide-react"
import { transition } from "@/lib/motion"

const pills = [
  { icon: Shield, label: "Free to start" },
  { icon: Zap,    label: "Instant answers" },
]

export default function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="section bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={transition.slow}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(150deg, #1e3a8a 0%, #1d4ed8 55%, #0369a1 100%)",
          }}
        >
          {/* Dot texture */}
          <div
            className="absolute inset-0 opacity-[0.045] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Glows */}
          <div className="absolute -top-32 -right-32 w-72 h-72
                          bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96
                          bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center
                px-8 py-24 sm:px-16 sm:py-28 text-center">
            <div className="h-3"/>
            {/* Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {pills.map(({ icon: Icon, label }) => (
                <span key={label}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5
                                 bg-white/10 border border-white/15
                                 text-white/80 text-xs font-medium rounded-full">
                  <Icon className="w-3 h-3 flex-shrink-0" />
                  {label}
                </span>
              ))}
            </div>

            {/* Heading */}
            <h2
              className="text-white font-bold mx-auto mb-6"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                maxWidth: "700px",
              }}
            >
              Take control of your
              <br />health today
            </h2>
            <div className="h-3"/>
            {/* Body */}
            <p className="text-blue-100/90 mx-auto mb-10"
               style={{ fontSize: "1.125rem", lineHeight: 1.8, maxWidth: "700px" }}>
              Join thousands who trust PulseIQ for clear, safe, and
              reliable health guidance every day.
            </p>
            <div className="h-3"/>
            {/* CTA button */}
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-3
                        bg-white text-blue-700
                        text-[0.9375rem] font-bold
                        px-10 py-4 rounded-2xl
                        min-w-[180px]
                        shadow-xl hover:bg-blue-50
                        shadow-2xl hover:-translate-y-0.5
                        transition-all duration-200 group"
            >
              Get started for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
            <div className="h-3"/>
            <p
              className="text-blue-200/50 text-sm max-w-[700px] mx-auto"
            >
              Not a substitute for professional medical advice.
              Always consult a qualified healthcare provider.
            </p>
            <div className="h-3"/>
          </div>
        </motion.div>
      </div>
    </section>
  )
}