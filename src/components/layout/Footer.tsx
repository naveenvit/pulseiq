import Link from "next/link"
import { Activity } from "lucide-react"
import { APP_NAME, DISCLAIMER } from "@/lib/constants"

const footerLinks = {
  Product: [
    { label: "Features",  href: "/features" },
    { label: "Pricing",   href: "/pricing" },
    { label: "About",     href: "/about" },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Disclaimer",       href: "/disclaimer" },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-100"
            style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" }}>
      <div className="container py-14">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-8 h-8 grad-brand rounded-lg flex items-center
                              justify-center shadow-sm group-hover:shadow-md
                              group-hover:scale-105 transition-all duration-200">
                <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[1.0625rem] font-bold tracking-tight text-slate-900">
                {APP_NAME}
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[280px]">
              {DISCLAIMER}
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="md:col-span-3 md:col-start-auto">
              <p className="text-[0.6875rem] font-bold text-slate-700 uppercase
                            tracking-[0.10em] mb-5">
                {group}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-900
                                 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom */}
        <div className="pt-7 border-t border-slate-200/80 flex flex-col sm:flex-row
                        items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-slate-400">
            Not a substitute for professional medical advice.
          </p>
        </div>

      </div>
    </footer>
  )
}