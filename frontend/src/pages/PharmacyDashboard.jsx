import React, { useEffect, useState } from 'react'
import api from '../api/client'

export default function PharmacyDashboard() {
  const [medicines, setMedicines] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [dispenseFor, setDispenseFor] = useState(null)
  const [dispenseQty, setDispenseQty] = useState(1)

  function load() {
    api.get('/pharmacy/medicines').then((r) => setMedicines(r.data))
  }

  useEffect(load, [])

  async function dispense() {
    await api.post('/pharmacy/dispense', { medicine_id: dispenseFor.id, quantity: Number(dispenseQty) })
    setDispenseFor(null)
    setDispenseQty(1)
    load()
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pharmacy Inventory</h1>
        <button onClick={() => setShowAdd(true)} className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm">+ Add Medicine</button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2">Medicine</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Unit Price</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-2 font-medium">{m.name}</td>
                <td className="px-4 py-2">{m.category || '—'}</td>
                <td className={`px-4 py-2 ${m.stock_quantity <= m.reorder_threshold ? 'text-red-600 font-semibold' : ''}`}>
                  {m.stock_quantity}
                </td>
                <td className="px-4 py-2">₹{m.unit_price}</td>
                <td className="px-4 py-2">
                  <button onClick={() => setDispenseFor(m)} className="text-brand-600 hover:underline">Dispense</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <AddMedicineModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load() }} />}

      {dispenseFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold mb-3">Dispense {dispenseFor.name}</h3>
            <input type="number" min="1" max={dispenseFor.stock_quantity} value={dispenseQty}
              onChange={(e) => setDispenseQty(e.target.value)} className="w-full border rounded-md px-3 py-2 mb-4" />
            <div className="flex gap-2">
              <button onClick={dispense} className="flex-1 bg-brand-600 text-white py-2 rounded-md">Confirm</button>
              <button onClick={() => setDispenseFor(null)} className="flex-1 border py-2 rounded-md">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AddMedicineModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', category: '', stock_quantity: 0, unit_price: 0, reorder_threshold: 20 })
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit() {
    setError('')
    try {
      await api.post('/pharmacy/medicines', {
        ...form,
        stock_quantity: Number(form.stock_quantity),
        unit_price: Number(form.unit_price),
        reorder_threshold: Number(form.reorder_threshold),
      })
      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add medicine')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <h3 className="font-bold mb-3">Add Medicine</h3>
        {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded-md mb-3">{error}</div>}
        <div className="space-y-2">
          <input placeholder="Name" value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full border rounded-md px-3 py-2" />
          <input placeholder="Category" value={form.category} onChange={(e) => update('category', e.target.value)} className="w-full border rounded-md px-3 py-2" />
          <input type="number" placeholder="Stock quantity" value={form.stock_quantity} onChange={(e) => update('stock_quantity', e.target.value)} className="w-full border rounded-md px-3 py-2" />
          <input type="number" step="0.01" placeholder="Unit price" value={form.unit_price} onChange={(e) => update('unit_price', e.target.value)} className="w-full border rounded-md px-3 py-2" />
          <input type="number" placeholder="Reorder threshold" value={form.reorder_threshold} onChange={(e) => update('reorder_threshold', e.target.value)} className="w-full border rounded-md px-3 py-2" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={submit} className="flex-1 bg-brand-600 text-white py-2 rounded-md">Add</button>
          <button onClick={onClose} className="flex-1 border py-2 rounded-md">Cancel</button>
        </div>
      </div>
    </div>
  )
}
