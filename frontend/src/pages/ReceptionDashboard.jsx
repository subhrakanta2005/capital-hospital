import React, { useEffect, useState } from 'react'
import api from '../api/client'

export default function ReceptionDashboard() {
  const [qrInput, setQrInput] = useState('')
  const [checkinResult, setCheckinResult] = useState(null)
  const [checkinError, setCheckinError] = useState('')
  const [patients, setPatients] = useState([])
  const [visitorLogs, setVisitorLogs] = useState([])
  const [visitorName, setVisitorName] = useState('')
  const [purpose, setPurpose] = useState('')

  function loadLogs() {
    api.get('/admin/visitor-logs').then((r) => setVisitorLogs(r.data))
  }

  useEffect(() => {
    api.get('/patients').then((r) => setPatients(r.data))
    loadLogs()
  }, [])

  async function handleCheckin() {
    setCheckinError('')
    setCheckinResult(null)
    try {
      const res = await api.post(`/appointments/checkin/${qrInput.trim()}`)
      setCheckinResult(res.data)
      setQrInput('')
    } catch (err) {
      setCheckinError(err.response?.data?.detail || 'Check-in failed')
    }
  }

  async function logVisitor() {
    if (!visitorName || !purpose) return
    await api.post(`/admin/visitor-logs?visitor_name=${encodeURIComponent(visitorName)}&purpose=${encodeURIComponent(purpose)}`)
    setVisitorName('')
    setPurpose('')
    loadLogs()
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Reception Desk</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-3">Patient Check-in</h2>
          <p className="text-sm text-gray-500 mb-3">Enter or scan the patient's appointment QR code value.</p>
          <div className="flex gap-2 mb-3">
            <input value={qrInput} onChange={(e) => setQrInput(e.target.value)} placeholder="QR code value"
              className="flex-1 border rounded-md px-3 py-2" />
            <button onClick={handleCheckin} className="bg-brand-600 text-white px-4 py-2 rounded-md">Check In</button>
          </div>
          {checkinError && <p className="text-red-600 text-sm">{checkinError}</p>}
          {checkinResult && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">
              ✓ {checkinResult.patient_name} checked in for {checkinResult.doctor_name} at {checkinResult.time_slot}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-3">Log Visitor</h2>
          <input value={visitorName} onChange={(e) => setVisitorName(e.target.value)} placeholder="Visitor name"
            className="w-full border rounded-md px-3 py-2 mb-2" />
          <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Purpose of visit"
            className="w-full border rounded-md px-3 py-2 mb-2" />
          <button onClick={logVisitor} className="bg-brand-600 text-white px-4 py-2 rounded-md w-full">Log Visitor</button>
        </div>
      </div>

      <h2 className="font-semibold mt-8 mb-3">Recent Visitor Log</h2>
      <div className="space-y-2">
        {visitorLogs.slice(0, 10).map((v) => (
          <div key={v.id} className="bg-white border border-gray-100 rounded-lg p-3 text-sm shadow-sm">
            <span className="font-medium">{v.visitor_name}</span> — {v.purpose}
            <span className="text-gray-400 ml-2">{new Date(v.logged_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
