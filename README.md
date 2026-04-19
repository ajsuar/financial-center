# Financial Center

A comprehensive personal finance app for managing transactions, budgets, savings, investments, goals, net worth, and shared couple finances — all local, no cloud required.

## Setup (Fresh Clone)

```bash
# 1. Install dependencies (also auto-generates Prisma client)
npm install

# 2. Create the database and seed sample data
npm run setup

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Database Commands

| Command | Description |
|---|---|
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:reset` | Wipe and re-seed the database |

## Tech Stack

- **Next.js 16** (App Router, React Server Components, Server Actions)
- **TypeScript** strict mode
- **Tailwind CSS v4** with dark zinc palette
- **Prisma v7** + libsql adapter (SQLite, local file `dev.db`)
- **Recharts** for all charts
- **shadcn/ui**-style Radix UI components
- **Sonner** for toast notifications

## Features

- Dashboard with net worth, budget ring, spending charts, goal cards
- Transactions with categories, recurring rules, filters
- Accounts (checking, savings, investment, credit, cash)
- Envelope budgets with progress tracking
- Savings rate + emergency fund calculator
- Goals with milestone celebrations and what-if simulator
- Investment portfolio with holdings and allocation chart
- Net worth trend tracking with monthly snapshots
- Subscriptions tracker with audit view
- Reports & analytics (12-month trends, category breakdowns)
- Couple Hub — money dates, financial harmony score, shared goals, check-ins
- Settings for household members and categories
