"use client"

import { motion } from "framer-motion"
import { fadeUp, stagger } from "@/lib/motion"
import { Sparkles } from "lucide-react"

export default function FeaturesHero() {
  return (
    <section className="relative pt-36 pb-20 bg-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                        bg-gradient-to-b from-blue-50/60 to-transparent blur-3xl" />
      </div>
    <div className="h-30"/>
      <div className="container relative z-10">
        <motion.div
          className="max-w-[1250px] mx-auto text-center"
          variants={stagger(0.08)}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp()}>
            <div className="badge badge-brand mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Everything you need
            </div>
          </motion.div>
            <div className="h-3"/>
          <motion.h1 variants={fadeUp()} className="t-display mb-6">
            Powerful features for
            <br />
            <span className="grad-text">smarter health guidance</span>
          </motion.h1>
        <div className="h-3"/>
          <motion.p variants={fadeUp()} className="t-body-lg max-w-[1100px] mx-auto">
            PulseIQ combines conversational AI, medical knowledge, and
            safety-first design to help you understand your health — clearly
            and confidently.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}