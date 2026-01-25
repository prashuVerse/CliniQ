# 🏥 CliniQ - Decentralized Patient Health Records Platform

<div align="center">

![CliniQ Logo](https://img.shields.io/badge/CliniQ-Healthcare%20Revolution-0ea5e9?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0yMiAxMmgtNGwtMyA5TDkgM2wtMyA5SDIiLz48L3N2Zz4=&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Go](https://img.shields.io/badge/Go-1.24-00ADD8?style=flat-square&logo=go)](https://golang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

**Empowering patients with complete control over their medical data through secure, consent-based sharing**

[Live Demo](https://cliniq-65r8.onrender.com) • [Features](#-features) • [Quick Start](#-quick-start) • [API Docs](#-api-reference)

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Test Credentials](#-test-credentials)
- [Security](#-security-features)
- [Roadmap](#️-roadmap)

---

## 🎯 Problem Statement

Healthcare data is scattered across PDFs, prescriptions, lab reports, and hospital portals. During OPD visits and follow-ups, patients struggle to present organized medical history, while doctors waste time navigating unstructured documents.

### Critical Challenges:

| Challenge | Impact |
|-----------|--------|
| **Fragmented Records** | Medical history scattered across multiple hospitals and clinics |
| **Privacy Concerns** | Patients have no control over who accesses their sensitive health data |
| **Emergency Access** | No quick way to share medical history with new doctors in emergencies |
| **Manual Processes** | Paper-based consent forms and physical record transfers |
| **Medical Errors** | Incomplete patient history leads to misdiagnosis and drug interactions |

---

## 💡 Our Solution

**CliniQ** is a patient-controlled digital health record platform that allows users to securely upload their medical documents and share selected data with doctors through **temporary QR-based access**.

<div align="center">

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│    📱 Patient uploads    →    🤖 AI organizes    →    🔲 QR Share    │
│       documents              health timeline          with doctor    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

</div>

### Key Innovations:

🔐 **Consent-Based Access** — Doctors can only view your records with your explicit permission

📱 **QR Code Sharing** — Generate time-limited QR codes for instant, secure record sharing

🤖 **AI-Powered Insights** — Get intelligent analysis of your prescriptions using Google Gemini

⏱️ **Temporary Access** — Set access duration from 5 minutes to 24 hours

🏥 **ABHA Ready** — Built with India's Ayushman Bharat Health Account standards

---

## ✨ Features

### For Patients 👤

| Feature | Description |
|---------|-------------|
| **📲 Phone-Based Login** | Simple OTP-based authentication using mobile number |
| **📁 Prescription Upload** | Upload and manage prescriptions (PDF, Images, Text) |
| **🔲 QR Code Generation** | Create time-limited access codes for doctors |
| **👁️ Access Control** | Choose between BASIC or FULL access levels |
| **📊 AI Analysis** | Get insights from your medical records using Gemini AI |
| **📋 Request Management** | View and approve/reject doctor access requests |
| **🔔 Reminders** | Set medication reminders and alerts |

### For Doctors 🩺

| Feature | Description |
|---------|-------------|
| **🔑 Secure Login** | Doctor ID + Hospital ID + Password authentication |
| **📷 QR Scanner** | Scan patient QR codes for instant access |
| **📝 Request Access** | Send consent requests to patients |
| **📄 View Records** | Access patient prescriptions and medical history |
| **🔒 Time-Limited Access** | Access automatically expires based on patient settings |

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="33%">

### Frontend
```
Next.js 16.1
React 19
TypeScript 5
Tailwind CSS 4
Framer Motion
Lucide Icons
```

</td>
<td align="center" width="33%">

### Backend
```
Go 1.24
Gin Framework
GORM ORM
JWT Authentication
QR Code Generation
PostgreSQL
```

</td>
<td align="center" width="33%">

### AI & Infra
```
Google Gemini API
Render (Hosting)
PostgreSQL (Neon)
REST API
CORS Security
```

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Patient   │  │   Doctor    │  │         Auth            │ │
│  │  Dashboard  │  │  Dashboard  │  │    (Login/Register)     │ │
│  │             │  │             │  │                         │ │
│  │ • Upload Rx │  │ • Scan QR   │  │ • Phone OTP (Patient)   │ │
│  │ • View QR   │  │ • View Rx   │  │ • Credentials (Doctor)  │ │
│  │ • AI Chat   │  │ • Request   │  │                         │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         └────────────────┼─────────────────────┘               │
│                          │                                      │
│                  ┌───────▼───────┐                              │
│                  │   API Layer   │  lib/api.ts                  │
│                  │   (Fetch)     │  Centralized API calls       │
│                  └───────┬───────┘                              │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTPS + JWT
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                     Go + Gin Backend                        │  │
│  │                                                              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │  │
│  │  │   Auth   │ │  QR Code │ │ Consent  │ │ Prescription │   │  │
│  │  │ Handler  │ │ Handler  │ │ Handler  │ │   Handler    │   │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘   │  │
│  │       │            │            │              │            │  │
│  │  ┌────▼────────────▼────────────▼──────────────▼────────┐  │  │
│  │  │              Middleware Layer                         │  │  │
│  │  │    • JWT Validation  • CORS  • Request Logging       │  │  │
│  │  └──────────────────────────┬───────────────────────────┘  │  │
│  │                             │                               │  │
│  │              ┌──────────────▼──────────────┐                │  │
│  │              │      GORM ORM Layer         │                │  │
│  │              │   (Models & Migrations)     │                │  │
│  │              └──────────────┬──────────────┘                │  │
│  └─────────────────────────────┼───────────────────────────────┘  │
│                                │                                   │
│                    ┌───────────▼───────────┐                      │
│                    │      PostgreSQL       │                      │
│                    │   • Users (Patients)  │                      │
│                    │   • Doctors           │                      │
│                    │   • Prescriptions     │                      │
│                    │   • Access Tokens     │                      │
│                    │   • View Requests     │                      │
│                    └───────────────────────┘                      │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Go** 1.24+
- **PostgreSQL** 14+

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/PrasadNaik1310/CliniQ.git
cd CliniQ
```

### 2️⃣ Setup Frontend

```bash
# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local

# Start development server
npm run dev
```

Frontend will be available at **http://localhost:3000**

### 3️⃣ Setup Backend

```bash
cd backend_api/cmd

# Create .env file with your credentials
cat > .env << EOF
DATABASE_URL=postgres://user:password@localhost:5432/cliniq?sslmode=disable
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
GEMINI_API_KEY=your-gemini-api-key
EOF

# Run the server
go run main.go
```

Backend API will be available at **http://localhost:8080**

### 4️⃣ Verify Setup

```bash
# Check backend health
curl http://localhost:8080/health

# Expected response:
# {"service":"CliniQ","status":"healthy"}
```

---

## 📡 API Reference

### 🔐 Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/patient` | Patient login with phone | ❌ |
| `POST` | `/api/auth/doctor` | Doctor login with credentials | ❌ |

### 🔲 QR Code & Access

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/qr/generate` | Generate temporary QR code | ✅ Patient |
| `POST` | `/api/qr/scan` | Scan and validate QR token | ✅ Doctor |
| `GET` | `/api/qr/my-tokens` | List patient's active tokens | ✅ Patient |
| `DELETE` | `/api/qr/:id` | Revoke access token | ✅ Patient |

### 🤝 Consent Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/consent/viewRequest` | View pending requests | ✅ |
| `POST` | `/api/consent/askRequest` | Doctor requests access | ✅ Doctor |
| `POST` | `/api/consent/acceptRequest` | Patient approves request | ✅ Patient |
| `POST` | `/api/consent/rejectRequest` | Patient rejects request | ✅ Patient |

### 📄 Prescriptions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/prescription/upload` | Upload prescription | ✅ Patient |
| `GET` | `/api/prescription/list` | List all prescriptions | ✅ |
| `GET` | `/api/prescription/download/:id` | Download prescription | ✅ |
| `DELETE` | `/api/prescription/:id` | Delete prescription | ✅ Patient |

### 🤖 AI Analysis

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/ai/analyze` | Analyze prescriptions with Gemini AI | ✅ |

---

## 🧪 Test Credentials

### Patient Login (Phone-based)
| Phone Number | Name | Patient ID |
|--------------|------|------------|
| `9876543210` | Rahul Deshmukh | PAT-001 |
| `9123456789` | Priya Sharma | PAT-002 |
| `8765432109` | Amit Kumar | PAT-003 |

### Doctor Login
| Doctor ID | Hospital ID | Password | Name |
|-----------|-------------|----------|------|
| `DOC-001` | `HOSP-001` | `password123` | Dr. Arun Verma |
| `DOC-002` | `HOSP-001` | `password123` | Dr. Priya Gupta |
| `DOC-003` | `HOSP-002` | `password123` | Dr. Rajesh Rao |

---

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| **JWT Authentication** | Secure token-based auth with 24h expiry |
| **Time-Limited Access** | QR codes expire automatically (5min - 24hrs) |
| **Consent-Based Sharing** | Patients explicitly approve all access |
| **Password Hashing** | bcrypt with salt for doctor passwords |
| **CORS Protection** | Configured allowed origins and methods |
| **Request Logging** | Full audit trail of all API requests |

---

## 🗺️ Roadmap

- [x] Patient & Doctor Authentication
- [x] QR Code Generation & Scanning
- [x] Prescription Upload & Management
- [x] Consent-Based Access Control
- [x] AI-Powered Analysis (Gemini)
- [x] Time-Limited Temporary Access
- [ ] ABHA Integration (Ayushman Bharat)
- [ ] Blockchain-Based Audit Trail
- [ ] Multi-Language Support (Hindi, Marathi)
- [ ] Mobile App (React Native)
- [ ] Offline Mode with Sync

---

## 📁 Project Structure

```
CliniQ/
├── app/                      # Next.js App Router
│   ├── auth/login/          # Login page
│   ├── dashboard/           # Patient dashboard
│   ├── doctor/dashboard/    # Doctor dashboard
│   └── components/          # Shared components
├── lib/                      # Utilities
│   ├── api.ts               # API client
│   ├── gemini.ts            # AI integration
│   └── store.tsx            # State management
├── backend_api/              # Go Backend
│   ├── cmd/main.go          # Entry point
│   ├── handlers/            # Route handlers
│   ├── middleware/          # Auth, logging
│   ├── models/              # Database models
│   ├── db/                  # Database config
│   └── seeds/               # Test data seeder
└── public/                   # Static assets
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

## 🏆 Hackathon Submission 2026

<br>

**CliniQ** — *Empowering patients. Enabling doctors. Revolutionizing healthcare.*

<br>

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)](https://github.com/PrasadNaik1310/CliniQ)
[![Star on GitHub](https://img.shields.io/badge/⭐-Star%20on%20GitHub-yellow?style=for-the-badge)](https://github.com/PrasadNaik1310/CliniQ)

---

*Built with passion by Team CliniQ*

</div>
