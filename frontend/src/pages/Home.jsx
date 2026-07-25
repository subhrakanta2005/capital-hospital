import React from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, FileText, Pill, ShieldCheck, Landmark } from 'lucide-react'
import KonarkWheel from '../components/KonarkWheel'
import CulturalBorder from '../components/CulturalBorder'

export default function Home() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-900 text-white py-20 px-6 text-center overflow-hidden">
        <KonarkWheel size={260} className="absolute -left-16 -top-16 text-white/5" />
        <KonarkWheel size={260} className="absolute -right-16 -bottom-16 text-white/5" />
        <div className="relative">
          <p className="text-gold-400 text-xs tracking-[0.2em] mb-3">GOVERNMENT OF ODISHA</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Capital Hospital, Bhubaneswar</h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto mb-2">Unit-6 — Serving the temple city and beyond since the pre-independence era.</p>
          <p className="text-sm opacity-70 max-w-xl mx-auto mb-8">Book appointments, manage records, and access care — all in one place.</p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-gold-500 text-brand-900 px-6 py-3 rounded-lg font-semibold hover:bg-gold-400 transition">
              Get Started
            </Link>
            <Link to="/login" className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              Sign In
            </Link>
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 justify-center mb-6">
            <Landmark className="text-brand-700" size={22} />
            <h2 className="text-2xl font-bold text-brand-900">Our Heritage</h2>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-4 text-gray-700 leading-relaxed">
            <p>
              Capital Hospital traces its roots back to the pre-independence era, growing out of the
              erstwhile Odisha Medical College, which began with a small intake of students in 1944.
              In its earliest days, the institution served pilgrims travelling from across the country
              for darshan of the presiding deities of the state during the Maratha period — a role that
              placed care for the traveller and the devotee at the heart of its founding purpose.
            </p>
            <p>
              Today, as Unit-6 of PGIMER and Capital Hospital, it remains one of the largest peripheral
              hospitals in Odisha, serving over a million people across Bhubaneswar, Khurda, Nayagarh,
              Puri, and the surrounding districts with round-the-clock specialist care.
            </p>
            <p className="text-sm text-gray-400">
              Source: Government of Odisha — PGIMER and Capital Hospital (pgimerch.odisha.gov.in)
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
