import React from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, FileText, Pill, ShieldCheck, ArrowRight } from 'lucide-react'
import KonarkWheel from '../components/KonarkWheel'
import CulturalBorder from '../components/CulturalBorder'

const QUICK_LINKS = [
  { label: 'Committee', href: 'https://pgimerch.odisha.gov.in/committee/' },
  { label: 'Research & Publications', href: 'https://pgimerch.odisha.gov.in/research-publications/' },
  { label: 'Examinations', href: 'https://pgimerch.odisha.gov.in/examinations/' },
  { label: 'Registration', href: 'https://pgimerch.odisha.gov.in/registration/' },
  { label: 'Student', href: 'https://pgimerch.odisha.gov.in/student/' },
  { label: 'Alumni', href: 'https://pgimerch.odisha.gov.in/alumni/' },
]

export default function Home() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-900 text-white py-20 px-6 text-center overflow-hidden">
        <KonarkWheel size={260} className="absolute -left-16 -top-16 text-white/5" />
        <KonarkWheel size={260} className="absolute -right-16 -bottom-16 text-white/5" />
        <div className="relative">
          <p className="text-gold-400 text-xs tracking-[0.2em] mb-3">GOVERNMENT OF ODISHA</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to PGIMER & CH, Bhubaneswar</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-2">
            A flagship hospital of the Government of Odisha. What began in 1954 as a 60-bed
            facility on 20 acres has grown into a 547 + 213-bed institution at the heart of the
            temple city, Bhubaneswar.
          </p>
          <p className="text-sm opacity-70 max-w-xl mx-auto mb-8">
            Book appointments, manage records, and access care — all in one place.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/register" className="bg-gold-500 text-brand-900 px-6 py-3 rounded-lg font-semibold hover:bg-gold-400 transition">
              Get Started
            </Link>
            <Link to="/login" className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              Sign In
            </Link>
            <a href="https://pgimerch.odisha.gov.in/about-the-college-hospital/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-6 py-3 text-gold-400 hover:text-gold-300 transition">
              Read More <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
      <CulturalBorder className="w-full h-3 text-gold-500 bg-brand-900" />

      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-6">
        {[
          { icon: CalendarCheck, title: 'Book Appointments', desc: 'Find a doctor and book a slot in seconds.' },
          { icon: FileText, title: 'Medical Records', desc: 'Access lab reports and prescriptions anytime.' },
          { icon: Pill, title: 'Pharmacy', desc: 'Track medicine stock and dispensing in real time.' },
          { icon: ShieldCheck, title: 'Secure Check-in', desc: 'QR-based check-in for a smooth visit.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <Icon className="mx-auto mb-3 text-brand-600" size={32} />
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-brand-50 py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <p className="text-xs text-brand-600 font-semibold tracking-wide mb-1">DIRECTOR'S MESSAGE</p>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                PGIMER and Capital Hospital was founded in the years before independence, and in the
                decades since has shaped generations of physicians who now serve patients around the
                world. The institution's roots trace to 1944, when the erstwhile Odisha Medical College
                admitted its first batch of 22 students. In its earliest form, it functioned as a
                pilgrim hospital, tending to travellers who came from across the country during the
                Maratha era for darshan of the state's presiding deities — Lord Jagannath, Balabhadra,
                and Subhadra.
              </p>
              <p className="font-semibold text-brand-900">Prof. (Dr) Sujata Misra, M.S. (O&G)</p>
              <a href="https://pgimerch.odisha.gov.in/faculty/dr-sujata-misra/" target="_blank" rel="noopener noreferrer"
                className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1 mt-2">
                Read More <ArrowRight size={14} />
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs text-brand-600 font-semibold tracking-wide mb-1">SUPERINTENDENT'S MESSAGE</p>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                PGIMER and Capital Hospital stands as one of Odisha's proudest institutions — a
                witness to the state's entire modern medical journey. Through many challenges over
                the decades, it has kept delivering quality healthcare, including maternal and child
                care, to people across Odisha.
              </p>
              <p className="font-semibold text-brand-900">Prof. (Dr) Biswajit Sahu, M.S. (Orthopaedics)</p>
              <a href="https://pgimerch.odisha.gov.in/faculty/dr-biswajit-sahu/" target="_blank" rel="noopener noreferrer"
                className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1 mt-2">
                Read More <ArrowRight size={14} />
              </a>
            </div>
          </div>

          <p className="text-sm text-gray-400 text-center">
            The hospital remains the main centre of hope for 10–12 lakh people across Bhubaneswar,
            Khurda, Nayagarh, Puri, and adjoining areas — the largest peripheral hospital in the
            state, with round-the-clock specialist care.
            <br />Source: Government of Odisha — PGIMER and Capital Hospital (pgimerch.odisha.gov.in)
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-xl font-bold text-brand-900 text-center mb-6">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {QUICK_LINKS.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              className="bg-white border border-gray-100 rounded-lg p-4 text-center font-medium text-brand-700 shadow-sm hover:shadow-md hover:border-brand-200 transition">
              {l.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
