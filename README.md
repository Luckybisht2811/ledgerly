# Ledgerly — Auto Expense Tracker from Bank SMS/Email
 
**Ledgerly** automatically extracts, categorizes, and visualizes your spending from bank SMS and transaction emails — no manual expense logging required.
 
> Most expense trackers fail for one simple reason: nobody wants to manually type "spent ₹200 on food" every single day. But your phone already receives a transaction SMS or email for *every* payment. Ledgerly reads that text, pulls out the amount and merchant, figures out the category automatically, and builds your monthly spending dashboard — with (almost) zero manual entry.
 
---
 
## The Problem
 
Every UPI/bank transaction generates an SMS or email like:
 
```
Rs.450.00 debited from A/c XX1234 on 04-Sep-26
to SWIGGY BANGALORE. UPI Ref No 123456789.
```
 
That text already contains everything needed to track an expense — the amount, the merchant, the date. Ledgerly parses it, categorizes it, and stores it, so the user never has to fill out a form.
 
## What Makes This Different
 
| Typical expense tracker | Ledgerly |
|---|---|
| User manually types amount + category for every transaction | User pastes the raw SMS/email text — the rest is automatic |
| Fixed, hardcoded categories | Rule-based engine that **learns** — correct a category once, it remembers that merchant forever |
| No idea what's recurring | Detects subscriptions automatically by finding merchants charged the same amount on a ~monthly cadence — a real interval-analysis algorithm, not a hardcoded list |
| Static budgets | Live budget tracking against real parsed spend, with automatic overspend flags |
 
## Key Features
 
- **SMS & Email parsing engine** — regex-based extraction of amount, merchant, date, and account, tuned to real Indian bank/UPI message formats (including `UPI/P2M/...` transaction references)
- **Rule-based auto-categorization** — merchant keyword matching across 8 categories (Food, Travel, Shopping, Bills, Entertainment, Health, Groceries, Other)
- **Self-learning corrections** — every manual category fix is saved per-merchant and reused automatically on future transactions
- **Duplicate detection** — the same SMS can't be added twice
- **Subscription detector** — groups transactions by merchant, checks amount consistency + charge interval, flags genuine recurring payments while ignoring one-off repeat purchases
- **Budget alerts** — per-category monthly limits with live spend tracking and overspend warnings
- **Dashboard** — category breakdown (pie), income vs. expense trend (line/bar), recent activity, all backed by MongoDB aggregation pipelines
## Tech Stack (MERN)
 
- **MongoDB** — Atlas-hosted, stores transactions, budgets, users, and learned category rules
- **Express.js** — REST API (auth, SMS/email parsing, transactions, budgets, dashboard aggregation)
- **React** (Vite) — dashboard UI, Tailwind CSS
- **Node.js** — backend runtime
## Project Structure
 
```
ledgerly/
├── backend/     Express API — parsing engine, categorization, auth, MongoDB models
└── frontend/    React dashboard — SMS/email input, charts, budgets, subscriptions
```
 
See `backend/README.md` and `frontend/README.md` for setup instructions specific to each.
 
## Quick Start
 
```bash
# Backend
cd backend
npm install
cp .env.example .env   # add your MongoDB URI and JWT secret
npm run dev             # http://localhost:5000
 
# Frontend (separate terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```
 
## Current Limitation — and the Roadmap
 
A browser can't read a phone's SMS inbox — that's a security restriction of every mobile OS, not a gap in this project. So in the current web version, the user pastes their SMS/email text manually into the app. Everything **after** that point — extraction, categorization, learning, duplicate detection, subscription detection — is fully automated.
 
**Phase 2 (planned): a lightweight Android app** using the `READ_SMS` permission (the same approach apps like Google Pay or the now-discontinued Walnut used) will read transaction SMS directly off the device and forward it to this same backend automatically — removing the manual paste step entirely and making the whole pipeline zero-touch.
 
## Author
 
Built by **Lalit Singh Bisht**.
 
