# Handover — solscan-mcp + Solana Explorer Web UI

> **For the next engineer (and for Claude Code).** This document captures the
> current state, how to run everything, decisions already made, known issues, and
> a prioritized roadmap toward a production-grade, professional setup.
>
> A separate **product/design spec** is maintained by the team outside this repo.
> Where this document and that spec disagree, the spec wins — reconcile before
> building. Ask the owner to link the spec when you start.

---

## 1. TL;DR — current state

| Area | Status | Notes |
|------|--------|-------|
| Rust MCP server (`solscan-mcp`) | ✅ Builds & runs | 37 tools over stdio, Rust 1.96 |
| MCP protocol handshake | ✅ Verified | `initialize` + `tools/list` + `tools/call` all respond |
| Solscan connectivity | ✅ Verified live | `chain_info` returns live chain data |
| Pro endpoints | ⚠️ Blocked by plan | Free key → `401 upgrade your api key level` (graceful) |
| Web UI (`web/frontend`) | ✅ Builds & runs | Vite + Vue 3, token-driven design system |
| API proxy (`web/server`) | ✅ Runs | Express, keeps key server-side |
| Tests / CI | ❌ None | See roadmap §6 |
| Docker | ❌ WIP | README says "available soon" |

Everything in the "✅ Verified" rows was exercised end-to-end, including
screenshots of the running web app (live data, error, validation, mobile states).

---

## 2. Repository layout

```
solscan-mcp/
├── CLAUDE.md              # Auto-loaded context for Claude Code
├── HANDOVER.md            # This file
├── README.md              # Original project README (install + usage)
├── TOOLS.md               # Reference for all MCP tools
├── Cargo.toml / .lock     # Rust crate manifest
├── src/
│   ├── main.rs            # Entry point: env key → serve over stdio
│   └── solscan_mcp/
│       ├── api.rs         # All 37 tools + request helpers + ServerHandler (~1480 lines)
│       └── requests/      # Request param structs, grouped by namespace
└── web/
    ├── server/            # Express proxy (SOLSCAN_API_KEY lives here, in .env)
    │   ├── index.js       # Allowlisted endpoints → Solscan
    │   └── .env.example
    └── frontend/          # Vite + Vue 3 app
        └── src/
            ├── styles/tokens.css   # Design tokens (primitive + semantic)
            ├── components/         # AppButton, AppInput, AppLink, DataTable, StatList
            ├── composables/useSolscan.js
            └── pages/ExplorerPage.vue
```

---

## 3. Architecture & key decisions

### 3.1 Why a proxy sits between the browser and Solscan
- The Rust MCP server communicates over **stdio**, so it is reachable by MCP
  clients (Claude Desktop, MCP Inspector) — **not** by a browser.
- The Solscan API key is a secret. Embedding it in the Vue bundle would leak it to
  anyone who opens devtools. The Express proxy holds the key and exposes only an
  allowlisted set of endpoints.

```
MCP client  ──stdio──▶  solscan-mcp (Rust)  ──▶  Solscan API
Browser (Vue) ─/api/*─▶ Express proxy (:8787) ──▶ Solscan API
```

### 3.2 Design system is token-driven
- All raw values (color/space/type/radius/motion) live once in
  `web/frontend/src/styles/tokens.css` as **primitive** tokens, aliased to
  intent-based **semantic** tokens. Components reference semantic tokens only.
- Rationale: single source of truth, theme-ability, and consistency — changing a
  brand color is a one-line edit.

### 3.3 Errors are surfaced, never swallowed or crashed
- Rust: failed requests return `McpError`; the server never panics on a bad call.
- Web: the proxy forwards Solscan's real HTTP status and message; the UI renders a
  visible error state (e.g. the 401 upgrade message) instead of failing silently.

---

## 4. How to run everything

### 4.1 Prerequisites
- Rust toolchain (installed via rustup, but **not on PATH** by default here):
  ```bash
  export PATH="$HOME/.rustup/toolchains/stable-aarch64-apple-darwin/bin:$PATH"
  ```
  Consider adding that line to `~/.zshrc`, or reinstall via the official
  `rustup-init` so the `~/.cargo/bin` shims are created.
- Node.js 20+ (verified on v24).
- A Solscan API key. A **Pro** key is required for token/account/tx endpoints; a
  free key only unlocks `chain_info`.

### 4.2 Rust MCP server
```bash
SOLSCAN_API_KEY=… cargo run            # or: cargo build && ./target/debug/solscan-mcp
```
Quick protocol smoke test (no MCP client needed):
```bash
printf '%s\n' \
'{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"t","version":"0"}}}' \
'{"jsonrpc":"2.0","method":"notifications/initialized"}' \
'{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
| SOLSCAN_API_KEY=… ./target/debug/solscan-mcp
```
Interactive: `npx @modelcontextprotocol/inspector ./target/debug/solscan-mcp`.

