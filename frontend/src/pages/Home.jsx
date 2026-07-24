import React from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, FileText, Pill, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Capital Hospital</h1>
        <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
          Book appointments, manage records, and access care — all in one place.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="bg-white text-brand-700 px-6 py-3 rounded-lg font-semibold hover:bg-brand-50 transition">
            Get Started
          </Link>
          <Link to="/login" className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
            Sign In
          </Link>
        </div>
      </section>

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
    </div>
  )
}
