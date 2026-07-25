import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/PatientDashboard'
import BookAppointment from './pages/BookAppointment'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ReceptionDashboard from './pages/ReceptionDashboard'
import PharmacyDashboard from './pages/PharmacyDashboard'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/patient" element={
          <ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>
        } />
        <Route path="/patient/book" element={
          <ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>
        } />
        <Route path="/doctor" element={
          <ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/reception" element={
          <ProtectedRoute roles={['reception']}><ReceptionDashboard /></ProtectedRoute>
        } />
        <Route path="/pharmacy" element={
          <ProtectedRoute roles={['pharmacist']}><PharmacyDashboard /></ProtectedRoute>
        } />
      </Routes>
      <Footer />
    </div>
  )
}
