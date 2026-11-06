# LoanWise AI – AI-Based Loan Eligibility & Risk Assessment System

> **Institutional-Grade FinTech Decision-Support Platform**  
> Powered by Deterministic Financial Calculation Engines & Google Gemini 3.8 Flash Explainable AI.

---

## 1. Project Overview & Problem Statement

In conventional retail lending, loan applicants frequently submit hard applications to multiple banks without knowing their realistic approval odds. Each formal submission triggers a **hard inquiry** across credit bureaus (e.g., CIBIL, Experian, Equifax), directly depressing their credit score and creating a negative cycle of loan rejections. Furthermore, standard banking credit models act as opaque "black boxes," leaving rejected applicants with zero actionable clarity on *why* they were flagged or *how* to improve.

**LoanWise AI** solves this critical problem by providing an institutional-grade, risk-free pre-underwriting assessment system. By evaluating an applicant's net cashflows, pre-existing debt obligations, living expenses, and credit vintage, LoanWise AI calculates exact Debt-to-Income (DTI), Fixed Obligation to Income Ratio (FOIR), and disposable income buffers. It then pairs these deterministic numbers with **Google Gemini 3.8 Flash** to generate transparent, explainable factor breakdowns and personalized financial recovery roadmaps.

---

## 2. Core Capabilities & Key Features

1. **Deterministic Financial Math Engine**
   - **Total Net Monthly Income:** Base salary + verified additional cashflows.
   - **Pre-Loan Debt-to-Income (DTI):** `(Existing EMI / Total Income) * 100`.
   - **Disposable Income Pre-Loan:** Total Income - Living Expenses - Existing EMIs.
   - **Projected Monthly EMI:** Computed via standard amortization:
     $$\text{EMI} = \frac{P \cdot r \cdot (1 + r)^n}{(1 + r)^n - 1}$$
   - **Post-Loan Debt Burden (FOIR):** `((Existing EMI + New EMI) / Total Income) * 100`.
   - **Affordability Ceiling:** Computes maximum safe affordable loan principal under a conservative 50% FOIR limit.

2. **Explainable AI Credit Risk Underwriting**
   - Evaluates applicant risk index (0–100) and categorizes into **Low Risk**, **Moderate Risk**, or **High Risk**.
   - Outputs eligibility classification: **Likely Eligible**, **Needs Financial Review**, or **Potentially Not Affordable**.
   - Transparent factor breakdowns identifying exact **Positive**, **Neutral**, and **Negative** credit drivers.
   - Strictly objective: excludes protected demographic characteristics (race, gender, religion, caste).

3. **Executive FinTech Dashboard**
   - KPI metrics: Total Assessed, Low/Moderate/High counts, Average Bureau Score, and Total Volume.
   - Recharts visual analytics: Risk profile donut chart, monthly underwriting trends, and credit score tiers.
   - Live recent assessment dossiers table with one-click report viewers.

4. **Multi-Step Applicant Underwriting Wizard**
   - 4-step guided dossier: Personal, Financial, Credit History, and Loan Parameters.
   - Real-time pre-assessment calculation bar updating DTI, new EMI, and FOIR live as inputs change.
   - Client-side validation ensuring zero negative values and valid bureau boundaries (300–900).
   - Instant Demo Applicant pre-filler supporting 5 fictional profiles (Rajesh, Priya, Vikram, Ananya, Suresh).

5. **"Ask LoanWise AI" Conversational Advisor**
   - Context-aware financial advisory powered by Gemini 3.8 Flash.
   - Retains current applicant dossier context (income, DTI, credit score, proposed EMI, FOIR).
   - Interactive prompt chips for exploring tenure adjustments, affordability checks, and credit repair tips.

6. **Interactive Loan & Tenure Simulator**
   - Real-time sliders for Loan Amount (₹50k to ₹50L), Tenure (6 to 120 months), and APR (6% to 24%).
   - Dual-scenario comparison (Scenario A vs. Scenario B) with side-by-side EMI difference, total interest saved, and AI recommendation.

7. **Institutional PDF Dossier Export & Print**
   - Generates formatted multi-page PDF credit evaluation dossiers via `jsPDF`.
   - Includes applicant summary, financial indicators, risk index gauge, factor breakdown, and educational disclaimer.
   - Native browser printing stylesheet support.

---

