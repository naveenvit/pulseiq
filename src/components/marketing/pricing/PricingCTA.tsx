"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"
import { fadeUp } from "@/lib/motion"

export default function PricingCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="section bg-white">
      <div className="container">
        <motion.div
          variants={fadeUp()}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-[1250px] mx-auto text-center"
        >
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl
                          flex items-center justify-center mx-auto mb-7">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>

          <h2 className="t-heading mb-5">
            Still have{" "}
            <span className="grad-text">questions?</span>
          </h2>
            <div className="h-1"/>
          <p className="t-body mb-8 max-w-[1250px] mx-auto">
            Try PulseIQ free for 7 days with full Pro access.
            No credit card. No commitment. Cancel anytime.
          </p>
            <div className="h-3"/>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/features" className="btn btn-secondary btn-lg">
              Explore features
            </Link>
          </div>
            <div className="h-2"/>
          <p className="t-small mt-6">
            Questions? Reach us at{" "}
            <a href="mailto:hello@pulseiq.ai"
               className="text-blue-600 hover:underline font-medium">
              hello@pulseiq.ai
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}