# CLAUDE.md

Context for Claude Code working in this repository. Read this first, then see
[HANDOVER.md](HANDOVER.md) for the full state, decisions, and enhancement roadmap.

## What this repo is

Two things live here:

1. **`solscan-mcp`** (Rust) — a Model Context Protocol server exposing the Solscan
   Pro API as 37 MCP tools over **stdio**. Source in `src/`.
2. **`web/`** — a Vite + Vue 3 explorer UI (`web/frontend`) plus an Express proxy
   (`web/server`) that keeps the Solscan key server-side. Added as a reference
   implementation of the token-driven design system.

## Architecture (must understand before changing data flow)

- The MCP server speaks **stdio JSON-RPC**, not HTTP. Browsers cannot call it
  directly — that is why `web/server` exists as an HTTP proxy.
- The Solscan API key is a **secret**. It MUST stay server-side (Rust env var or
  `web/server/.env`). Never put it in frontend code or commit it.
- Data flow for the web app: `Vue → /api/* (Vite proxy) → Express :8787 → Solscan`.

## Key facts / gotchas

- `cargo`/`rustc` are installed via rustup but **not on PATH**. Use:
  `export PATH="$HOME/.rustup/toolchains/stable-aarch64-apple-darwin/bin:$PATH"`
- The available Solscan key is **free tier**: only `chain_info` (public API) works.
  All `/v2.0/*` Pro endpoints return `401 "upgrade your api key level"`. This is
  expected, not a bug — the code handles it gracefully.
- `src/solscan_mcp/api.rs` is intentionally one large file (~1480 lines). The
  author treats MCPs as "useful scripts"; see README "Code quality Notes".
- Two known dead-code warnings: `TokenAccountsRequest`, `DefiActivitiesRequest`
  in `src/solscan_mcp/requests/account.rs` (structs not wired to any tool).
- No tests and no CI exist yet.

## How to run

```bash
# MCP server (smoke test)
export PATH="$HOME/.rustup/toolchains/stable-aarch64-apple-darwin/bin:$PATH"
SOLSCAN_API_KEY=… cargo run

# Web app (two terminals)
cd web/server   && npm install && npm run dev   # :8787, needs .env
cd web/frontend && npm install && npm run dev    # :5173
```

## Conventions

- Rust: idiomatic, errors returned as `McpError` — never panic on a failed request.
- Vue: components consume **semantic design tokens** from
  `web/frontend/src/styles/tokens.css` only — no raw hex/px in component styles.
- Every interactive component defines default/hover/focus-visible/active/disabled/
  loading/error states and is keyboard accessible (WCAG 2.2 AA target).

## Working agreement

- Confirm before committing, pushing, or rotating/printing the API key.
- When the user references "the spec" or "the spec document", ask them to point you
  to it — a collaborator maintains a separate spec outside this repo.
