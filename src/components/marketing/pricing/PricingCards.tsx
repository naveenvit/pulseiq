"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import Link from "next/link"
import { fadeUp, stagger } from "@/lib/motion"
import { Check, ArrowRight, Zap } from "lucide-react"

const plans = [
  {
    name: "Free",
    tagline: "Perfect to get started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description:
      "Everything you need to explore PulseIQ and get reliable health guidance at no cost.",
    cta: "Get started free",
    ctaHref: "/signup",
    highlighted: false,
    features: [
      "20 AI health questions per day",
      "Symptom guidance",
      "Medicine information",
      "Emergency detection",
      "Basic health knowledge base",
      "7-day conversation history",
    ],
    missing: [
      "Medical report analysis",
      "Unlimited questions",
      "Full conversation history",
      "Priority response speed",
    ],
  },
  {
    name: "Pro",
    tagline: "For serious health management",
    monthlyPrice: 149,
    yearlyPrice: 99,
    description:
      "Unlimited access to all PulseIQ features including report analysis and full history.",
    cta: "Start Pro free trial",
    ctaHref: "/signup?plan=pro",
    highlighted: true,
    badge: "Most Popular",
    features: [
      "Unlimited AI health questions",
      "Medical report analysis (PDF)",
      "Blood & lab report interpretation",
      "Full conversation history",
      "Priority AI response speed",
      "Advanced health knowledge base",
      "Emergency detection & escalation",
      "Personalized health summaries",
    ],
    missing: [],
  },
  {
    name: "Family",
    tagline: "For households & caregivers",
    monthlyPrice: 249,
    yearlyPrice: 199,
    description:
      "Everything in Pro, shared across up to 5 family members under one account.",
    cta: "Start Family plan",
    ctaHref: "/signup?plan=family",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Up to 5 family profiles",
      "Separate history per member",
      "Caregiver access controls",
      "Family health dashboard",
      "Priority support",
    ],
    missing: [],
  },
]

export default function PricingCards() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const [yearly, setYearly] = useState(false)

  return (
    <section ref={ref} className="section bg-white">
      <div className="container">
        
        {/* Billing toggle */}
        <motion.div
          variants={fadeUp()}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex items-center justify-center gap-4 mb-12"
        >
            <div className="h-15"/>
          <span className={`text-sm font-medium transition-colors duration-150
                            ₹{!yearly ? "text-slate-900" : "text-slate-400"}`}>
            Monthly
          </span>

          <button
            onClick={() => setYearly(!yearly)}
            className="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
            style={{ background: yearly ? "#2563eb" : "#e2e8f0" }}
            aria-label="Toggle billing period"
          >
            <span
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm
                         transition-transform duration-200"
              style={{ left: yearly ? "calc(100% - 20px)" : "4px" }}
            />
          </button>

          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium transition-colors duration-150
                              ₹{yearly ? "text-slate-900" : "text-slate-400"}`}>
              Yearly
            </span>
            <span className="text-[0.6875rem] font-bold px-2 py-0.5 rounded-full
                             bg-green-50 text-green-700 border border-green-100">
              Save 25%
            </span>
          </div>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1000px] mx-auto translate-x-13 min-h-[550px]"
          variants={stagger(0.08)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp()}
              className="relative flex flex-col"
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5
                                   grad-brand text-white text-[0.6875rem] font-bold
                                   rounded-full shadow-md whitespace-nowrap">
                    <Zap className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}
                
              <div
                className="flex flex-col h-full rounded-2xl overflow-hidden"
                style={{
                  border: plan.highlighted
                    ? "2px solid #2563eb"
                    : "1px solid #e8ecf0",
                  boxShadow: plan.highlighted
                    ? "0 8px 32px rgba(37,99,235,0.14), 0 2px 8px rgba(37,99,235,0.08)"
                    : "0 2px 8px rgba(0,0,0,0.04)",
                  background: plan.highlighted
                    ? "linear-gradient(180deg, #fafbff 0%, #ffffff 100%)"
                    : "#ffffff",
                }}
              >
                <div className="translate-x-3 translate-y-3">
                {/* Plan header */}
                <div className="px-7 pt-8 pb-6"
                     style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <p className="text-[0.8125rem] font-semibold text-slate-500 mb-1">
                    {plan.name}
                  </p>
                  <p className="text-xs text-slate-400 mb-5">{plan.tagline}</p>

                  {/* Price */}
                  <div className="flex items-end gap-1.5 mb-4">
                    <span className="text-[2.5rem] font-bold text-slate-900
                                     tracking-tight leading-none">
                      ₹{yearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-sm text-slate-400 mb-1.5">
                        / mo{yearly ? ", billed yearly" : ""}
                      </span>
                    )}
                    {plan.monthlyPrice === 0 && (
                      <span className="text-sm text-slate-400 mb-1.5">forever</span>
                    )}
                  </div>

                  <p className="text-sm text-slate-500 leading-relaxed">
                    {plan.description}
                  </p>
                </div>
                    <div className="h-3"/>
                {/* Features */}
                <div className="px-7 py-6 flex-1 flex flex-col gap-6">
                  <ul className="flex flex-col gap-3 translate-x-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 leading-snug">{f}</span>
                      </li>
                    ))}
                    {plan.missing.map((f) => (
                      <li key={f} className="flex items-start gap-3 opacity-35">
                        <span className="w-4 h-4 flex-shrink-0 mt-0.5 flex items-center justify-center">
                          <span className="w-3 h-px bg-slate-400 block" />
                        </span>
                        <span className="text-sm text-slate-400 leading-snug line-through">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-2 translate-x-2.5 pr-6">
                    <Link
                      href={plan.ctaHref}
                      className={`w-[85%] max-w-full flex items-center justify-center gap-2
                                  text-sm font-semibold py-3 rounded-xl
                                  transition-all duration-200 group
                                  ${plan.highlighted
                                    ? "btn btn-primary"
                                    : "btn btn-secondary"
                                  }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5
                                             transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
                </div>                         
              </div>
            </motion.div>
          ))}
        </motion.div>
          <div className="h-3"/>
        {/* Fine print */}
        <motion.p
          variants={fadeUp()}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center t-small mt-8"
        >
          All plans include a 7-day free trial of Pro features. No credit card required to start.
        </motion.p>

      </div>
    </section>
  )
}