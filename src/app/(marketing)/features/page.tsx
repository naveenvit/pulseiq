import FeaturesHero from "@/components/marketing/features/FeaturesHero"
import FeaturesGrid from "@/components/marketing/features/FeaturesGrid"
import FeaturesDeepDive from "@/components/marketing/features/FeaturesDeepDive"
import FeaturesSafety from "@/components/marketing/features/FeaturesSafety"
import FeaturesCTA from "@/components/marketing/features/FeaturesCTA"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Features — PulseIQ",
  description:
    "Explore PulseIQ's AI-powered features: symptom guidance, report analysis, medicine information, emergency detection, and more.",
}

export default function FeaturesPage() {
  return (
    <>
      <FeaturesHero/>
      <FeaturesGrid/>
      <FeaturesDeepDive/>
      <FeaturesSafety/>
      <FeaturesCTA/>
    </>
  )
}