# Solana Explorer — Vite + Vue 3 frontend

Token-driven UI for a Solana blockchain explorer, implementing the design system
brief (dark theme, semantic tokens, WCAG 2.2 AA). Data comes from Solscan through
a small Express proxy that keeps the API key server-side — the browser never sees it.

```
web/
├── server/      Express proxy (holds SOLSCAN_API_KEY, allowlisted endpoints)
└── frontend/    Vite + Vue 3 app (design tokens + tokenized components)
```

## Architecture

```
Browser (Vue)  ──/api/*──▶  Vite dev proxy  ──▶  Express (:8787)  ──token header──▶  Solscan API
```

Why a proxy: MCP servers speak stdio (not HTTP), and putting a Solscan key in
frontend code would leak it. The proxy solves both.

## Run

Two terminals.

**1. Proxy**
```bash
cd web/server
npm install
cp .env.example .env        # then put your real SOLSCAN_API_KEY in .env
npm run dev                 # http://localhost:8787
```

**2. Frontend**
```bash
cd web/frontend
npm install
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173. Network status (chain-info) works on any key;
token lookup needs a **Solscan Pro** key (free keys return 401, rendered as an
error state).

## Design system

- `frontend/src/styles/tokens.css` — primitive + semantic tokens (the only place
  raw hex/px live). Components reference `var(--…)` semantic tokens only.
- Components (`AppButton`, `AppInput`, `AppLink`, `DataTable`, `StatList`) define
  default / hover / focus-visible / active / disabled / loading / error states,
  with keyboard + pointer + touch behavior and long-content/empty handling.
- Accessibility: global `:focus-visible` ring, skip link, semantic table/list
  markup, `role="alert"` errors, `prefers-reduced-motion` support.
