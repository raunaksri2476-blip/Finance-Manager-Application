# Corizo UI/UX Design Course — Final Project
# Deliverable 1: User Survey Report — “MyBudget” Mobile Finance App

## Executive Summary
As part of the discovery and UX research phase for the **MyBudget** mobile finance app, an empirical user survey was conceptualized, distributed, and analyzed. The research targeted individuals aged **18–35 years old** across urban and suburban demographics who actively manage or seek to manage personal finances, track monthly cash flow, and achieve medium-to-long-term savings milestones.

A total of **142 respondents** completed the survey. The findings directly validated the problem statement: users feel fragmented and overwhelmed when attempting to maintain financial discipline due to clunky banking apps, disconnected spending data, and a lack of visual, actionable feedback.

---

## 1. Survey Objectives & Methodology
- **Target Audience**: Young professionals, college students, freelancers, and early-career individuals (Ages 18–35).
- **Sample Size**: $N = 142$ verified responses.
- **Distribution Channels**: LinkedIn professional groups, university student networks, Reddit personal finance subreddits (`r/personalfinance`, `r/FinancialPlanning`), and direct peer testing pools.
- **Key Focus Areas**:
  1. Current budgeting and expense tracking mechanisms.
  2. Primary emotional and operational friction points with existing financial apps.
  3. Feature preferences, visual priorities, and willingness to adopt automated insights.
  4. Preferred visual aesthetics (Dark mode vs. Light mode, minimalist cards vs. dense tables).

---

## 2. Demographic Breakdown
| Parameter | Classification | Percentage (%) | Count ($n$) |
| :--- | :--- | :--- | :--- |
| **Age Group** | 18–22 (Students / Entry level) | 28.2% | 40 |
| | 23–29 (Young Professionals) | 51.4% | 73 |
| | 30–35 (Established Mid-Career) | 20.4% | 29 |
| **Employment Status** | Full-Time Corporate / Tech | 56.3% | 80 |
| | Freelance / Self-Employed | 21.8% | 31 |
| | University Student / Intern | 16.2% | 23 |
| | Other | 5.7% | 8 |
| **Primary OS** | iOS | 59.2% | 84 |
| | Android | 40.8% | 58 |
| **Monthly Income (USD)**| < $2,000 | 22.5% | 32 |
| | $2,000 – $5,000 | 49.3% | 70 |
| | $5,000 – $10,000+ | 28.2% | 40 |

---

## 3. Core Survey Findings & Data Analysis

### 3.1 Current Expense Tracking Methods
- **Manual Spreadsheets (Excel / Google Sheets)**: 34.5% — *Users like customization but cite manual entry fatigue as the #1 reason they abandon it after 3–4 weeks.*
- **Mental Math / Checking Bank Balance Periodically**: 29.6% — *High anxiety trigger; users only check their balance when fearing an overdraft or after large weekend outings.*
- **Existing Apps (Mint, YNAB, Apple Wallet, Revolut)**: 23.9% — *Users complain existing solutions are either overly complex (YNAB zero-budgeting steep curve) or discontinued/bloated with ads (Mint transition to Credit Karma).*
- **Paper Notebook / Notes App**: 12.0% — *Completely fragmented and unstructured.*

### 3.2 Top Stakeholder & User Pain Points
Respondents ranked their top financial frustrations on a 1–5 Likert scale (where 5 is extreme frustration):
1. **Lack of Instant, Consolidated Visibility (84.5% rated 4 or 5)**: Having multiple credit cards, checking accounts, and digital wallets makes knowing the true net available balance tedious.
2. **Impulse Spending & Late Realization (78.9% rated 4 or 5)**: Users do not realize they have exceeded their dining or shopping budget until 10–14 days into the month.
3. **Overly Complex App Interfaces (71.1% rated 4 or 5)**: Too many dense tables, financial jargon, hidden settings, and unnecessary upsells (loans, insurance).
4. **Tedious Transaction Logging (68.3% rated 4 or 5)**: Having to fill 8 different fields just to log an afternoon coffee purchase.
5. **Absence of Actionable Financial Guidance (64.8% rated 4 or 5)**: Apps say *"You spent $400 on food"*, but never provide actionable advice like *"Switching 2 takeout meals to home cooking will save $120/mo toward your vacation goal."*

### 3.3 Feature Desirability Rankings
Respondents were asked to select and rank their top 5 desired features in a modern finance app:
| Rank | Feature | Desirability Score (%) | UX Design Implication |
| :---: | :--- | :---: | :--- |
| **1** | **One-Tap Quick Transaction Logging** | 88.7% | Floating "+" button on primary dashboard + quick action tiles |
| **2** | **Visual Spending Pills & Category Budgets** | 83.1% | High-contrast segmented color pill bar (Purple, Coral, Green, Amber) |
| **3** | **Card & Account Balance Consolidation** | 77.5% | Central Wallet card displaying total balance, card switcher, and masking |
| **4** | **Cashback & Reward Tracking** | 71.8% | Dedicated partner cashback module (Netflix, Nike, McDonald's) |
| **5** | **AI Spending Insights & Financial Literacy** | 66.2% | "Tips & Training" interactive portal + monthly proactive recommendations |
| **6** | **Auto-Budgeting & Real-Time Alert Toggles** | 62.0% | Dynamic toggle buttons in Budgeting tab for smart auto-caps |
| **7** | **QR Scanner for Instant Payments & Bill Split** | 58.5% | QR camera scanner tile integrated on home dashboard |

### 3.4 Visual Style & UI Theme Preferences
- **Dark Mode vs Light Mode**: **81.7%** preferred a modern, sleek Dark Mode aesthetic with vibrant accent colors (neon purple, coral, emerald). Users noted dark themes feel more premium, reduce eye strain when checking balances at night, and resemble modern fintech platforms (Apple Card, Revolut, Cash App).
- **Data Presentation**: **76.1%** favored visual cards, round badges, and color-coded progress bars over dense spreadsheet grids.

---

## 4. Key UX Personas & Behavioral Insights
1. **The Overwhelmed Saver (Age 22–27)**: Wants to save for a security deposit or trip, but forgets minor recurring micro-transactions (subscriptions, daily coffees). Needs effortless entry and visual budget bars.
2. **The Career Ascender (Age 28–35)**: Manages 2–3 credit cards to maximize cashback points, has disposable income, wants bird's-eye portfolio/wallet views, and appreciates clean, modern dark UI aesthetics.

---

## 5. Architectural & Design Decisions for MyBudget
Based on direct user survey data, the MyBudget app design incorporates:
- **Immediate Visual Anchor**: Central **Wallet Card** with live net balance (`$15,630.71`), maskable account numbers, and quick card switching.
- **Dual Visual Overview**: 
  - **Spending Pill Progress Bar** showing dynamic color-coded category proportions for the current month.
  - **Cash Back Tracker** displaying instant retail reward partner yields.
- **4-Tile Quick Action Grid**: Instant access to (1) QR Scanner, (2) Add Transaction (+), (3) Tips & Training, and (4) All Financial Services.
- **Frictionless Entry Modal**: Bottom sheet that pre-selects current timestamp, common expense categories, and accepts single-tap input.
