# FINANCE MANAGER
> **"Take control of your money."**

Finance Manager is a premium, full-stack Personal Finance Management SaaS application built to empower users with total visibility and control over their finances, bank accounts, income, expenses, budgets, savings goals, and financial statements.

---

## 🌟 Key Features

- 🔒 **Secure Authentication**: JWT-based stateless authentication with password hashing via `bcryptjs`.
- 💼 **Account Management**: Track multi-bank balances, credit cards, cash wallets, and savings accounts.
- 💸 **Transaction Tracking**: Log incomes and expenses with automatic real-time account balance updates.
- 📊 **Dynamic Dashboard**: Live aggregate metrics (Total Balance, Total Income, Total Expenses, Net Savings), Recharts bar & pie breakdown.
- 🎯 **Financial Goals**: Set target savings goals with progress tracking and quick savings deposit actions.
- 📉 **Category Budgets**: Manage budget limits with automatic health status calculation (Healthy, Warning, Almost Exceeded, Exceeded).
- 🔔 **Automated Notifications**: System notifications triggered by real-time budget thresholds and savings milestones.
- 📄 **Exportable Reports**: Generate instant downloadable **CSV** statements and formatted **PDF Reports**.
- ⚙️ **User Settings**: Profile editing, currency/date preferences, password management, and confirmation dialogs.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **PDF Generation**: jsPDF + autoTable

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM (includes MongoMemoryServer fallback)
- **Security**: Helmet, CORS, Express-Rate-Limit
- **Auth**: JSON Web Token (JWT) & BcryptJS

---

## 📁 Folder Structure

```
finance-manager/
│
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # API request logic
│   ├── middleware/      # Auth, error, and validation middleware
│   ├── models/          # Mongoose schema definitions
│   ├── routes/          # REST API endpoints
│   ├── services/        # Dashboard, notification, and report calculation engines
│   ├── utils/           # Helper utilities
│   ├── seed.js          # Demo seed script
│   ├── server.js        # Express server entry point
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/  # Layout, Dashboard, Accounts, Transactions, Budgets, Goals, Charts, Common
    │   ├── context/     # Auth Context Provider
    │   ├── pages/       # Login, Register, Dashboard, Accounts, Transactions, Budgets, Goals, Reports, Settings
    │   ├── services/    # Axios REST API client
    │   ├── utils/       # Currency & date formatters
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB (optional, server includes an automatic embedded in-memory fallback for zero-config testing!)

### 2. Backend Setup
```bash
cd finance-manager/backend
npm install
npm run seed     # Populate realistic demo user (demo@financemanager.com / password123)
npm run dev      # Starts API server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd finance-manager/frontend
npm install
npm run dev      # Starts React Vite dev server on http://localhost:5173
```

---

## 🔑 Demo Credentials

- **Email**: `demo@financemanager.com`
- **Password**: `password123`
- *Or click "One-Click Demo Account" on the Login screen!*

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login & return JWT |
| `GET` | `/api/auth/me` | Fetch authenticated profile |
| `GET` | `/api/accounts` | List user financial accounts |
| `POST` | `/api/transactions` | Create income/expense transaction |
| `GET` | `/api/budgets` | Fetch active category budgets & progress |
| `GET` | `/api/goals` | Fetch savings goals & progress |
| `GET` | `/api/reports/dashboard` | Aggregated dashboard metrics & charts |
| `GET` | `/api/notifications` | User notifications & alerts |

---

## 🔒 Security Measures
- Protected API routes filter strictly by authenticated `userID`.
- Passwords are salted and hashed with `bcryptjs`.
- JWT secrets stored strictly in environment variables.
- Express rate limiting prevents brute force attacks.
