import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut } from 'lucide-react'
import KonarkWheel from './KonarkWheel'
import CulturalBorder from './CulturalBorder'

const DASHBOARD_BY_ROLE = {
  patient: '/patient',
  doctor: '/doctor',
  admin: '/admin',
  reception: '/reception',
  pharmacist: '/pharmacy',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <nav className="bg-gradient-to-r from-brand-900 via-brand-700 to-brand-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <Link to="/" className="flex items-center gap-3">
          <KonarkWheel size={32} className="text-gold-400" />
          <div className="leading-tight">
            <p className="font-bold text-lg">Capital Hospital</p>
            <p className="text-[11px] text-gold-400 tracking-wide">BHUBANESWAR · UNIT-6 · GOVT. OF ODISHA</p>
          </div>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to={DASHBOARD_BY_ROLE[user.role] || '/'} className="hover:underline">
                Dashboard
              </Link>
              <span className="opacity-80">
                {user.name} <span className="opacity-60">({user.role})</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-brand-900/40 hover:bg-brand-900/70 px-3 py-1.5 rounded-md transition"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link
                to="/register"
                className="bg-gold-500 text-brand-900 px-3 py-1.5 rounded-md font-semibold hover:bg-gold-400 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
      <CulturalBorder className="w-full h-3 text-gold-500 bg-brand-900" />
    </div>
  )
}
