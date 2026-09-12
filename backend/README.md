# Ledgerly — Backend

Node.js + Express + MongoDB backend for **Ledgerly**, an auto expense tracker
that parses bank/UPI SMS text and categorizes transactions using a
regex + rule-based engine (no ML model, no external API calls).

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in your MongoDB URI and JWT secret
node scripts/testConnection.js   # sanity-check the Atlas connection before running the full server
npm run dev             # starts on http://localhost:5000
```

Requires a running MongoDB instance — either local (`mongod`) or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster (recommended, since it works
the same locally and once deployed).

`scripts/testConnection.js` connects, does a real write + read + delete against your
cluster, and prints a clear reason if it fails (bad auth vs IP not allowlisted vs
wrong connection string) — run this first any time the DB won't connect.

## API Reference

All routes except `/api/auth/*` require a JWT: `Authorization: Bearer <token>`

| Method | Route                      | Description                                      |
|--------|-----------------------------|---------------------------------------------------|
| POST   | `/api/auth/signup`          | Create account, returns token                     |
| POST   | `/api/auth/login`           | Login, returns token                               |
| POST   | `/api/sms/parse`             | Body: `{ text }` — parses & saves transaction(s)  |
| GET    | `/api/transactions?month=YYYY-MM` | List transactions, optional month filter    |
| PATCH  | `/api/transactions/:id`     | Body: `{ category }` — correct a category (this also teaches the rule engine) |
| DELETE | `/api/transactions/:id`     | Delete a transaction                               |
| GET    | `/api/dashboard/summary?month=YYYY-MM` | Category totals for pie chart          |
| GET    | `/api/dashboard/months`     | Distinct months that have data, for the filter dropdown |

## Example: parsing an SMS

```bash
curl -X POST http://localhost:5000/api/sms/parse \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text": "Rs.450.00 debited from A/c XX1234 on 04-Sep-26 to SWIGGY BANGALORE. UPI Ref No 123456789."}'
```

Response:
```json
{
  "message": "1 transaction(s) added, 0 duplicate(s) skipped, 0 unparsed",
  "added": [
    {
      "amount": 450,
      "merchant": "SWIGGY BANGALORE",
      "category": "Food",
      "type": "debit",
      "confident": true,
      "date": "2026-09-04T00:00:00.000Z"
    }
  ]
}
```

## How categorization works

`services/categorizer.js` checks, in order:
1. **Learned rules** — merchant → category mappings the user has manually
   corrected before (stored in `CategoryRule`). These always win.
2. **Default keyword rules** — a curated list per category (e.g. `SWIGGY`,
   `ZOMATO` → Food). See `DEFAULT_RULES` in the same file.
3. Falls back to `"Other"` and flags `confident: false` so the frontend can
   highlight it for the user to review.

This is intentionally rule-based rather than ML-based: it's deterministic,
needs no training data, runs in microseconds, and every classification is
explainable ("SWIGGY matched the Food keyword list").

## Folder structure

```
backend/
├── config/db.js              MongoDB connection
├── models/                   Mongoose schemas
├── services/                 Pure logic: SMS parsing + categorization
├── controllers/               Route handlers
├── routes/                    Express routers
├── middleware/auth.js         JWT verification
└── server.js                  App entry point
```
