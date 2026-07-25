import React from 'react'
import KonarkWheel from './KonarkWheel'

const USEFUL_LINKS = [
  { label: 'About Us', href: 'https://pgimerch.odisha.gov.in/about-the-college-hospital/' },
  { label: 'Objective', href: 'https://pgimerch.odisha.gov.in/objective/' },
  { label: 'Vision & Mission', href: 'https://pgimerch.odisha.gov.in/vision-mission/' },
  { label: 'Alumni', href: 'https://pgimerch.odisha.gov.in/alumni/' },
  { label: 'Photo Gallery', href: 'https://pgimerch.odisha.gov.in/photo-gallery/' },
  { label: 'Organogram', href: 'https://pgimerch.odisha.gov.in/organogram/' },
  { label: "Who's Who", href: 'https://pgimerch.odisha.gov.in/whos-who/' },
  { label: 'Latest Events', href: 'https://pgimerch.odisha.gov.in/latest-events/' },
  { label: 'Sitemap', href: 'https://pgimerch.odisha.gov.in/site-map/' },
  { label: 'Examination', href: 'https://pgimerch.odisha.gov.in/examinations/' },
]

const IMPORTANT_LINKS = [
  { label: 'Terms & Condition', href: 'https://pgimerch.odisha.gov.in/terms-condition/' },
  { label: 'Feedback', href: 'https://pgimerch.odisha.gov.in/feedback/' },
  { label: 'Website Policy', href: 'https://pgimerch.odisha.gov.in/website-policy/' },
  { label: 'Help', href: 'https://pgimerch.odisha.gov.in/contact-us/' },
  { label: 'Disclaimer', href: 'https://pgimerch.odisha.gov.in/disclaimer/' },
]

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-white/80 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <KonarkWheel size={28} className="text-gold-400" />
            <span className="text-white font-semibold">Capital Hospital, Bhubaneswar</span>
          </div>
          <p className="text-white/60">
            Postgraduate Institute of Medical Education & Research and Capital Hospital, Bhubaneswar, Government of Odisha
          </p>
          <p className="mt-3">📞 0674-2391983</p>
          <p>✉️ pgimerch [at] gmail [dot] com</p>
          <p className="mt-2 text-white/60">Working Days: Monday – Sunday, 9:00 AM – 5:00 PM</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Useful Links</h4>
          <ul className="space-y-1.5">
            {USEFUL_LINKS.slice(0, 5).map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 opacity-0 md:opacity-100">&nbsp;</h4>
          <ul className="space-y-1.5">
            {USEFUL_LINKS.slice(5).map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Important Links</h4>
          <ul className="space-y-1.5">
            {IMPORTANT_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-xs text-white/50 px-6">
        Copyright © {new Date().getFullYear()}{' '}
        <a href="https://pgimerch.odisha.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400">
          Postgraduate Institute of Medical Education & Research and Capital Hospital, Bhubaneswar, Government of Odisha
        </a>
        . All rights reserved.
      </div>
    </footer>
  )
}
