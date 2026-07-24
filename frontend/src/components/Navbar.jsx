import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HeartPulse, LogOut } from 'lucide-react'

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
    <nav className="bg-brand-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg">
        <HeartPulse size={24} />
        Capital Hospital
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
              className="bg-white text-brand-700 px-3 py-1.5 rounded-md font-medium hover:bg-brand-50 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
