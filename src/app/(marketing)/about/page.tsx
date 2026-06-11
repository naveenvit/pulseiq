import AboutHero from "@/components/marketing/about/AboutHero"
import AboutMission from "@/components/marketing/about/AboutMission"
import AboutValues from "@/components/marketing/about/AboutValues"
import AboutTech from "@/components/marketing/about/AboutTech"
import AboutCTA from "@/components/marketing/about/AboutCTA"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About — PulseIQ",
  description:
    "Learn about PulseIQ, our mission to make healthcare guidance accessible to everyone, and the technology behind our AI health assistant.",
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutMission />
      <AboutValues />
      <AboutTech />
      <AboutCTA />
    </>
  )
}