import React, { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [availability, setAvailability] = useState([])
  const [newDate, setNewDate] = useState('')
  const [newSlot, setNewSlot] = useState('')
  const [activeAppt, setActiveAppt] = useState(null)

  function loadAll() {
    api.get('/appointments/me').then((r) => setAppointments(r.data))
    api.get('/doctors/me/profile').then((r) => setAvailability(r.data.availability))
  }

  useEffect(loadAll, [])

  async function addSlot() {
    if (!newDate || !newSlot) return
    const existing = availability.find((a) => a.date === newDate)
    let updated
    if (existing) {
      updated = availability.map((a) =>
        a.date === newDate ? { ...a, time_slots: [...new Set([...a.time_slots, newSlot])].sort() } : a,
      )
    } else {
      updated = [...availability, { date: newDate, time_slots: [newSlot] }]
    }
    await api.put('/doctors/me/availability', { availability: updated })
    setAvailability(updated)
    setNewSlot('')
  }

  async function markStatus(id, status) {
    await api.patch(`/appointments/${id}/status`, { status })
    loadAll()
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">Dr. {user.name}</h1>
      <p className="text-gray-500 mb-8">Manage your schedule and patients.</p>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-3">Your Appointments</h2>
          <div className="space-y-3">
            {appointments.length === 0 && <p className="text-gray-400 text-sm">No appointments scheduled.</p>}
            {appointments.map((a) => (
              <div key={a.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{a.patient_name}</p>
                    <p className="text-sm text-gray-500">{a.date} at {a.time_slot} — <span className="capitalize">{a.status}</span></p>
                    {a.reason && <p className="text-sm text-gray-400 mt-1">"{a.reason}"</p>}
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    {a.status === 'confirmed' && (
                      <button onClick={() => setActiveAppt(a)} className="text-brand-600 text-xs hover:underline">
                        Write prescription
                      </button>
                    )}
                    {a.status === 'booked' && (
                      <button onClick={() => markStatus(a.id, 'confirmed')} className="text-xs text-gray-500 hover:underline">
                        Mark confirmed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-3">Availability</h2>
          <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm mb-4">
            <div className="flex gap-2 mb-3">
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                className="border rounded-md px-2 py-1.5 text-sm flex-1" />
              <input type="time" value={newSlot} onChange={(e) => setNewSlot(e.target.value)}
                className="border rounded-md px-2 py-1.5 text-sm flex-1" />
              <button onClick={addSlot} className="bg-brand-600 text-white px-3 py-1.5 rounded-md text-sm">Add</button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {availability.filter((a) => a.time_slots.length > 0).map((a) => (
                <div key={a.date} className="text-sm">
                  <span className="font-medium">{a.date}</span>: {a.time_slots.join(', ')}
                </div>
              ))}
              {availability.every((a) => a.time_slots.length === 0) && (
                <p className="text-gray-400 text-sm">No open slots added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {activeAppt && (
        <PrescriptionModal appt={activeAppt} onClose={() => setActiveAppt(null)} onSaved={() => { setActiveAppt(null); loadAll() }} />
      )}
    </div>
  )
}

function PrescriptionModal({ appt, onClose, onSaved }) {
  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([{ medicine_name: '', dosage: '', frequency: '', duration: '' }])

  function updateItem(i, field, value) {
    setItems((its) => its.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)))
  }

  async function save() {
    await api.post(`/appointments/${appt.id}/prescription`, { diagnosis, notes, items })
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">Prescription for {appt.patient_name}</h3>
        <input placeholder="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-3" />
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 mb-2">
            <input placeholder="Medicine" value={item.medicine_name} onChange={(e) => updateItem(i, 'medicine_name', e.target.value)} className="border rounded-md px-2 py-1.5 text-sm" />
            <input placeholder="Dosage" value={item.dosage} onChange={(e) => updateItem(i, 'dosage', e.target.value)} className="border rounded-md px-2 py-1.5 text-sm" />
            <input placeholder="Frequency" value={item.frequency} onChange={(e) => updateItem(i, 'frequency', e.target.value)} className="border rounded-md px-2 py-1.5 text-sm" />
            <input placeholder="Duration" value={item.duration} onChange={(e) => updateItem(i, 'duration', e.target.value)} className="border rounded-md px-2 py-1.5 text-sm" />
          </div>
        ))}
        <button onClick={() => setItems([...items, { medicine_name: '', dosage: '', frequency: '', duration: '' }])}
          className="text-sm text-brand-600 mb-3 hover:underline">+ Add medicine</button>
        <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4" rows={2} />
        <div className="flex gap-2">
          <button onClick={save} className="flex-1 bg-brand-600 text-white py-2 rounded-md">Save Prescription</button>
          <button onClick={onClose} className="flex-1 border py-2 rounded-md">Cancel</button>
        </div>
      </div>
    </div>
  )
}
