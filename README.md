# MyBudget — Personal Finance Manager Application

A comprehensive full-stack Personal Finance & Wealth Management application designed to track income, expenses, budgets, savings goals, multi-account balances, financial analytics, and administrative oversight.

This workspace contains two complete implementations:
1. **Primary Application (Root Workspace `/`):** React 18 + TypeScript + Vite + Tailwind CSS + Supabase (PostgreSQL with Row Level Security) + Capacitor (Mobile wrapper) + Admin God-Mode Portal + Automated Selenium Testing Suite.
2. **Full-Stack MERN Module (`/finance-manager`):** Node.js + Express.js REST API + MongoDB/Mongoose (with automatic in-memory MongoDB fallback) + React 18 (Vite) frontend with PDF export.

---

## 1. Technologies Actually Used

### Primary Application (Root `/`)
- **Frontend Framework:** React 18.3.1 with TypeScript 5.6.3
- **Build Tool & Dev Server:** Vite 5.4.10
- **Styling:** Tailwind CSS 3.4.15, PostCSS, Autoprefixer
- **Routing:** React Router v7 (`react-router-dom` ^7.18.4)
- **Database & Authentication:** Supabase (`@supabase/supabase-js` ^2.117.2) backed by PostgreSQL (`supabase-schema.sql`, `supabase-seed.sql`) with offline/local fallback via `localStorage`
- **Data Visualization & UI:** Recharts 3.10.1, Framer Motion 13.2.0, Lucide React 0.475.0
- **Mobile Packaging:** Capacitor 6.2.0 (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`)
- **Automated Testing:** Python 3, Selenium WebDriver (`test_budget.py`, `test_non_functional.py`)

### Full-Stack MERN Module (`/finance-manager`)
- **Backend (`/finance-manager/backend`):**
  - Node.js & Express.js (`express` ^4.19.2)
  - Database: MongoDB with Mongoose ODM (`mongoose` ^8.2.1) & `mongodb-memory-server` (^9.1.6) zero-config fallback
  - Authentication & Security: JWT (`jsonwebtoken` ^9.0.2), `bcryptjs` (^2.4.3), `helmet` (^7.1.0), `cors` (^2.8.5), `express-rate-limit` (^7.2.0)
- **Frontend (`/finance-manager/frontend`):**
  - React 18.2.0 (JSX), Vite 5.1.6, Tailwind CSS 3.4.1
  - Routing & HTTP: React Router v6 (`react-router-dom` ^6.22.3), Axios (^1.6.8)
  - Charts & Export: Recharts 2.12.3, Framer Motion 11.0.8, `jspdf` (^2.5.1) & `jspdf-autotable` (^3.8.2)

---

## 2. Prerequisites

- **Node.js:** v18.0.0 or higher (includes `npm`)
- **Python (Optional, for Automated Testing):** Python 3.9+ with `selenium` installed (`pip install selenium`) and Google Chrome
- **Database (Optional):**
  - *Primary App:* Supabase project (or run immediately in offline/local mode without external setup)
  - *MERN Backend:* Local MongoDB instance or MongoDB Atlas URI (automatically falls back to `mongodb-memory-server` if MongoDB is not running locally)

---

## 3. Installation & Setup Steps

### Option A: Running the Primary Application (Root Workspace)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   - To connect a live Supabase PostgreSQL database, add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`, then run `supabase-schema.sql` and `supabase-seed.sql` inside your Supabase SQL Editor.
   - If left unconfigured or offline, the application automatically runs using its built-in local persistence layer (`localStorage`) pre-seeded with realistic demo data.

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will start at **`http://localhost:3000`**.

4. **Build and Preview Production Bundle:**
   ```bash
   npm run build
   npm run preview
   ```

---

### Option B: Running the Full-Stack MERN Application (`/finance-manager`)

1. **Backend Setup (`/finance-manager/backend`):**
   ```bash
   cd finance-manager/backend
   npm install
   cp .env.example .env
   npm run dev
   ```
   - The backend API starts at **`http://localhost:5000`**.
   - If local MongoDB is not running, the server automatically boots an in-memory MongoDB instance and seeds default demo data.
   - To manually seed a local MongoDB database: `npm run seed`.

2. **Frontend Setup (`/finance-manager/frontend`):**
   Open a second terminal:
   ```bash
   cd finance-manager/frontend
   npm install
   cp .env.example .env
   npm run dev
   ```
   - The frontend starts at **`http://localhost:5173`**.

---

## 4. Database Setup & Demo Credentials

### Supabase PostgreSQL Setup (Primary App)
1. Open your Supabase project dashboard -> **SQL Editor**.
2. Execute `supabase-schema.sql` to create the `users`, `accounts`, `transactions`, `budgets`, and `goals` tables, Row Level Security (RLS) policies, and auth triggers.
3. Execute `supabase-seed.sql` (optional) to populate sample financial records.

### Demo Login Credentials
- **Admin Portal Account (Primary App):**
  - **Email:** `admin@financemanager.com`
  - **Password:** `Admin@123` (or click the **Admin Portal** quick-access button on the login screen)
- **Standard Demo User:**
  - **Email:** `john@example.com`
  - **Password:** `password123`

---

## 5. Automated Testing (Functional & Non-Functional)

With the primary application server running on `http://localhost:3000` (`npm run dev`), open a terminal and run:

```bash
# Run End-to-End Selenium Functional Tests (FT-01 to FT-05)
python test_budget.py

# Run Non-Functional Performance, Bundle Size & Security Audit (NFT-01 to NFT-03)
python test_non_functional.py
```

---

## 6. Known Limitations & Simulated Features

For transparency during evaluation, the following features operate in simulated/sandbox mode or require external third-party credentials:
1. **Setu Account Aggregator (`src/services/accountAggregatorService.ts`):** Implements a sandbox simulation fallback when `VITE_SETU_CLIENT_ID` and `VITE_SETU_CLIENT_SECRET` are not supplied. Bank accounts and credit cards are managed manually via the Accounts page.
2. **Offline / Fallback Persistence (`src/context/FinanceContext.tsx` & `src/context/AuthContext.tsx`):** When a live Supabase project is not reachable or `.env` uses placeholder credentials, all CRUD operations (registration, login, transactions, budgets, goals, accounts, and Admin Portal user inspection) persist locally in the browser's `localStorage`.
3. **Mobile Preview Modals (`QRScannerModal.tsx`, `ReferralModal.tsx`, `ServicesModal.tsx`):** Provide interactive UI demonstrations within the mobile companion view (`mybudget.html` / mobile preview) rather than processing real-world UPI/banking settlements.
4. **Native Mobile Platforms (`android/`):** The Capacitor Android project wrapper is generated (`android/`), whereas generating the iOS Xcode project (`npm run cap:add:ios`) requires macOS with Xcode installed.