## 3. Technology Stack & Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                           LOANWISE AI CLIENT                          │
│     React 19 • TypeScript • Tailwind CSS • Lucide Icons • Recharts    │
│  - 4-Step Wizard      - Live Executive Dashboard   - Loan Simulator   │
│  - PDF Dossier Engine - Interactive AI Advisor     - Risk Analytics   │
└──────────────────────────────────┬────────────────────────────────────┘
                                   │ REST API Calls (/api/*)
                                   ▼
┌───────────────────────────────────────────────────────────────────────┐
│                         NODE.JS / EXPRESS BACKEND                     │
│  - Deterministic Financial Engine (DTI, FOIR, Amortization Math)      │
│  - System Diagnostics & Health Telemetry                              │
│  - Pre-seeded In-Memory Store & Optional Mongoose ODM Integration     │
└───────────────────┬─────────────────────────────────┬─────────────────┘
                    │                                 │
                    ▼                                 ▼
┌──────────────────────────────────────┐    ┌──────────────────────────┐
│         GOOGLE GEMINI API            │    │     MONGODB DATABASE     │
│   Model: 'gemini-3.8-flash'          │    │   Optional Atlas/Local   │
│   SDK: @google/genai                 │    │   Fallback to in-memory  │
│   Explainability & Advisory Chat     │    │   pre-seeded store       │
└──────────────────────────────────────┘    └──────────────────────────┘
```

---

## 4. REST API Documentation

### System & Health
- `GET /api/system/status`: Returns database status (MongoDB vs. Local Demo Mode), Gemini AI configuration status, and active model name.

### Applicants
- `GET /api/applicants`: Returns list of all registered applicants.
- `POST /api/applicants`: Registers a new applicant profile.
- `GET /api/applicants/:id`: Fetches specific applicant by ID.
- `DELETE /api/applicants/:id`: Deletes applicant profile and associated assessments.

### Underwriting & Assessments
- `GET /api/assessments`: Retrieves all historical assessment records.
- `GET /api/assessments/:id`: Retrieves full assessment dossier by ID.
- `DELETE /api/assessments/:id`: Deletes assessment record.
- `POST /api/ai/analyze`: Deterministically computes metrics and generates explainable credit risk report via Gemini 3.8 Flash.
- `POST /api/ai/chat`: Context-aware conversational financial advisory session.
- `GET /api/dashboard/stats`: Returns aggregated dashboard statistics, distributions, and recent assessments.
- `POST /api/reset-data`: Restores initial dataset with 5 standard fictional applicants.

---

## 5. Pre-Seeded Demonstration Profiles

| Applicant | Monthly Income | Expenses / EMI | Credit Score | Requested Loan | Delays | Risk Category |
|---|---|---|---|---|---|---|
| **Rajesh Kumar** | ₹80,000 | ₹20k / ₹5k EMI | 790 (Prime) | ₹5,00,000 (36m) | 0 | **Low Risk** |
| **Priya Sharma** | ₹35,000 | ₹18k / ₹8k EMI | 620 (Subprime) | ₹8,00,000 (48m) | 3 | **Moderate / High** |
| **Vikram Aditya** | ₹1,20,000 | ₹35k / ₹10k EMI | 850 (Tier-1) | ₹10,00,000 (60m) | 0 | **Low Risk** |
| **Ananya Patel** | ₹45,000 | ₹25k / ₹15k EMI | 580 (Subprime) | ₹7,00,000 (36m) | 5 + 1 Def | **High Risk** |
| **Suresh Menon** | ₹65,000 | ₹22k / ₹7k EMI | 730 (Good) | ₹3,00,000 (24m) | 1 | **Low / Moderate** |

---

## 6. Installation & Local Development

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### Setup Steps
1. Clone or extract the project repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` (refer to `.env.example`):
   ```env
   GEMINI_API_KEY="your_gemini_api_key"
   PORT=3000
   MONGODB_URI="" # Optional: If omitted, runs in resilient in-memory local mode
   ```
4. Start the full-stack development server:
   ```bash
   npm run dev
   ```
5. Open your browser at `http://localhost:3000`.

---

## 7. Educational & Regulatory Disclaimer

**LoanWise AI** is an educational decision-support web application designed to demonstrate the application of artificial intelligence and deterministic financial algorithms in credit underwriting. It does **not** claim to provide official credit approvals, access official credit bureau databases, or guarantee loan sanctions or interest rates from commercial banking institutions or NBFCs.