Wire into Claude Desktop — `claude_desktop_config.json`:
```json
{ "mcpServers": { "solscan-mcp": {
  "command": "/abs/path/target/debug/solscan-mcp",
  "args": [], "env": { "SOLSCAN_API_KEY": "…" } } } }
```

### 4.3 Web app (two terminals)
```bash
cd web/server   && npm install && cp .env.example .env  # add SOLSCAN_API_KEY
npm run dev                                              # http://localhost:8787
cd web/frontend && npm install && npm run dev            # http://localhost:5173
```
Stop background servers: `lsof -ti:5173,8787 | xargs kill`.

---

## 5. Known issues / tech debt

1. **Free-tier key blocks Pro endpoints.** Upgrade at https://solscan.io/apis to
   exercise token/account/tx tools. Not a code bug.
2. **`cargo` not on PATH** (rustup installed via Homebrew without shims).
3. **Dead code**: `TokenAccountsRequest`, `DefiActivitiesRequest` in
   `src/solscan_mcp/requests/account.rs` are unused (compiler warnings).
4. **`requests/` file naming is misleading** — `account.rs` actually holds token
   structs; modules don't match Solscan namespaces.
5. **`api.rs` is monolithic** (~1480 lines) — deliberate, but a barrier to scale.
6. **`api_key` is `Arc<Mutex<String>>`** though it never mutates — `Arc<String>`
   suffices.
7. **No tests, no CI, no Docker image** (Docker marked WIP in README).
8. **Web app is single-page** — design system + one example page only; no routing,
   no real token/account/tx pages yet.

---

## 6. Enhancement roadmap (toward professional / production)

Ordered by leverage. Each item is independently shippable.

### Phase 1 — Hardening & hygiene (low risk, high signal)
- [ ] Add `rustfmt` + `clippy` and a GitHub Actions CI (`fmt --check`, `clippy -D warnings`, `cargo build`).
- [ ] Remove dead structs (#3) or wire them to tools.
- [ ] Switch `Arc<Mutex<String>>` → `Arc<String>` for the key (#6).
- [ ] Add `.gitignore` coverage for `web/**/node_modules`, `.env`, `target/` (verify).
- [ ] Document required Solscan plan tier per tool in `TOOLS.md`.

### Phase 2 — Reliability of the MCP server
- [ ] Centralize request building (one helper) to kill the copy-paste in `api.rs`.
- [ ] Split `api.rs` into modules per Solscan namespace (token/account/nft/market/tx/block).
- [ ] Add typed error mapping: distinguish 401 (plan), 429 (rate limit), 5xx
      (upstream) into structured MCP errors with retry hints.
- [ ] Add client-side timeout + retry-with-backoff on the `reqwest` client.
- [ ] Unit tests with a mocked HTTP layer (e.g. `wiremock`) for happy/error paths.

### Phase 3 — Web app to a real product surface
- [ ] Add routing (Vue Router): Home, Token detail, Account, Transaction.
- [ ] Build a component showcase / Storybook (Histoire) covering every state for QA.
- [ ] Add the remaining proxy endpoints behind the allowlist as pages are built.
- [ ] Add request caching + loading skeletons already supported by components.
- [ ] Add automated a11y checks (axe-core / Playwright + @axe-core/playwright) in CI.
- [ ] Add unit/component tests (Vitest + @vue/test-utils) and E2E (Playwright).

### Phase 4 — Delivery & ops
- [ ] Finish the Docker image for the MCP server (multi-stage Rust build).
- [ ] Containerize the web app + proxy (compose file) for one-command local run.
- [ ] Secrets management: load keys from a vault/secret store, not plaintext `.env`.
- [ ] Add rate-limit handling + caching in the proxy to respect Solscan quotas.
- [ ] Publish: `cargo publish` for the MCP crate; versioned releases + changelog.

---

## 7. Working with Claude Code in this repo

- `CLAUDE.md` is loaded automatically and gives Claude the architecture, gotchas,
  and conventions. Keep it short and current.
- Point Claude at **your team's spec document** at the start of a session; it is
  the source of truth for product/design decisions and is not stored in this repo.
- Good first asks for Claude: "implement Phase 1 of the HANDOVER roadmap", or
  "add the Token detail page following the design tokens and existing components".
- Guardrails: do not commit/push or print the API key without explicit say-so;
  prefer extending the design tokens over introducing one-off styles.

---

## 8. Verification log (what was actually exercised)

- `cargo build` → success (2 dead-code warnings only).
- MCP `initialize` / `tools/list` (37 tools) / `tools/call` → all respond.
- `chain_info` via Rust server and via the Express proxy → live chain data.
- Pro endpoints (`token_meta`, `token_price`, `token_top`, `account_detail`) →
  `401 upgrade your api key level`, surfaced cleanly.
- `web/frontend` production build → success (`vite build`).
- Web app rendered (Playwright) in 4 states: live data, 401 error, input
  validation error, mobile (390px) — all correct.
