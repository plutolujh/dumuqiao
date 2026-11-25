/**
 * Standalone Cloudflare Web Analytics proxy.
 *
 * Split out of tide's sync-server.js (2026-11-25) so dumuqiao's dashboard
 * no longer depends on the tide project at runtime:
 *   - READ-ONLY: it never spawns sync-all.js, never writes to Supabase
 *   - own directory, own systemd unit, own config file
 *   - a crash here cannot affect tide's sync trigger or the blog pipeline
 *
 * GET /api/analytics?days=7   -> Cloudflare RUM stats
 * GET /health                 -> liveness probe
 *
 * Pure Node (no dependencies): nothing to npm install, nothing to break.
 */

import { createServer } from "http";
import { readFileSync } from "fs";

// Config precedence:
//   1. process.env                       (systemd EnvironmentFile)
//   2. /etc/analytics-api/analytics.env  (dedicated file)
//
// This service reads ONLY its own config file. It deliberately does not read
// /var/www/tide/.env: that file holds the Supabase, MiniMax and sync
// credentials, and this endpoint is publicly reachable, so it must not be
// able to read them even if it were compromised.
const CONFIG_FILES = ["/etc/analytics-api/analytics.env"];

const env = { ...process.env };
for (const src of CONFIG_FILES) {
  try {
    for (const line of readFileSync(src, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      if (!env[k]) env[k] = t.slice(i + 1).trim();
    }
    break; // first readable file wins
  } catch {
    // not present -- try the next source
  }
}

const ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID || "";
const SITE_TAG = env.WA_SITE_TAG || "";
const TOKEN = env.CLOUDFLARE_API_TOKEN || "";
const PORT = Number(env.PORT || 3002);
const GRAPHQL = "https://api.cloudflare.com/client/v4/graphql";

// Cloudflare GraphQL queries cost quota, so cache briefly: a dashboard
// reload or a crawler must not burn API calls.
const CACHE_TTL_MS = 60_000;
const cache = new Map();

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "public, max-age=60",
  });
  res.end(payload);
}

function buildQuery(start, end) {
  return `query {
    viewer {
      accounts(filter: { accountTag: "${ACCOUNT_ID}" }) {
        total: rumPageloadEventsAdaptiveGroups(limit: 1, filter: { siteTag: "${SITE_TAG}", datetime_geq: "${start}", datetime_leq: "${end}" }) { count sum { visits } }
        paths: rumPageloadEventsAdaptiveGroups(limit: 30, filter: { siteTag: "${SITE_TAG}", datetime_geq: "${start}", datetime_leq: "${end}" }, orderBy: [sum_visits_DESC]) { count sum { visits } dimensions { requestPath requestHost refererHost deviceType userAgentBrowser countryName } }
        devices: rumPageloadEventsAdaptiveGroups(limit: 10, filter: { siteTag: "${SITE_TAG}", datetime_geq: "${start}", datetime_leq: "${end}" }, orderBy: [sum_visits_DESC]) { count sum { visits } dimensions { deviceType } }
        browsers: rumPageloadEventsAdaptiveGroups(limit: 10, filter: { siteTag: "${SITE_TAG}", datetime_geq: "${start}", datetime_leq: "${end}" }, orderBy: [sum_visits_DESC]) { count sum { visits } dimensions { userAgentBrowser } }
        countries: rumPageloadEventsAdaptiveGroups(limit: 10, filter: { siteTag: "${SITE_TAG}", datetime_geq: "${start}", datetime_leq: "${end}" }, orderBy: [sum_visits_DESC]) { count sum { visits } dimensions { countryName } }
        daily: rumPageloadEventsAdaptiveGroups(limit: 100, filter: { siteTag: "${SITE_TAG}", datetime_geq: "${start}", datetime_leq: "${end}" }, orderBy: [date_ASC]) { count sum { visits } dimensions { date } }
      }
    }
  }`;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/health") {
    return json(res, 200, {
      status: "ok",
      service: "analytics-api",
      configured: Boolean(TOKEN && SITE_TAG && ACCOUNT_ID),
    });
  }

  if (url.pathname === "/api/analytics") {
    if (!TOKEN || !SITE_TAG || !ACCOUNT_ID) {
      return json(res, 500, { error: "Cloudflare credentials not configured" });
    }

    const days = Math.min(Math.max(parseInt(url.searchParams.get("days") || "7", 10) || 7, 1), 30);
    const end = new Date().toISOString().slice(0, 13) + ":00:00Z";
    const start = new Date(Date.now() - days * 86400000).toISOString().slice(0, 13) + ":00:00Z";
    const cacheKey = `${days}:${start}:${end}`;

    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      return json(res, 200, hit.body);
    }

    try {
      const r = await fetch(GRAPHQL, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: buildQuery(start, end) }),
      });
      const data = await r.json();
      if (data.errors) {
        return json(res, 502, { error: "Cloudflare GraphQL error", detail: data.errors });
      }
      const acc = data.data.viewer.accounts[0];
      const body = {
        siteTag: SITE_TAG,
        range: { start, end, days },
        totalVisits: acc.total?.[0]?.sum?.visits ?? 0,
        paths: acc.paths || [],
        devices: acc.devices || [],
        browsers: acc.browsers || [],
        countries: acc.countries || [],
        daily: acc.daily || [],
      };
      cache.set(cacheKey, { at: Date.now(), body });
      return json(res, 200, body);
    } catch (e) {
      return json(res, 502, { error: e.message });
    }
  }

  return json(res, 404, { error: "Not found" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[analytics-api] listening on 127.0.0.1:${PORT}`);
  console.log(
    `[analytics-api] account=${ACCOUNT_ID ? "set" : "missing"} siteTag=${SITE_TAG ? "set" : "missing"} token=${TOKEN ? "set" : "missing"}`
  );
});
