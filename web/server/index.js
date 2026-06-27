import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8787;
const API_KEY = process.env.SOLSCAN_API_KEY;

const PRO_BASE = "https://pro-api.solscan.io/v2.0";
const PUBLIC_BASE = "https://public-api.solscan.io";

if (!API_KEY) {
  console.error("[solscan-proxy] SOLSCAN_API_KEY is not set. Pro endpoints will fail with 401.");
}

// Allowlist of Solscan endpoints the frontend may reach. Keeping this explicit
// prevents the proxy from being abused as an open relay and documents the surface.
const ALLOWED = {
  "chain-info": { base: PUBLIC_BASE, path: "/chaininfo", params: [] },
  "token-meta": { base: PRO_BASE, path: "/token/meta", params: ["token_address"] },
  "token-price": { base: PRO_BASE, path: "/token/price", params: ["token_address", "from_time", "to_time"] },
  "token-top": { base: PRO_BASE, path: "/token/top", params: [] },
  "token-holders": { base: PRO_BASE, path: "/token/holders", params: ["token_address", "page", "page_size"] },
  "account-detail": { base: PRO_BASE, path: "/account/detail", params: ["address"] },
  "account-transactions": { base: PRO_BASE, path: "/account/transactions", params: ["address", "before", "limit"] },
};

const app = express();
app.use(cors());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(API_KEY) });
});

app.get("/api/:resource", async (req, res) => {
  const spec = ALLOWED[req.params.resource];
  if (!spec) {
    return res.status(404).json({ error: `Unknown resource '${req.params.resource}'` });
  }

  const url = new URL(spec.base + spec.path);
  for (const key of spec.params) {
    const value = req.query[key];
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  }

  try {
    const upstream = await fetch(url, { headers: { token: API_KEY ?? "" } });
    const text = await upstream.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
    // Forward Solscan's status so the frontend can render real error states
    // (e.g. 401 "upgrade your api key level") instead of crashing.
    res.status(upstream.status).json(body);
  } catch (err) {
    res.status(502).json({ error: "Upstream request failed", detail: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`[solscan-proxy] listening on http://localhost:${PORT}`);
});
