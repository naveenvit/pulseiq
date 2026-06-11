import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     "/",
        disallow:  ["/dashboard", "/chat", "/reports", "/history", "/settings", "/emergency"],
      },
    ],
    sitemap: "https://pulseiq.ai/sitemap.xml",
  }
}