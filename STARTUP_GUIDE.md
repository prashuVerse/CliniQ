# 🚀 CliniQ Application - Startup Guide

## Prerequisites
- Node.js & npm installed
- Go 1.24+ installed
- Windows PowerShell

---

## Step 1: Start the Backend Server

```powershell
# Navigate to backend directory
cd D:\hackthethon\CliniQ\backend_api

# The database will auto-migrate and seed with test data
.\cliniq.exe
```

**Expected Output:**
```
✅ Created patient: Rahul Deshmukh (ID: PAT-001)
✅ Created patient: Priya Sharma (ID: PAT-002)
...
✅ Created doctor: Dr. Arun Verma (ID: DOC-001)
...
✅ Database seeded successfully!
Starting server on port 8080
```

---

## Step 2: Start the Frontend Server (New Terminal)

```powershell
# Navigate to frontend directory
cd D:\hackthethon\CliniQ

# Start the Next.js development server
npm run dev
```

**Expected Output:**
```
> cliniq@0.1.0 dev
> next dev

▲ Next.js 15.2.x
- Local:        http://localhost:3000
- Environment:  .env.local

✓ Ready in 1.2s
```

---

## Step 3: Access the Application

1. **Open in Browser:** `http://localhost:3000`

2. **Patient Login:**
   - Tab: "Patient"
   - Enter Patient ID: `PAT-001`
   - Click: "Get OTP"
   - Redirects to: `/dashboard`

3. **Doctor Login:**
   - Tab: "Doctor"
   - Doctor ID: `DOC-001`
   - Hospital ID: `HOSP-001`
   - Password: `password123`
   - Click: "Access Dashboard"
   - Redirects to: `/doctor/dashboard`

---

## Testing Features

### As a Doctor (DOC-001)
✅ Scan patient QR (Enter: PAT-001)
✅ View patient data
✅ Generate QR codes for patients
✅ Request patient access
✅ Use Gemini AI analysis
✅ View prescriptions

### As a Patient (PAT-001)
✅ Generate QR codes for doctors
✅ Upload prescriptions
✅ View own data
✅ Accept/Reject doctor requests
✅ Get Gemini AI insights

---

## Useful Commands

### Rebuild Backend
```powershell
cd D:\hackthethon\CliniQ\backend_api
go build -o cliniq.exe ./cmd/
```

### Reset Database
```powershell
# Stop the server, delete cliniq.db, restart
Remove-Item D:\hackthethon\CliniQ\backend_api\cliniq.db
```

### Check Health
```powershell
# Backend health check
curl http://localhost:8080/health

# Frontend health check
curl http://localhost:3000
```

### View Backend Logs
Backend logs appear in the terminal where you ran `cliniq.exe`

---

## API Endpoints Ready

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/api/auth/patient` | POST | ❌ | ✅ Working |
| `/api/auth/doctor` | POST | ❌ | ✅ Working |
| `/api/doctor/patient/:id` | GET | ✅ | ✅ Working |
| `/api/doctor/patient-by-qr` | GET | ✅ | ✅ Working |
| `/api/prescription/upload` | POST | ✅ | ✅ Working |
| `/api/prescription/list` | GET | ✅ | ✅ Working |
| `/api/ai/analyze` | POST | ✅ | ✅ Working |
| `/api/qr/generate` | POST | ✅ | ✅ Working |
| `/api/qr/scan` | POST | ✅ | ✅ Working |
| `/api/consent/askRequest` | POST | ✅ | ✅ Working |

---

## Test Data Summary

### 5 Test Patients
- PAT-001: Rahul Deshmukh
- PAT-002: Priya Sharma
- PAT-003: Amit Kumar
- PAT-004: Sneha Patel
- PAT-005: Vikram Singh

### 5 Test Doctors
- DOC-001: Dr. Arun Verma (HOSP-001)
- DOC-002: Dr. Priya Gupta (HOSP-001)
- DOC-003: Dr. Rajesh Rao (HOSP-002)
- DOC-004: Dr. Meera Singh (HOSP-002)
- DOC-005: Dr. Vikram Patel (HOSP-001)

**Doctor Password:** `password123` (all doctors)

### 4 Test Prescriptions
- prescription_jan_2026.pdf (RAT-001)
- blood_test_results.txt (RAT-002)
- medication_list.pdf (RAT-001)
- cardiology_report.pdf (RAT-003)

---

## Troubleshooting

### Backend won't start
```powershell
# Check if port 8080 is in use
netstat -ano | findstr :8080

# Kill process using port 8080 (replace PID)
taskkill /PID <PID> /F
```

### Frontend won't start
```powershell
# Clear Next.js cache
Remove-Item -Recurse .next
npm run dev
```

### Database errors
```powershell
# Delete database and restart (auto-migrates)
Remove-Item cliniq.db
# Restart backend server
```

### Dependencies missing
```powershell
# For backend
cd backend_api && go mod tidy

# For frontend
cd CliniQ && npm install
```

---

## Next Steps After Testing

1. Implement real QR code scanner (currently uses prompt)
2. Add file upload to prescription system
3. Integrate real SMS/Email for OTP
4. Add payment integration
5. Deploy to production

---

**Last Updated:** January 25, 2026
