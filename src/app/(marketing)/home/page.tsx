import HeroSection from "@/components/marketing/HeroSection"
import FeaturesSection from "@/components/marketing/FeaturesSection"
import HowItWorksSection from "@/components/marketing/HowItWorksSection"
import CTASection from "@/components/marketing/CTASection"

export const metadata = {
  title: "PulseIQ — Your AI-Powered Health Companion",
  description:
    "Understand symptoms, analyze reports, and get reliable health guidance through AI.",
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </>
  )
}