import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function BookAppointment() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [availability, setAvailability] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.get('/doctors').then((r) => setDoctors(r.data))
  }, [])

  useEffect(() => {
    if (!selectedDoctorId) return
    api.get(`/doctors/${selectedDoctorId}/availability`).then((r) => setAvailability(r.data.availability))
    setSelectedDate('')
    setSelectedSlot('')
  }, [selectedDoctorId])

  const dateOptions = availability.filter((a) => a.time_slots.length > 0)
  const slotsForDate = dateOptions.find((d) => d.date === selectedDate)?.time_slots || []

  async function handleBook() {
    setError('')
    try {
      await api.post('/appointments', {
        doctor_id: selectedDoctorId,
        date: selectedDate,
        time_slot: selectedSlot,
        reason,
      })
      setSuccess(true)
      setTimeout(() => navigate('/patient'), 1200)
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed — that slot may have just been taken.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Book an Appointment</h1>
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md mb-4">Appointment booked!</div>}

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Doctor</label>
          <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full border rounded-md px-3 py-2">
            <option value="">Select a doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name} — {d.specialization || d.department}</option>
            ))}
          </select>
        </div>

        {selectedDoctorId && (
          <div>
            <label className="text-sm font-medium block mb-1">Date</label>
            <select value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot('') }}
              className="w-full border rounded-md px-3 py-2">
              <option value="">Select a date</option>
              {dateOptions.map((d) => (
                <option key={d.date} value={d.date}>{d.date}</option>
              ))}
            </select>
            {dateOptions.length === 0 && (
              <p className="text-sm text-gray-400 mt-1">No open slots for this doctor right now.</p>
            )}
          </div>
        )}

        {selectedDate && (
          <div>
            <label className="text-sm font-medium block mb-1">Time slot</label>
            <div className="flex flex-wrap gap-2">
              {slotsForDate.map((slot) => (
                <button key={slot} type="button" onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-1.5 rounded-md border text-sm ${selectedSlot === slot ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-300 hover:border-brand-400'}`}>
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium block mb-1">Reason for visit (optional)</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded-md px-3 py-2" rows={3} />
        </div>

        <button onClick={handleBook} disabled={!selectedSlot}
          className="w-full bg-brand-600 text-white py-2.5 rounded-md font-medium hover:bg-brand-700 transition disabled:opacity-40">
          Confirm Booking
        </button>
      </div>
    </div>
  )
}
