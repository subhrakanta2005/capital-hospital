import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleSignInButton from '../components/GoogleSignInButton'

const DASHBOARD_BY_ROLE = {
  patient: '/patient',
  doctor: '/doctor',
  admin: '/admin',
  reception: '/reception',
  pharmacist: '/pharmacy',
}

export default function Login() {
  const { login, requestOtp, verifyOtp, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('email') // email | phone | google
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // email/password
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // phone/OTP
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [devOtp, setDevOtp] = useState('')

  function goToDashboard(user) {
    navigate(DASHBOARD_BY_ROLE[user.role] || '/')
  }

  async function handleEmailLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      goToDashboard(user)
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendOtp() {
    setError('')
    setLoading(true)
    try {
      const res = await requestOtp(phone)
      setOtpSent(true)
      if (res.dev_otp) setDevOtp(res.dev_otp) // only present until a real SMS provider is wired in
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    setError('')
    setLoading(true)
    try {
      const user = await verifyOtp(phone, otp)
      goToDashboard(user)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle(credential) {
    setError('')
    try {
      const user = await loginWithGoogle(credential)
      goToDashboard(user)
    } catch (err) {
      setError(err.response?.data?.detail || 'Google sign-in failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-1 text-center">Sign In</h2>
      <p className="text-sm text-gray-400 text-center mb-6">Capital Hospital, Bhubaneswar — Unit-6</p>

      <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'email', label: 'Email' },
          { id: 'phone', label: 'Phone / OTP' },
          { id: 'google', label: 'Google' },
        ].map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setError('') }}
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition ${tab === t.id ? 'bg-white shadow-sm text-brand-700' : 'text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>}

      {tab === 'email' && (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input type="email" required placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input type="password" required placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <button type="submit" disabled={loading}
            className="w-full bg-brand-600 text-white py-2.5 rounded-md font-medium hover:bg-brand-700 transition disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      )}

      {tab === 'phone' && (
        <div className="space-y-4">
          <input type="tel" placeholder="Phone number" value={phone} disabled={otpSent}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-md px-3 py-2 disabled:bg-gray-50" />
          {!otpSent ? (
            <button onClick={handleSendOtp} disabled={loading || !phone}
              className="w-full bg-brand-600 text-white py-2.5 rounded-md font-medium hover:bg-brand-700 transition disabled:opacity-50">
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          ) : (
            <>
              {devOtp && (
                <p className="text-xs bg-amber-50 text-amber-700 p-2 rounded-md">
                  Dev mode (no SMS provider configured yet): your OTP is <strong>{devOtp}</strong>
                </p>
              )}
              <input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)}
                className="w-full border rounded-md px-3 py-2" />
              <button onClick={handleVerifyOtp} disabled={loading || !otp}
                className="w-full bg-brand-600 text-white py-2.5 rounded-md font-medium hover:bg-brand-700 transition disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <button onClick={() => { setOtpSent(false); setOtp(''); setDevOtp('') }}
                className="w-full text-sm text-gray-400 hover:underline">
                Use a different number
              </button>
            </>
          )}
          <p className="text-xs text-gray-400 text-center">
            New here? Verifying an OTP on a new number creates your patient account automatically.
          </p>
        </div>
      )}

      {tab === 'google' && (
        <div className="py-4">
          <GoogleSignInButton onCredential={handleGoogle} />
        </div>
      )}

      <p className="text-sm text-gray-500 text-center mt-6">
        New patient? <a href="/register" className="text-brand-600 font-medium">Register here</a>
      </p>
    </div>
  )
}
