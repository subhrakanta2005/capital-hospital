import React, { useEffect, useState } from 'react'
import api from '../api/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [staff, setStaff] = useState([])
  const [departments, setDepartments] = useState([])
  const [tab, setTab] = useState('overview')
  const [showAddStaff, setShowAddStaff] = useState(false)

  function loadAll() {
    api.get('/admin/dashboard').then((r) => setStats(r.data))
    api.get('/admin/staff').then((r) => setStaff(r.data))
    api.get('/admin/departments').then((r) => setDepartments(r.data))
  }

  useEffect(loadAll, [])

  async function removeStaff(id) {
    await api.delete(`/admin/staff/${id}`)
    loadAll()
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Patients" value={stats?.total_patients} />
        <StatCard label="Doctors" value={stats?.total_doctors} />
        <StatCard label="Today's appointments" value={stats?.appointments_today} />
        <StatCard label="Unpaid total" value={stats ? `₹${stats.unpaid_invoice_total.toFixed(0)}` : '—'} />
        <StatCard label="Low stock meds" value={stats?.low_stock_medicines} warn={stats?.low_stock_medicines > 0} />
      </div>

      <div className="flex gap-4 border-b mb-6">
        {['overview', 'staff', 'departments'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-2 px-1 capitalize font-medium ${tab === t ? 'border-b-2 border-brand-600 text-brand-700' : 'text-gray-400'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <p className="text-gray-500">Use the tabs above to manage staff and departments. Full appointment and billing logs are also available via the API for reception and finance workflows.</p>
      )}

      {tab === 'staff' && (
        <div>
          <button onClick={() => setShowAddStaff(true)} className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm mb-4">
            + Add Staff Member
          </button>
          <div className="space-y-2">
            {staff.map((s) => (
              <div key={s.id} className="bg-white border border-gray-100 rounded-lg p-3 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-medium">{s.name} <span className="text-xs text-gray-400 capitalize">({s.role})</span></p>
                  <p className="text-sm text-gray-500">{s.email} {s.department && `— ${s.department}`}</p>
                </div>
                <button onClick={() => removeStaff(s.id)} className="text-red-500 text-sm hover:underline">Remove</button>
              </div>
            ))}
          </div>
          {showAddStaff && <AddStaffModal onClose={() => setShowAddStaff(false)} onSaved={() => { setShowAddStaff(false); loadAll() }} departments={departments} />}
        </div>
      )}

      {tab === 'departments' && (
        <DepartmentsPanel departments={departments} onChanged={loadAll} />
      )}
    </div>
  )
}

function StatCard({ label, value, warn }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${warn ? 'text-red-600' : 'text-brand-700'}`}>{value ?? '—'}</p>
    </div>
  )
}

function AddStaffModal({ onClose, onSaved, departments }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'doctor', department: '', specialization: '', phone_number: '' })
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit() {
    setError('')
    try {
      await api.post('/auth/create-staff', form)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create staff member')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="font-bold text-lg mb-4">Add Staff Member</h3>
        {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded-md mb-3">{error}</div>}
        <div className="space-y-2">
          <input placeholder="Full name" value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full border rounded-md px-3 py-2" />
          <input placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full border rounded-md px-3 py-2" />
          <input placeholder="Temporary password" value={form.password} onChange={(e) => update('password', e.target.value)} className="w-full border rounded-md px-3 py-2" />
          <select value={form.role} onChange={(e) => update('role', e.target.value)} className="w-full border rounded-md px-3 py-2">
            <option value="doctor">Doctor</option>
            <option value="reception">Reception</option>
            <option value="pharmacist">Pharmacist</option>
          </select>
          {form.role === 'doctor' && (
            <>
              <select value={form.department} onChange={(e) => update('department', e.target.value)} className="w-full border rounded-md px-3 py-2">
                <option value="">Select department</option>
                {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
              <input placeholder="Specialization" value={form.specialization} onChange={(e) => update('specialization', e.target.value)} className="w-full border rounded-md px-3 py-2" />
            </>
          )}
          <input placeholder="Phone number" value={form.phone_number} onChange={(e) => update('phone_number', e.target.value)} className="w-full border rounded-md px-3 py-2" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={submit} className="flex-1 bg-brand-600 text-white py-2 rounded-md">Create</button>
          <button onClick={onClose} className="flex-1 border py-2 rounded-md">Cancel</button>
        </div>
      </div>
    </div>
  )
}

function DepartmentsPanel({ departments, onChanged }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  async function add() {
    if (!name) return
    await api.post(`/admin/departments?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`)
    setName('')
    setDescription('')
    onChanged()
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input placeholder="Department name" value={name} onChange={(e) => setName(e.target.value)} className="border rounded-md px-3 py-2 flex-1" />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border rounded-md px-3 py-2 flex-1" />
        <button onClick={add} className="bg-brand-600 text-white px-4 py-2 rounded-md">Add</button>
      </div>
      <div className="space-y-2">
        {departments.map((d) => (
          <div key={d.id} className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
            <p className="font-medium">{d.name}</p>
            <p className="text-sm text-gray-500">{d.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
