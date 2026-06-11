"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import { fadeUp, stagger } from "@/lib/motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    q: "Is PulseIQ really free to use?",
    a: "Yes. The Free plan gives you 20 AI health questions per day with no credit card required. You can explore PulseIQ fully before deciding whether to upgrade.",
  },
  {
    q: "What does the Pro plan include that Free doesn't?",
    a: "Pro adds unlimited questions, medical report analysis (PDF uploads), full conversation history, and priority response speed. It's designed for users who want comprehensive health guidance.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Absolutely. You can cancel your Pro or Family subscription at any time from your account settings. Your plan continues until the end of the billing period, then reverts to Free.",
  },
  {
    q: "Is my health data private and secure?",
    a: "Yes. Your health data is encrypted in transit and at rest. We never sell your data to third parties. You can delete your account and all associated data at any time.",
  },
  {
    q: "Does PulseIQ replace my doctor?",
    a: "No — and it never will. PulseIQ is an educational and guidance platform. It helps you understand health information but always recommends consulting a qualified healthcare provider for personal medical decisions.",
  },
  {
    q: "What types of medical reports can PulseIQ analyze?",
    a: "PulseIQ can analyze blood panels, complete blood counts (CBC), lipid profiles, metabolic panels, and most standard lab reports in PDF format. More report types are being added regularly.",
  },
  {
    q: "How does the Family plan work?",
    a: "The Family plan gives you up to 5 separate user profiles under one account. Each member has their own conversation history and health data. The account holder can manage access for all members.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Yes. All plans include a 7-day free trial of Pro features so you can experience the full product before committing.",
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="card overflow-hidden cursor-pointer min-h-[23px]"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between gap-4 px-6 py-5 ">
        <p className="text-[0.9375rem] font-semibold text-slate-800 leading-snug
                       tracking-tight translate-x-3">
          {q}
        </p>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform
                       duration-200 ${open ? "rotate-180" : ""}`}
        />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-6 pb-5 pt-0 translate-x-3">
              <div style={{ height: 1, background: "#f1f5f9", marginBottom: 16 }} />
              <p className="t-body text-sm">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PricingFAQ() {
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
          <p className="t-label mb-4">FAQ</p>
          <h2 className="t-heading mb-4">
            Questions &{" "}
            <span className="grad-text">answers</span>
          </h2>
          <div className="h-2"/>
          <p className="t-body">
            Everything you need to know about PulseIQ pricing and plans.
          </p>
        </motion.div>
        <div className="h-4"/>
        <motion.div
          className="max-w-[720px] mx-auto flex flex-col gap-3 translate-x-48"
          variants={stagger(0.05)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {faqs.map((faq) => (
            <motion.div key={faq.q} variants={fadeUp()}>
              <FAQItem q={faq.q} a={faq.a} />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}