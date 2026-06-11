"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { fadeUp } from "@/lib/motion"

export default function FeaturesCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="section" style={{ background: "#f8fafc" }}>
      <div className="container">
        <motion.div
          variants={fadeUp()}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-[1250px] mx-auto text-center"
        >
          <h2 className="t-heading mb-5">
            Ready to try{" "}
            <span className="grad-text">PulseIQ?</span>
          </h2>
          <div className="h-3"/>
          <p className="t-body mb-8">
            Start for free. No credit card required. Ask your first health
            question in under 60 seconds.
          </p>
          <div className="h-3"/>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/about" className="btn btn-secondary btn-lg">
              Learn about us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}