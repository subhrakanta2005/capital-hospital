# Capital Hospital — Full-Stack Hospital Management System

A real, working rebuild of your original single-file demo — now split into a
proper **React/Vite frontend** and **FastAPI + MongoDB backend**, matching the
stack you use across your other projects (Vercel + Render + MongoDB Atlas).

## What's included

**Roles & dashboards**
- **Patient** — register, book appointments (live slot picker), view medical
  records, view/download prescriptions as PDF, view invoices, get a QR
  check-in ticket per appointment.
- **Doctor** — manage availability (add date/time slots), see appointment
  queue, write structured prescriptions (diagnosis + medicine list).
- **Admin** — dashboard stats (patient/doctor counts, today's appointments,
  unpaid invoice total, low-stock medicine count), create/remove
  doctor/reception/pharmacist accounts, manage departments.
- **Reception** — check patients in by scanning/entering their appointment
  QR code, log visitors.
- **Pharmacist** — manage medicine inventory, dispense against stock with
  automatic quantity deduction and low-stock flags.

**Real backend features**
- JWT authentication with bcrypt password hashing, role-based access control
  on every endpoint.
- Race-condition-safe slot booking (atomic MongoDB update — two patients
  can't double-book the same slot).
- Medical records, invoices/billing, pharmacy inventory, visitor logs,
  departments — all real MongoDB collections, not mock data.
- Auto-bootstraps a default admin account on first run.

## What's *not* included (needs real-world accounts/compliance)

- **Payments**: invoice status is trackable (unpaid/paid) but there's no live
  payment gateway wired in. Add a Razorpay/Stripe account, drop the keys into
  `backend/.env`, and wire the charge call into `billing.py`'s `pay_invoice`.
- **SMS/email reminders**: same pattern — Twilio/SendGrid keys go in `.env`,
  the send calls slot into the appointment booking/status-update flows.
- **File storage for large records**: records currently support small
  base64-inline files. For real scan/X-ray uploads, swap in S3 or similar.
- **Legal/compliance review**: a system holding real patient health data
  needs a DPDP Act (India) / equivalent compliance pass — encryption at
  rest, audit logging, consent flows — before going live with real patients.

## Local setup

### Backend
```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI to your MongoDB Atlas connection string
pip install -r requirements.txt --break-system-packages
uvicorn app.main:app --reload
```
API docs: `http://localhost:8000/docs`
Default admin login: whatever you set `ADMIN_EMAIL` / `ADMIN_PASSWORD` to in `.env`.

### Frontend
```bash
cd frontend
cp .env.example .env
# edit .env: set VITE_API_URL to your backend URL
npm install
npm run dev
```
Opens at `http://localhost:5173`.

## Deployment (matches your usual stack)

- **Backend → Render**: push `backend/` as its own repo/root, `render.yaml`
  is already set up. Add your real `MONGO_URI`, `JWT_SECRET`,
  `FRONTEND_ORIGINS` (your Vercel URL) as environment variables in the
  Render dashboard — don't commit real secrets to `.env`.
- **Frontend → Vercel**: point Vercel at `frontend/`, set `VITE_API_URL` to
  your Render backend URL in Vercel's environment variables.
- **Database → MongoDB Atlas**: create a free cluster, get the connection
  string, put it in both local `.env` and Render's `MONGO_URI`.

## Getting started after deploy

1. Log in as admin (bootstrap credentials from `.env`).
2. Add departments (Admin → Departments).
3. Add doctors under those departments (Admin → Staff → Add Staff Member).
4. Have a doctor log in and add availability slots.
5. Register a patient and book an appointment against that doctor.
