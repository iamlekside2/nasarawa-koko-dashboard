# Nasarawa State — Koko PHC Dashboard

Read-only monitoring dashboard for the **Nasarawa State Government** over the Koko
PHC network. It consumes the existing **Calm Global / NEAS** backend (no new
backend service) and is auto-scoped to Nasarawa State for every request.

## Modules

1. **Hospitals & Facilities** — count by category (primary/secondary/tertiary/private),
   ownership, and reporting status (online now / silent > 1 week / > 1 month) + full list.
2. **Staff & Personnel** — total & online, by role (doctors/nurses/pharmacists/lab/admin/CHW),
   with a per-facility role drill-down.
3. **Store & Medication** — units in stock, distinct drugs, dispensed today, below-reorder,
   with a per-facility → per-drug drill-down.
4. **Diseases Treated** — total diagnoses, most-treated conditions, per-facility breakdown.
5. **Disease Mapping** — cases per LGA and a spread-over-time graph (week / month / year),
   filterable by condition.

Data is intentionally scoped to Nasarawa; where the demo EMR has no records yet
(staff, diagnoses), the UI shows honest "no data yet" empty states.

## Stack

Vite + React 18 + React Router 7 + Tailwind v4 + recharts. Poppins font.
Auth is a single shared **read-only** login against the Calm Global API (`/auth/login`);
the JWT is stored in `localStorage` and sent as a Bearer token to `/state/*`.

## Local development

```bash
npm install
npm run dev            # http://localhost:3013
```

Requires the Calm Global backend running locally on `http://localhost:4000/api`
(`VITE_API_BASE_URL` in `.env`).

Login: a shared read-only Nasarawa State account (credentials provided separately
by the platform administrator — not committed to this repo).

## Deploy (Vercel)

1. Push this repo to GitHub (see below).
2. In Vercel: **New Project → import the repo**. Framework preset **Vite**
   (build `npm run build`, output `dist`). `vercel.json` already handles SPA rewrites.
3. Set the environment variable:
   - `VITE_API_BASE_URL = https://neas-api.onrender.com/api`
   (this is baked in at build time; `.env.production` already sets it, but setting
   it in Vercel keeps it explicit).
4. Deploy. Note the assigned domain (e.g. `nasarawa-koko-dashboard.vercel.app`).

### Backend CORS (one-time)

The Calm Global backend allows origins via the `CORS_ORIGIN` env var on Render
(comma-separated). Add the Vercel domain to it and redeploy the backend:

```
CORS_ORIGIN=...existing...,https://<your-vercel-domain>
```

## Backend dependency

Endpoints live in the Calm Global backend under `modules/state-dashboard`
(`GET /state/facilities|staff|pharmacy|pharmacy/clinic/:id|diseases|diseases/map`).
They ship on both dialect branches (`main` = MSSQL, `demo-postgres` = Postgres/Render).
The deployed backend at `neas-api.onrender.com` runs `demo-postgres`.
