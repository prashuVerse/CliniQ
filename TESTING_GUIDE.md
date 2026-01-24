# CliniQ Testing Guide - Dummy Data Ready

## Test Data Overview

The application now includes a seed database with dummy data for comprehensive testing. Here's what's available:

---

## 🧑‍⚕️ Test Patients (5 Available)

### Patient Login Credentials
All patients use **Patient ID only** (no password required for now):

| Patient ID | Name |
|-----------|------|
| `PAT-001` | Rahul Deshmukh |
| `PAT-002` | Priya Sharma |
| `PAT-003` | Amit Kumar |
| `PAT-004` | Sneha Patel |
| `PAT-005` | Vikram Singh |

---

## 👨‍⚕️ Test Doctors (5 Available)

### Doctor Login Credentials
All doctors use the same password: **`password123`**

| Name | Doctor ID | Hospital ID | Hospital |
|------|-----------|------------|----------|
| Dr. Arun Verma | `DOC-001` | `HOSP-001` | Apollo Hospital Pune |
| Dr. Priya Gupta | `DOC-002` | `HOSP-001` | Apollo Hospital Pune |
| Dr. Rajesh Rao | `DOC-003` | `HOSP-002` | Holy Cross Hospital |
| Dr. Meera Singh | `DOC-004` | `HOSP-002` | Holy Cross Hospital |
| Dr. Vikram Patel | `DOC-005` | `HOSP-001` | Apollo Hospital Pune |

**Example Login:**
```
Doctor ID: DOC-001
Hospital ID: HOSP-001
Password: password123
```

---

## 📄 Test Prescriptions (4 Available)

Pre-loaded prescriptions linked to patients:

| Patient | File Name | Type | Size | Description |
|---------|-----------|------|------|-------------|
| PAT-001 (Rahul) | prescription_jan_2026.pdf | PDF | 256 KB | Monthly prescription for diabetes |
| PAT-002 (Priya) | blood_test_results.txt | TXT | 5 KB | Recent blood test results |
| PAT-001 (Rahul) | medication_list.pdf | PDF | 180 KB | Current medications & dosages |
| PAT-003 (Amit) | cardiology_report.pdf | PDF | 320 KB | Cardiac assessment report |

---

## 🔄 Testing Flows

### ✅ Patient Login Flow
1. **Page:** `/auth/login` → Patient Tab
2. **Enter:** Patient ID (e.g., `PAT-001`)
3. **Click:** Get OTP
4. **Expected:** Redirect to patient dashboard at `/dashboard`

### ✅ Doctor Login Flow
1. **Page:** `/auth/login` → Doctor Tab
2. **Enter:**
   - Doctor ID: `DOC-001`
   - Hospital ID: `HOSP-001`
   - Password: `password123`
3. **Click:** Access Dashboard
4. **Expected:** Redirect to doctor dashboard at `/doctor/dashboard`

### ✅ Doctor Scanning QR (Patient Access)
1. **Login as doctor** (DOC-001, HOSP-001, password123)
2. **In doctor dashboard,** click "Scan Patient QR"
3. **Enter:** Patient ID (e.g., `PAT-001`) when prompted
4. **Expected:** Patient data loads (name, phone, patient ID, etc.)

### ✅ Doctor Requesting Patient Access
1. **Login as doctor** (DOC-001)
2. **In dashboard,** enter Patient ID in "Request Access" section
3. **Click:** Send Request
4. **Expected:** Access request sent message

### ✅ Viewing Prescriptions
1. **Login as patient** (PAT-001)
2. **Navigate to:** Patient dashboard
3. **Expected:** List of prescriptions (if any linked to patient)

---

## 🔑 API Testing (cURL Examples)

### Patient Login
```bash
curl -X POST http://localhost:8080/api/auth/patient \
  -H "Content-Type: application/json" \
  -d '{"abhaid": "rahul.deshmukh@abha"}'
```

### Doctor Login
```bash
curl -X POST http://localhost:8080/api/auth/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "doctorid": "DOC-001",
    "hospitalid": "HOSP-001",
    "password": "password123"
  }'
```

### Get Patient Data (Doctor Only)
```bash
curl -X GET http://localhost:8080/api/doctor/patient/1 \
  -H "Authorization: Bearer <jwt_token_from_doctor_login>"
```

### Get Prescriptions (Authenticated)
```bash
curl -X GET http://localhost:8080/api/prescription/list \
  -H "Authorization: Bearer <jwt_token>"
```

---

## 📋 Database Schema Verification

### Tables Created
- `users` - Patient records
- `doctors` - Doctor records
- `prescriptions` - Prescription files
- `temporary_access_tokens` - QR-based access tokens
- `view_requests` - Patient access requests

### Verify Seeding
Check logs when server starts:
```
✅ Created patient: Rahul Deshmukh (ID: PAT-001)
✅ Created patient: Priya Sharma (ID: PAT-002)
...
✅ Created doctor: Dr. Arun Verma (ID: DOC-001, Hospital: HOSP-001)
...
✅ Created prescription: prescription_jan_2026.pdf
...
✅ Database seeded successfully!
```

---

## 🔧 Useful Testing Notes

### Endpoints Implemented
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/patient` | ❌ | Patient login |
| POST | `/api/auth/doctor` | ❌ | Doctor login |
| GET | `/api/doctor/patient/:id` | ✅ | Get patient data |
| GET | `/api/doctor/patient-by-qr` | ✅ | Scan QR token |
| GET | `/api/prescription/list` | ✅ | List prescriptions |
| POST | `/api/ai/analyze` | ✅ | Analyze with Gemini |
| POST | `/api/qr/generate` | ✅ | Generate QR code |
| GET | `/api/qr/my-tokens` | ✅ | List QR tokens |

### Reset Database (If Needed)
If you need to clear and reseed the database:
1. Delete `cliniq.db` file
2. Restart the backend server
3. Database will auto-migrate and seed

---

## 🎯 Test Scenarios

### Scenario 1: Complete Doctor Workflow
1. Login as Dr. Arun Verma (DOC-001)
2. Scan Patient Rahul (PAT-001)
3. View patient data
4. Request access for medical records
5. View Gemini AI analysis

### Scenario 2: Patient Activity
1. Login as Rahul (PAT-001)
2. View own prescriptions
3. Generate QR code for doctor
4. Upload new prescription
5. Accept/Reject doctor access requests

### Scenario 3: Emergency Access
1. Doctor initiates emergency access
2. Bypass normal QR scanning
3. View patient data without explicit consent
4. Log access event

---

## 📝 Notes

- All test data is **case-sensitive** for IDs
- Passwords are hashed with bcrypt
- JWT tokens expire in 24 hours
- QR tokens have configurable expiration (5min - 24hrs)
- Patient access requests remain until explicitly accepted/rejected

---

**Last Updated:** January 25, 2026  
**Database:** SQLite (cliniq.db)  
**Server Port:** 8080
