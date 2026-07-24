import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone_number: '',
    date_of_birth: '', gender: '', blood_group: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register-patient', form)
      await login(form.email, form.password)
      navigate('/patient')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 mb-12 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-center">Patient Registration</h2>
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required placeholder="Full name" value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full border rounded-md px-3 py-2" />
        <input required type="email" placeholder="Email" value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="w-full border rounded-md px-3 py-2" />
        <input required type="password" placeholder="Password" value={form.password}
          onChange={(e) => update('password', e.target.value)}
          className="w-full border rounded-md px-3 py-2" />
        <input required placeholder="Phone number" value={form.phone_number}
          onChange={(e) => update('phone_number', e.target.value)}
          className="w-full border rounded-md px-3 py-2" />
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={form.date_of_birth}
            onChange={(e) => update('date_of_birth', e.target.value)}
            className="w-full border rounded-md px-3 py-2" />
          <select value={form.gender} onChange={(e) => update('gender', e.target.value)}
            className="w-full border rounded-md px-3 py-2">
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <select value={form.blood_group} onChange={(e) => update('blood_group', e.target.value)}
          className="w-full border rounded-md px-3 py-2">
          <option value="">Blood group (optional)</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
        <button type="submit" disabled={loading}
          className="w-full bg-brand-600 text-white py-2.5 rounded-md font-medium hover:bg-brand-700 transition disabled:opacity-50">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}
