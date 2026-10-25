# Corizo UI/UX Design Course — Final Project
# Deliverable 4: Information Architecture & Core User Flows — “MyBudget”

## Executive Summary
This document establishes the structural backbone and behavioral interaction architecture for the **MyBudget** mobile finance app. By structuring content around user mental models rather than database schemas, MyBudget minimizes navigational depth, keeping core workflows within 1–2 taps of the central Home dashboard.

---

## 1. Information Architecture (IA) Site Map

```
                                 ┌─────────────────────────┐
                                 │     MyBudget App        │
                                 └────────────┬────────────┘
                                              │
        ┌───────────────────┬─────────────────┼─────────────────┬───────────────────┐
        │                   │                 │                 │                   │
┌───────▼───────┐   ┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐   ┌───────▼───────┐
│   Dashboard   │   │    Budgets    │ │ Transactions  │ │   Insights    │   │     More      │
│    (Home)     │   │   (Payment)   │ │  (Activity)   │ │  (Analytics)  │   │  (Services)   │
└───────┬───────┘   └───────┬───────┘ └───────┬───────┘ └───────┬───────┘   └───────┬───────┘
        │                   │                 │                 │                   │
        ├─ Wallet Card      ├─ Category Caps  ├─ Search Bar     ├─ Spending Trend   ├─ Profile Info
        │  (Balance, Card)  ├─ Progress Bars  ├─ Filter Tabs    │  (Area Graph)     ├─ Linked Cards
        ├─ Spending Pills   ├─ Alert Threshold│  (All, In, Out) ├─ Category Donut   ├─ Security
        ├─ Cash Back Hub    ├─ Auto-Budget    ├─ Date Grouping  ├─ Cash Flow        ├─ AI Heatmap
        ├─ Quick Actions    │  Toggle Switch  └─ Transaction    │  (In vs Out)      │  Inspection
        │  (QR, +, Tips)    └─ Adjust Modal      Detail Modal   └─ AI Smart Tips    └─ Logout
        └─ Refer & Earn
```

---

## 2. Core User Flows (Mermaid Flowcharts)

### User Flow 1: Adding a New Expense Transaction (Primary Interaction)
This flow represents the highest-frequency task in the app, optimized for completion in under 4 seconds.

```mermaid
flowchart TD
    A([User Opens App / Home Dashboard]) --> B{Entry Point Selection}
    B -->|Quick Action Grid| C[Tap '+' Icon Tile]
    B -->|Wallet Card| D[Tap '+' Add Card / Fund]
    B -->|Bottom Bar| E[Tap 'Transactions' -> Add]
    
    C --> F[Bottom Sheet Modal Appears]
    F --> G[Enter Amount via Numeric Keypad]
    G --> H[Select Type: Expense vs. Income]
    H --> I[Tap Category Pill: Food, Shopping, Transport, etc.]
    I --> J[Optional: Add Merchant Name or Note]
    J --> K[Tap 'Confirm & Save' Button]
    
    K --> L[State Recalculation Engine]
    L --> M[Update Total Wallet Balance]
    L --> N[Update Spending Pill Progress Bar]
    L --> O[Update Category Budget Limit Remaining]
    O --> P([Success Haptic & Toast Notification])
```

---

### User Flow 2: Setting and Adjusting a Monthly Budget
Ensures users can effortlessly establish financial guardrails and toggle automated budgeting rules.

```mermaid
flowchart TD
    A([User Taps 'Budgets' on Bottom Nav]) --> B[View All Active Category Budgets]
    B --> C[Inspect Visual Progress Bars & Threshold Status]
    C --> D{User Action}
    
    D -->|Toggle Automation| E[Flip 'Auto-Budgeting' Switch]
    E --> F[AI dynamically recalculates caps based on 3-month rolling median]
    
    D -->|Manual Cap Edit| G[Tap on Category Card e.g., 'Dining & Food']
    G --> H[Open 'Adjust Budget' Dialog]
    H --> I[Slide Cap Slider or Enter New Dollar Target]
    I --> J[Set Push Alert Threshold: 70%, 80%, or 90%]
    J --> K[Tap 'Update Category Cap']
    
    K --> L[Live Progress Bar Recalibrates]
    L --> M([Display New Remaining Allowance & Status Badge])
```

---

### User Flow 3: Reviewing Spending Insights & AI Recommendations
Guides the user through macro-financial trends, category distribution, and actionable money-saving micro-lessons.

```mermaid
flowchart TD
    A([User Taps 'Insights' on Bottom Nav]) --> B[Render Interactive Analytics Screen]
    B --> C[View Spending Trend Area Chart / Weekly Delta]
    B --> D[View Category Distribution Donut Chart]
    B --> E[Scroll to AI Financial Intelligence Cards]
    
    E --> F{Select Insight Action}
    F -->|Read Actionable Tip| G[Tap 'Learn More' on High Dining Warning]
    G --> H[Open Financial Literacy Drawer in 'Tips & Training']
    
    F -->|Export Financial Report| I[Tap 'Export Monthly Statement']
    I --> J([Generate PDF / CSV Financial Summary])
```

---

## 3. Wireframing Strategy: Mid-Fidelity vs. High-Fidelity

### Mid-Fidelity Wireframes (Structural & Ergonomic Focus)
- **Grid Layout**: 8pt soft grid layout tailored for standard mobile screen widths (375px – 430px).
- **Z-Pattern & F-Pattern Scanning**:
  - Primary focal anchor at top: Profile, Search, and Quick Indicators.
  - Secondary focal anchor: Elevated Wallet card with large typographic balance (`$15,630.71`).
  - Tertiary anchor: 2-column comparison cards (Spending vs Cash Back).
  - Quadrant grid for one-thumb action triggers.
- **Ergonomics**: Bottom navigation bar positioned precisely within the natural thumb sweep zone (bottom 25% of the mobile viewport).

### High-Fidelity UI Implementation
- **Theme**: Deep space dark aesthetic (`#0c0c0e` base, `#18181b` card elevation, `#27272a` borders).
- **Color Accents**:
  - Purple (`#8b5cf6`): Primary brand identity, balance emphasis.
  - Coral Pink (`#f43f5e`): Dining & impulse alerts.
  - Emerald Green (`#10b981`): Income, positive savings, cashback.
  - Amber Yellow (`#f59e0b`): Warning thresholds, utilities.
  - Electric Blue (`#3b82f6`): Investments, tech subscriptions.
- **Micro-Interactions**: Smooth card scale transitions, spring-loaded modal sliding, active tab glowing pill indicators.
