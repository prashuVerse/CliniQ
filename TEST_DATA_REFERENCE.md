# 📋 Test Data - Separate File Reference

All test data is now centralized in a single JSON file for easy management and updates.

## 📁 File Location
`backend_api/seeds/test_data.json`

## 📊 Data Structure

```json
{
  "patients": [...],      // 5 test patients
  "doctors": [...],       // 5 test doctors
  "prescriptions": [...], // 4 test prescriptions
  "hospitals": [...]      // 2 test hospitals
}
```

---

## 🧑‍⚕️ Patients (test_data.json)

```json
{
  "patient_id": "PAT-001",
  "username": "Rahul Deshmukh",
  "abha_id": "rahul.deshmukh@abha"
}
```

**Available Patients:**
- PAT-001: Rahul Deshmukh
- PAT-002: Priya Sharma
- PAT-003: Amit Kumar
- PAT-004: Sneha Patel
- PAT-005: Vikram Singh

---

## 👨‍⚕️ Doctors (test_data.json)

```json
{
  "doctor_id": "DOC-001",
  "doctor_name": "Dr. Arun Verma",
  "hospital_id": "HOSP-001",
  "password": "password123"
}
```

**Available Doctors:**
- DOC-001: Dr. Arun Verma (HOSP-001)
- DOC-002: Dr. Priya Gupta (HOSP-001)
- DOC-003: Dr. Rajesh Rao (HOSP-002)
- DOC-004: Dr. Meera Singh (HOSP-002)
- DOC-005: Dr. Vikram Patel (HOSP-001)

**Password (All):** `password123`

---

## 📄 Prescriptions (test_data.json)

```json
{
  "user_id": 1,
  "file_name": "prescription_jan_2026.pdf",
  "file_type": "pdf",
  "file_size": 256000,
  "description": "Monthly prescription for diabetes management"
}
```

**Available Prescriptions:**
- PAT-001: prescription_jan_2026.pdf, medication_list.pdf
- PAT-002: blood_test_results.txt
- PAT-003: cardiology_report.pdf

---

## 🏥 Hospitals (test_data.json)

```json
{
  "hospital_id": "HOSP-001",
  "name": "Apollo Hospital Pune"
}
```

---

## ✅ Changes Made

### Removed from Seeder
- ❌ Mobile number requirement (Phoneno)
- ❌ Aadhar number requirement (Aadhar)

### Now Optional
✅ Phone numbers  
✅ Aadhar numbers  
✅ Other contact info

### Data Structure Simplified
- Patients now only need: `patient_id`, `username`, `abha_id`
- All sensitive data is optional

---

## 🔄 How to Update Test Data

Edit `backend_api/seeds/test_data.json`:

1. Add new patient:
```json
{
  "patient_id": "PAT-006",
  "username": "New Patient",
  "abha_id": "new.patient@abha"
}
```

2. Restart backend:
```powershell
.\cliniq.exe
```

Database will auto-update with new data.

---

## 📄 Documentation Files

| File | Purpose |
|------|---------|
| `test_data.json` | Central data store (JSON) |
| `TESTING_GUIDE.md` | Complete testing documentation |
| `TEST_CREDENTIALS.txt` | Quick reference card |
| `STARTUP_GUIDE.md` | Setup instructions |
| `DUMMY_DATA_README.md` | Quick overview |

---

## Quick Reference

**Patient Login:** PAT-001  
**Doctor Login:** DOC-001 / HOSP-001 / password123  
**Test Data File:** `backend_api/seeds/test_data.json`

---

**All test data is now clean, organized, and requires minimal information.**
