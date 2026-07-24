import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import jsPDF from 'jspdf'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [records, setRecords] = useState([])
  const [invoices, setInvoices] = useState([])
  const [tab, setTab] = useState('appointments')

  useEffect(() => {
    api.get('/patients/me/summary').then((r) => setSummary(r.data))
    api.get('/appointments/me').then((r) => setAppointments(r.data))
    api.get('/records/me').then((r) => setRecords(r.data))
    api.get('/billing/invoices/me').then((r) => setInvoices(r.data))
  }, [])

  function downloadPrescriptionPdf(appt) {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Capital Hospital - Prescription', 14, 18)
    doc.setFontSize(11)
    doc.text(`Patient: ${appt.patient_name}`, 14, 30)
    doc.text(`Doctor: ${appt.doctor_name}`, 14, 37)
    doc.text(`Date: ${appt.date}`, 14, 44)
    doc.text(`Diagnosis: ${appt.prescription?.diagnosis || ''}`, 14, 54)
    let y = 64
    ;(appt.prescription?.items || []).forEach((item, i) => {
      doc.text(
        `${i + 1}. ${item.medicine_name} - ${item.dosage}, ${item.frequency}, ${item.duration}`,
        14, y,
      )
      y += 8
    })
    if (appt.prescription?.notes) {
      doc.text(`Notes: ${appt.prescription.notes}`, 14, y + 6)
    }
    doc.save(`prescription-${appt.date}.pdf`)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">Welcome, {user.name}</h1>
      <p className="text-gray-500 mb-6">Here's an overview of your care.</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <SummaryCard label="Upcoming appointments" value={summary?.upcoming_appointments ?? '—'} />
        <SummaryCard label="Unpaid invoices" value={summary?.unpaid_invoices ?? '—'} />
        <SummaryCard label="Medical records" value={summary?.records_count ?? '—'} />
      </div>

      <Link to="/patient/book" className="inline-block bg-brand-600 text-white px-5 py-2.5 rounded-md font-medium mb-8 hover:bg-brand-700 transition">
        + Book New Appointment
      </Link>

      <div className="flex gap-4 border-b mb-6">
        {['appointments', 'records', 'invoices'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-2 px-1 capitalize font-medium ${tab === t ? 'border-b-2 border-brand-600 text-brand-700' : 'text-gray-400'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'appointments' && (
        <div className="space-y-4">
          {appointments.length === 0 && <p className="text-gray-400">No appointments yet.</p>}
          {appointments.map((a) => (
            <div key={a.id} className="bg-white border border-gray-100 rounded-lg p-4 flex justify-between items-center shadow-sm">
              <div>
                <p className="font-semibold">{a.doctor_name} <span className="text-sm text-gray-400">({a.department})</span></p>
                <p className="text-sm text-gray-500">{a.date} at {a.time_slot} — <span className="capitalize">{a.status}</span></p>
                {a.prescription && (
                  <button onClick={() => downloadPrescriptionPdf(a)} className="text-brand-600 text-sm mt-1 hover:underline">
                    Download prescription PDF
                  </button>
                )}
              </div>
              {(a.status === 'booked' || a.status === 'confirmed') && (
                <div className="text-center">
                  <QRCodeSVG value={a.qr_payload} size={64} />
                  <p className="text-xs text-gray-400 mt-1">Check-in QR</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'records' && (
        <div className="space-y-3">
          {records.length === 0 && <p className="text-gray-400">No records yet.</p>}
          {records.map((r) => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <p className="font-semibold capitalize">{r.title} <span className="text-xs text-gray-400">({r.record_type.replace('_', ' ')})</span></p>
              <p className="text-sm text-gray-500">{r.description}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'invoices' && (
        <div className="space-y-3">
          {invoices.length === 0 && <p className="text-gray-400">No invoices yet.</p>}
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-semibold">₹{inv.total.toFixed(2)}</p>
                <p className="text-sm text-gray-500 capitalize">{inv.status} — {new Date(inv.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {inv.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-brand-700">{value}</p>
    </div>
  )
}
