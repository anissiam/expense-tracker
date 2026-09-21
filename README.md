# Financial Reset Planner — Frontend

React 19 + Vite + TypeScript + Tailwind CSS single-page app for the Expense
Tracker. It provides the UI for budgets, categories, expenses, savings,
reports, smart AI insights, budget templates, monthly closing, accounts /
incoming income, and partner sharing.

The app is served by a small Express server (`server.ts`) that runs Vite in
middleware mode during development and also hosts the Gemini-powered
`/api/ai/*` endpoints. All business data is fetched from the Laravel API
(`backend/`), and authentication is brokered through Supabase Auth.

---

## Tech Stack

| Layer        | Choice                                                |
| ------------ | ----------------------------------------------------- |
| UI           | React 19, TypeScript 5.8                              |
| Build / Dev  | Vite 6, `tsx` (runs `server.ts`), esbuild (prod bundle) |
| Styling      | Tailwind CSS 4 (via `@tailwindcss/vite`)              |
| Server       | Express 4 (dev middleware + AI proxy endpoints)       |
| Data / API   | Laravel REST API over `fetch`                          |
| Auth         | Supabase Auth (GoTrue) bridged to Laravel Sanctum     |
| AI           | Google Gemini (`@google/genai`), rule-based fallback  |
| Charts/Icons | Recharts, lucide-react, motion                        |

---

## Features

- **Dashboard** — budget overview, spend vs. allocation, quick stats.
- **Monthly Budget Wizard** — create a budget cycle (salary / planned mode).
- **Category Management** — hierarchical categories + subcategories, icons/colors.
- **Expense Manager** — CRUD expenses, filter, assign categories.
- **Voice & AI expenses** — record or type a note; parse server-side into a
  structured expense for review (`/api/voice/parse`).
- **Smart Insights** — Gemini-generated (or rule-based) financial advice.
- **Savings Vault** — goals and deposit/withdraw transactions.
- **Budget Templates** — apply ready-made allocation schemes.
- **Monthly Closing** — close a cycle and carry the remainder to savings /
  next month / split.
- **Accounts & Incoming** — payment methods (wallets) and expected income.
- **Partner Sharing** — invite partners by email, roles (`owner`/`editor`/`viewer`),
  accept/decline invites via public deep links.
- **i18n + themes** — English/Arabic (RTL aware) plus light/dark theme, persisted
  in `localStorage`.

---

## Prerequisites

- **Node.js 20+** and **npm** (a `bun.lock` is also present; Docker uses Bun).
- The **Laravel backend** running (default `http://localhost:8000`).
- The **local Supabase stack** running for auth (default `http://127.0.0.1:54321`).
  See `supabase/config.toml` and the root `docker-compose.yml`.
- *(Optional)* A `GEMINI_API_KEY` for AI insights / categorization / voice
  transcription. Without it the AI endpoints fall back to rule-based logic.

---

## Getting Started (Development)

### 1. Install dependencies

