# Corizo UI/UX Design Course — Final Project
# Deliverable 2: Competitive Analysis Report — “MyBudget” Mobile Finance App

## Executive Summary
To position **MyBudget** effectively in the mobile personal finance ecosystem, a comprehensive competitive analysis was conducted examining leading direct and indirect competitors: **Mint (Intuit / Credit Karma)**, **YNAB (You Need A Budget)**, **Revolut**, and **PocketGuard**.

By analyzing their feature sets, information architectures, onboarding journeys, pricing models, and usability drawbacks, we identified critical market gaps that MyBudget exploits: **zero-cognitive-overload visual budgeting**, **instant transaction entry**, **embedded financial literacy (Tips & Training)**, and a **modern, minimalist dark-mode fintech aesthetic**.

---

## 1. Competitor Landscape Overview

```
                        HIGH AUTOMATION / INTELLIGENCE
                                     │
                                     │   ★ MyBudget (Target Position)
                     Revolut         │
                                     │      PocketGuard
                                     │
    COMPLEX UI /                     │                     INTUITIVE /
    HIGH FRICTION ───────────────────┼──────────────────── LOW FRICTION
                                     │
                      YNAB           │
                                     │   Mint (Historical)
                                     │
                        MANUAL / HIGH RULES OVERHEAD
```

---

## 2. In-Depth Competitor Evaluation

### 2.1 Mint (Intuit / Migrated to Credit Karma)
- **Strengths**: Broad account syncing with North American banks; automatic categorization; credit score monitoring.
- **Weaknesses / Critical Gaps**:
  - Shut down standalone app in 2024 and forced migration to Credit Karma, alienating millions of loyal users.
  - Aggressive advertising for third-party credit cards, personal loans, and insurance bloated the dashboard.
  - Slow sync refresh rates (often taking 24–48 hours to reflect recent transactions).
  - Outdated, cluttered UI with poor visual hierarchy.

### 2.2 YNAB (You Need A Budget)
- **Strengths**: Cult-like methodology based on the "Give Every Dollar A Job" zero-based budgeting system; strong desktop web app.
- **Weaknesses / Critical Gaps**:
  - Extremely steep learning curve; users report needing 2–3 weeks and reading manuals just to grasp basic workflows.
  - High friction for quick on-the-go entries.
  - Expensive subscription model ($14.99/month or $99/year), which deters young professionals and students.
  - Text-heavy, utilitarian mobile interface that lacks modern visual gratification.

### 2.3 Revolut
- **Strengths**: Exceptional dark-mode visual design, multi-currency support, instant peer-to-peer transfers, modern typography.
- **Weaknesses / Critical Gaps**:
  - Primary focus is banking, crypto, and stock trading rather than disciplined personal budgeting.
  - Budgeting features are buried 3 levels deep under analytics submenus.
  - Overwhelming array of secondary features (commodities, eSIM, lounge passes, insurance) dilutes core expense tracking.

### 2.4 PocketGuard
- **Strengths**: "In My Pocket" calculation showing remaining spendable cash after bills and savings goals.
- **Weaknesses / Critical Gaps**:
  - Rigid algorithms that fail when income or expenses fluctuate mid-month.
  - Uninspired UI styling with rigid card layouts.
  - Frequent bank disconnection errors and sluggish transaction classification.

---

## 3. Feature Comparison Matrix

| Feature / Dimension | Mint (Credit Karma) | YNAB | Revolut | PocketGuard | **MyBudget (Our App)** |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Aesthetic / Theme** | Cluttered Light | Dense Utility | Sleek Dark | Flat Generic | **Premium Sleek Dark (OLED-Optimized)** |
| **Quick Action Floating / Bar** | ❌ None | ⚠️ Multi-tap | ⚠️ Buried | ⚠️ Basic | **✅ 1-Tap Central Floating & Quick Grid** |
| **Visual Category Spending Bar** | ❌ Text Bars | ❌ Dense Tables| ⚠️ Basic Pie | ⚠️ Simple Ring | **✅ High-Contrast Segmented Color Pills** |
| **Consolidated Multi-Card Wallet** | ⚠️ Text List | ❌ Not visual | ✅ Digital Card | ❌ Basic List | **✅ Visual Gradient Card with Switcher** |
| **Cashback / Retail Rewards Hub** | ❌ Spam Ads | ❌ None | ⚠️ Merchant list| ❌ None | **✅ Direct Partner Badges (Netflix/Nike/etc)** |
| **Integrated Financial Literacy** | ❌ External links| ⚠️ Paid courses| ⚠️ Crypto quiz | ❌ None | **✅ "Tips & Training" Built-in Modules** |
| **QR Code Quick Scanning** | ❌ None | ❌ None | ✅ Payments only| ❌ None | **✅ 1-Tap QR Scanner Tile** |
| **Cognitive Load on Entry** | High (5+ fields) | Very High | Medium | Medium | **Ultra-Low (< 5 seconds per entry)** |
| **Interactive AI Attention Heatmap**| ❌ None | ❌ None | ❌ None | ❌ None | **✅ Integrated Attention Insight Mode** |

---

## 4. SWOT Analysis: MyBudget

### Strengths
1. **Unmatched Visual Appeal**: Sleek dark aesthetic with high-contrast color pills creates an engaging, dopamine-positive experience for financial management.
2. **Instant Cognitive Relief**: A single glance communicates net available wallet balance, spending burn rate, and cashback rewards without reading spreadsheets.
3. **Rapid 1-Tap Entry**: Ergonomically placed action tiles minimize touch travel on mobile screens.
4. **All-in-One Utility**: Blends spending tracking, budgeting limits, QR interactions, and financial literacy into a cohesive mobile interface.

### Weaknesses
1. Early stage: Requires user familiarity with dark-mode aesthetic.
2. Integration dependency: Real-world automatic bank sync requires Open Banking / Plaid APIs.

### Opportunities
1. Capture the massive cohort of displaced Mint users seeking a clean, ad-free alternative.
2. Target Gen-Z and Millennial professionals who prioritize minimalist digital experiences (mimicking Apple Wallet, Linear, Notion).
3. Partner with digital platforms for automated cashback tracking.

### Threats
1. Legacy traditional banks (Chase, Bank of America, Monzo) continuously revamping their native mobile apps.
2. Market saturation of generic budget tracker clones.

---

## 5. Strategic Differentiation & Core Value Propositions
To win against competitors, MyBudget anchors on three design pillars:
1. **The "Glanceable Wallet" Paradigm**: Replacing infinite lists with a tangible digital card and segmented color pill bars.
2. **Actionable Over Historical**: Shifting from passive historical reporting to real-time threshold warnings and actionable micro-tips.
3. **Ergonomic Mobile-First Design**: Bottom-sheet interactions, prominent touch targets, and full Capacitor native cross-platform support.
