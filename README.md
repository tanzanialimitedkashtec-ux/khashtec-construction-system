<div align="center">

<img src="https://img.shields.io/badge/KASHTEC-Tanzania%20Limited-FF6B00?style=for-the-badge&logo=building&logoColor=white" alt="Kashtec Tanzania" />

# 🏗️ KashTec Construction Management System

**An enterprise-grade, full-stack construction management platform built for [Kashtec Tanzania Limited](https://kashtec.com) — managing every facet of a modern construction company, from HR and payroll to HSE safety and project delivery.**

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)](https://railway.app/)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Core Modules](#-core-modules)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌍 Overview

The **KashTec Construction Management System** is a comprehensive, production-ready platform engineered to digitize and streamline the full operations lifecycle of a construction company. Built with a modular architecture, it replaces fragmented spreadsheets and manual workflows with a single, unified system.

> Serving **Kashtec Tanzania Limited** — a leading construction firm operating across Tanzania.

### ✨ Key Highlights

- 🔴 **Real-time** notifications and live updates via Socket.io
- 🔐 **Role-Based Access Control (RBAC)** across 15+ user roles
- 📊 **60+ API endpoints** covering every department
- 🛡️ **Enterprise security** — JWT auth, bcrypt hashing, rate limiting, Helmet.js headers
- 📧 **Automated email workflows** for approvals, alerts, and notifications
- ☁️ **Cloud-first** — deployed on Railway with MySQL managed database

---

## 🧩 Core Modules

| Module | Description |
|---|---|
| 👥 **Human Resources** | Employee lifecycle, contracts, promotions, talent acquisition |
| 💰 **Payroll & Finance** | Payroll processing, tax deductions, NHIF, NSSF, financial strategies |
| 📁 **Projects** | Project tracking, progress updates, milestone management |
| 🏗️ **HSE & Safety** | Incident reporting, safety violations, PPE issuance, inspections |
| 📦 **Procurement & Sales** | Purchase requests, vendor management, procurement sales |
| 🏢 **Workforce Management** | Worker accounts, assignments, workforce budgets, reports |
| 📋 **Tasks & Workflows** | Task assignment, approval workflows, work orders |
| 🚗 **Fleet Management** | Company cars, drivers, transport cost tracking |
| 🏠 **Properties** | Real estate and company property management |
| 📅 **Attendance** | Employee attendance tracking, leave requests, leave management |
| 📜 **Documents** | Document storage, versioning, policy management |
| 🔔 **Notifications** | Real-time alerts, in-app notifications, email triggers |
| 🤝 **Clients** | Client management and relationship tracking |
| 🧳 **Luggage Operations** | Campaign management, purchase tracking, payment records |
| 📊 **Audit & Compliance** | System-wide audit logs, compliance checks, risk management |
| 🎯 **Meeting Management** | Schedule meetings, record minutes, track outcomes |

---

## 🚀 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js 18+** | Runtime environment |
| **Express.js 4.x** | REST API framework |
| **MySQL 8.0** | Primary relational database |
| **mysql2** | High-performance MySQL driver with connection pooling |
| **Socket.io 4.x** | Real-time bidirectional communication |
| **JWT + bcryptjs** | Authentication & password hashing |
| **Helmet.js** | Secure HTTP headers |
| **express-rate-limit** | API rate limiting / DDoS protection |
| **Multer + AWS S3** | File upload handling and cloud storage |
| **Nodemailer + Resend** | Transactional email delivery |
| **Joi** | Request validation and schema enforcement |

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5 / CSS3** | Semantic markup and responsive styling |
| **Vanilla JavaScript (ES6+)** | Client-side interactivity — zero framework overhead |
| **Fetch API** | REST communication with the backend |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Railway** | Cloud hosting and managed MySQL |
| **AWS S3** | File and document storage |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│           HTML + CSS + Vanilla JS  (department.html)        │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST + WebSocket
┌───────────────────────────▼─────────────────────────────────┐
│                     EXPRESS.JS API SERVER                   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  JWT Auth    │  │  Rate Limit  │  │   Helmet.js      │  │
│  │  Middleware  │  │  Middleware  │  │   (HTTP Headers) │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               64 Route Modules                        │  │
│  │  auth │ employees │ payroll │ projects │ safety │ ... │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ mysql2 (Parameterized Queries)
┌───────────────────────────▼─────────────────────────────────┐
│                  MYSQL DATABASE (Railway)                    │
│         50+ tables · Connection pooling · Migrations        │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴──────────────┐
              │                            │
   ┌──────────▼──────────┐    ┌────────────▼────────────┐
   │    AWS S3 Storage   │    │  Resend / Nodemailer    │
   │   (Files, Docs)     │    │   (Email Delivery)      │
   └─────────────────────┘    └─────────────────────────┘
```

---

## 📁 Project Structure

```
khashtec-construction-system/
│
├── 📂 frontend/
│   └── public/
│       ├── 📂 js/               # Client-side JavaScript modules
│       ├── 📂 assets/           # CSS, icons, fonts
│       ├── 📂 images/           # Company images & logos
│       └── department.html      # Main application shell
│
├── 📂 backend/
│   ├── 📂 routes/               # 64 route handler modules
│   │   ├── auth.js              # Login, registration, JWT
│   │   ├── employees.js         # Employee CRUD & management
│   │   ├── payroll.js           # Payroll processing
│   │   ├── projects.js          # Project management
│   │   ├── safety.js            # HSE & safety incidents
│   │   ├── work.js              # Work orders & PPE
│   │   └── ...                  # (60+ more modules)
│   ├── 📂 services/             # Email, M-Pesa, NMB integrations
│   ├── 📂 middleware/           # Auth guards, file upload handlers
│   ├── 📂 controllers/          # Business logic controllers
│   └── 📂 src/                  # Core config, models, utilities
│
├── 📂 database/
│   ├── 📂 migrations/           # SQL schema migration files
│   ├── 📂 seeds/                # Initial seed data
│   └── 📂 config/               # Database connection config
│
├── 📂 config/                   # App-level configuration
├── 📂 scripts/                  # Utility & maintenance scripts
│
├── server.js                    # Root server entry point
├── package.json
├── railway.toml                 # Railway deployment configuration
├── nixpacks.toml                # Nixpacks build configuration
├── .env.example                 # Environment variable template
└── .gitignore
```

---

## 🛠️ Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** `>= 18.0.0` — [Download](https://nodejs.org/)
- **npm** `>= 8.0.0`
- **MySQL** `>= 8.0` (local) or a Railway MySQL instance

---

### 1. Clone the Repository

```bash
git clone https://github.com/tanzanialimitedkashtec-ux/khashtec-construction-system.git
cd khashtec-construction-system
```

### 2. Install Dependencies

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in all required values. See the [Environment Variables](#-environment-variables) section below.

### 4. Run Database Migrations

```bash
npm run migrate
```

### 5. (Optional) Seed Initial Data

```bash
npm run seed
```

### 6. Start the Server

```bash
# Production
npm start

# Development (with hot reload via nodemon)
npm run dev
```

The server will start at **`http://localhost:3000`** by default.

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and populate the following:

> ⚠️ **Never commit your `.env` file to version control.**

### Database

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Full MySQL connection string | `mysql://user:pass@host:3306/db` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `yourpassword` |
| `DB_NAME` | Database name | `kashtec_db` |

### Authentication

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key for signing JWT tokens (min. 32 chars) |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `7d`) |

