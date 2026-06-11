import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://pulseiq.ai"

  return [
    { url: base,                  lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/features`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/pricing`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/login`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.5 },
    { url: `${base}/signup`,      lastModified: new Date(), changeFrequency: "yearly",  priority: 0.6 },
  ]
}