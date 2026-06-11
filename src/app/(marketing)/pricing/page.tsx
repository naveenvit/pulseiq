import PricingHero from "@/components/marketing/pricing/PricingHero"
import PricingCards from "@/components/marketing/pricing/PricingCards"
import PricingFAQ from "@/components/marketing/pricing/PricingFAQ"
import PricingCTA from "@/components/marketing/pricing/PricingCTA"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing — PulseIQ",
  description:
    "Simple, transparent pricing for PulseIQ. Start free, upgrade when you need more.",
}

export default function PricingPage() {
  return (
    <>
      <PricingHero />
      <PricingCards />
      <PricingFAQ />
      <PricingCTA />
    </>
  )
}