```bash
npm install
# or: bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` (see [Environment Variables](#environment-variables)). For the
default local setup no changes are usually needed.

### 3. Start the backend + Supabase

From the repository root:

```bash
docker compose up --build          # starts Laravel API (:8080) + this frontend (:3000)
```

or, running the backend locally:

```bash
cd ../backend && composer run dev  # Laravel API on :8000
```

### 4. Start the frontend dev server

```bash
npm run dev
```

Open **http://localhost:3000**.

> Voice/microphone features require a secure context: use `localhost` or HTTPS,
> not a LAN IP over plain HTTP.

---

## Scripts

| Command           | What it does                                                                 |
| ----------------- | ---------------------------------------------------------------------------- |
| `npm run dev`     | Starts `server.ts` via `tsx`: Express + Vite HMR on port **3000**.           |
| `npm run build`   | `vite build` (client → `dist/`) then bundles `server.ts` → `dist/server.cjs`. |
| `npm start`       | Runs the production bundle (`node dist/server.cjs`) serving `dist/`.         |
| `npm run preview` | Vite preview of the built client.                                            |
| `npm run lint`    | **Typecheck only** (`tsc --noEmit`). There is no ESLint config.              |
| `npm run clean`   | Removes `dist/` and `server.js`.                                             |

---

## Testing

There is currently **no frontend unit/integration test runner** configured
(no Vitest/Jest). The frontend quality gate is the TypeScript typecheck:

```bash
npm run lint        # tsc --noEmit
```

Backend behavior is covered by PHPUnit in `../backend`:

```bash
cd ../backend && php artisan test
```

If adding tests, prefer **Vitest** (already compatible with the Vite setup) and
add a `test` script to `package.json` plus update this section.

### Manual smoke test checklist

1. Sign up / sign in (Supabase) → lands on the dashboard.
2. Create a budget via the Monthly Budget Wizard.
3. Add a category and an expense.
4. Add a savings goal and a deposit.
5. Run the monthly closing workflow.
6. Open Smart Insights (works without `GEMINI_API_KEY` via fallback).
7. Invite a partner and open the generated `/invite/:token` link while logged out.

---

## Environment Variables

All are optional locally; defaults target the local stack.

| Variable                   | Default                              | Purpose                                            |
| -------------------------- | ------------------------------------ | -------------------------------------------------- |
| `VITE_API_URL`             | `http://localhost:8000`              | Laravel API base URL.                              |
| `VITE_SUPABASE_URL`        | `http://127.0.0.1:54321`             | Supabase Auth (GoTrue) endpoint.                   |
| `VITE_SUPABASE_ANON_KEY`   | local publishable key                | Supabase public anon key.                          |
| `GEMINI_API_KEY`           | `MY_GEMINI_API_KEY`                  | Server-side only; enables real AI responses.       |
| `GEMINI_MODEL`             | `gemini-3.6-flash`                   | Override the Gemini model (Google retires models). |
| `APP_URL`                  | —                                    | Self-referential URL (used in hosted environments).|
| `DISABLE_HMR`              | —                                    | Set `true` to disable Vite HMR.                    |

> `.env` is gitignored; never commit real keys. `.env.example` is the template.

`VITE_*` values are inlined into the client bundle at build time — do not put
secrets in them.

---

## File Structure

```
frontend/
├── server.ts                 # Express server: serves SPA + /api/ai/* (Gemini)
├── vite.config.ts            # React + Tailwind plugins, @ alias, /api proxy
├── index.html                # HTML shell (fonts, root mount)
├── tsconfig.json             # TypeScript config (path alias @/*)
├── package.json              # Scripts + dependencies
├── Dockerfile                # Bun-based dev image (port 3000)
├── .env.example              # Env template (copy to .env)
├── metadata.json             # App metadata (AI Studio)
└── src/
    ├── main.tsx              # React entry point
    ├── App.tsx               # Auth gate, tab routing, layout
    ├── index.css             # Tailwind entry + global styles
    ├── types.ts              # Shared domain TypeScript types
    ├── vite-env.d.ts         # Vite env typing
    ├── context/
    │   └── ExpenseContext.tsx    # Global state: auth, data, i18n, theme
    ├── services/
    │   ├── apiService.ts         # All Laravel API calls + DTO mappers
    │   └── supabaseClient.ts     # Supabase client for auth
    ├── hooks/
    │   ├── useAudioRecorder.ts   # MediaRecorder wrapper
    │   └── useSpeechRecognition.ts
    ├── data/
    │   ├── currencies.ts         # Supported currency configs
    │   └── translations.ts       # en / ar dictionaries
    ├── utils/
    │   └── voiceCues.ts          # Voice recording cue sounds
    └── components/
        ├── Auth/                 # LoginView, UserProfileModal
        ├── Navigation/           # Navbar, Sidebar, RightBinderTabs
        ├── Dashboard/            # DashboardView, BudgetOverview
        ├── BudgetWizard/         # MonthlyBudgetWizard
        ├── Categories/           # CategoryManagement
        ├── Expenses/             # ExpenseManager, VoiceExpenseModal
        ├── Savings/              # SavingsVault
        ├── Templates/            # BudgetTemplatesView
        ├── Reports/              # ReportsView
        ├── SmartInsights/        # SmartInsightsView
        ├── ClosingWorkflow/      # MonthlyClosingModal
        ├── Accounts/             # AccountsIncomingView
        ├── Partners/             # PartnerManagement, InviteAcceptView
        └── Common/               # DynamicIcon
```

---

## Architecture & Data Flow

- **State** lives in a single React context: `src/context/ExpenseContext.tsx`.
  Components consume it via the `useExpense()` hook.
- **API access** is centralized in `src/services/apiService.ts`. It:
  - resolves the base URL from `VITE_API_URL`;
  - attaches the Bearer token from `localStorage` (`expense_tracker_token`);
  - maps backend **snake_case** responses to frontend **camelCase** types in
    `src/types.ts`.
- **Routing** is tab-based state in `App.tsx` (no router). Invite deep links are
  detected from `/invite/:token` or `?invite=:token`.
- **Auth flow**: the user authenticates with **Supabase Auth**, then the access
  token is exchanged with the Laravel API (`/api/auth/supabase/sync`), which
  creates the user and returns the API token used for all other calls.

### AI endpoints (served by `server.ts`, not Laravel)

| Endpoint               | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `GET  /api/health`     | Health check.                                            |
| `POST /api/ai/insights`| Budget insights (Gemini, or rule-based fallback).        |
| `POST /api/ai/categorize` | Auto-categorize an expense (Gemini, or keyword fallback). |
| `POST /api/ai/transcribe` | Gemini audio transcription fallback for voice notes.   |

All business data endpoints (`/api/budgets`, `/api/expenses`, `/api/savings`,
etc.) are handled by the **Laravel backend**. `vite.config.ts` proxies `/api`
to `VITE_API_URL` when running Vite directly; the app's `apiService` also calls
that base URL directly.

---

## Docker

From the **repository root** (`docker-compose.yml`) the frontend builds via
`frontend/Dockerfile` (Bun image) and runs `bun run dev` on port 3000 with the
source mounted for live reload.

```bash
docker compose up --build
```

To build the frontend image alone:

```bash
docker build -t expense-tracker-frontend .
docker run -p 3000:3000 expense-tracker-frontend
```

---

## Necessary Files for New Developers

| File                         | Purpose                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| `.env.example`               | Template for local config — copy to `.env`. Never commit `.env`. |
| `src/services/apiService.ts` | The entire backend contract + DTO mappers. Start here.       |
| `src/context/ExpenseContext.tsx` | Global app state, auth, i18n, theme.                    |
| `src/types.ts`               | Shared domain types used across the app.                     |
| `server.ts`                  | Express + Vite wiring and Gemini AI endpoints.               |
| `vite.config.ts`             | Aliases (`@/*`) and dev proxy.                               |
| `package.json`               | Scripts and dependency versions.                             |
| `../backend/README.md`       | API domain model, endpoints, and backend setup.              |
| `../AGENTS.md`               | Repo-wide commands, structure, and gotchas.                  |

---

## Conventions & Gotchas

- **Path alias**: `@/*` maps to the project root (see `tsconfig.json` +
  `vite.config.ts`).
- **No comments in source** unless they add real value; match existing style.
- **`npm run lint` is a typecheck**, not a linter. There is no ESLint/Prettier.
- **AI is optional**: without `GEMINI_API_KEY` the AI endpoints return rule-based
  results with `"confidence": "Rule-Based"`, so the UI still works.
- **Voice input** needs `localhost`/HTTPS; the Gemini transcription fallback
  needs `GEMINI_API_KEY`.
- **`index.html` intentionally patches `window.fetch`** to remain assignable —
  do not remove it.
- In Docker, `VITE_API_URL` is set to `http://backend:8000` (service DNS).