### Email

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | API key for [Resend](https://resend.com) email service |
| `GMAIL_USER` | Gmail address used for employee emails |
| `GMAIL_APP_PASSWORD` | Gmail app-specific password |

### Cloud Storage

| Variable | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 |
| `AWS_REGION` | AWS region (e.g. `us-east-1`) |
| `AWS_S3_BUCKET` | S3 bucket name |

---

## 📡 API Reference

All API routes are prefixed with `/api/`. Authentication is required on all routes except `/api/auth/login`.

### Authentication

```http
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

### Core Resources

```http
# Employees
GET    /api/employees
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id

# Projects
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id

# Payroll
GET    /api/payroll
POST   /api/payroll/process
GET    /api/payroll/:id

# Safety / HSE
GET    /api/safety/incidents
POST   /api/safety/incidents
GET    /api/safety/ppe-issuance

# ... and 55+ more route modules
```

> For a full list of all endpoints, refer to the route files in [`backend/routes/`](./backend/routes/).

---

## 🛡️ Security

The system is built with a defense-in-depth security strategy:

| Layer | Implementation |
|---|---|
| **Authentication** | JSON Web Tokens (JWT) — signed, stateless auth on every request |
| **Password Security** | bcryptjs with 12 salt rounds |
| **SQL Injection** | 100% parameterized queries via `mysql2` prepared statements; dynamic column names validated with strict regex (`/^[a-zA-Z0-9_]+$/`) |
| **HTTP Headers** | Helmet.js enforcing secure headers (CSP, HSTS, X-Frame-Options, etc.) |
| **Rate Limiting** | express-rate-limit on auth routes (prevents brute force) |
| **RBAC** | Role-based access control enforced on every sensitive route |
| **Input Validation** | Joi schema validation on all incoming request bodies |
| **Error Handling** | Generic error messages returned to client; full details logged server-side only |
| **Secrets Management** | Environment variables only — nothing hardcoded in source code |
| **Dependency Audits** | `npm audit` run regularly — 0 known vulnerabilities |

---

## 🌐 Deployment

The system is deployed on **[Railway](https://railway.app)** with a managed MySQL instance.

### Deploy to Railway

1. Fork this repository
2. Connect your fork to Railway
3. Add a **MySQL** plugin in Railway dashboard
4. Set all [environment variables](#-environment-variables) in the Railway dashboard
5. Railway will auto-detect and deploy via `railway.toml` / `nixpacks.toml`

> ⚠️ Do **not** use `.env` files in production. Always use the Railway dashboard's environment variable settings.

---

## 📄 License

**Private & Proprietary** — © 2024–2026 Kashtec Tanzania Limited. All rights reserved.

Unauthorized copying, distribution, modification, or use of this software, in whole or in part, is strictly prohibited without explicit written permission from Kashtec Tanzania Limited.

---

<div align="center">

Built with ❤️ for **Kashtec Tanzania Limited**

🏗️ *Building Tanzania's Future*

</div>
