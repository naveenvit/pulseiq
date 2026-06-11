"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import { fadeUp } from "@/lib/motion"

export default function AboutCTA() {
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
          <div className="w-14 h-14 grad-brand rounded-2xl flex items-center
                          justify-center mx-auto mb-7 shadow-md">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>

          <h2 className="t-heading mb-5">
            Experience PulseIQ{" "}
            <span className="grad-text">for yourself</span>
          </h2>
          <div className="h-2"/>
          <p className="t-body mb-8 max-w-[1250px] mx-auto">
            The best way to understand what PulseIQ does is to try it.
            Ask your first health question for free — no signup required
            to explore.
          </p>
          <div className="h-4"/>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Create free account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/features" className="btn btn-secondary btn-lg">
              View all features
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}