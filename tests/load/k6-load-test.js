/**
 * K6 Load Test — ReelForge Platform Validation Sprint
 *
 * Tests the key API surface under realistic concurrent workloads.
 *
 * Scenarios:
 * 1. Workspace API (non-AI endpoints, target < 500ms P95)
 * 2. AI Health Check (monitoring endpoint)
 * 3. Publishing endpoints (latency under light load)
 *
 * Usage:
 *   k6 run tests/load/k6-load-test.js
 *
 * Prerequisites:
 *   npm install -g k6  (or use the k6 binary directly)
 *
 * Performance Targets (from architecture review):
 *   API Response     : P95 < 500ms (non-AI endpoints)
 *   Memory Retrieval : P95 < 300ms
 *   Dashboard Load   : < 2s
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";

// ─── Custom Metrics ────────────────────────────────────────────────────────
const apiLatency = new Trend("api_latency_ms", true);
const errorRate = new Rate("error_rate");
const requestCount = new Counter("request_count");

// ─── Configuration ────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  scenarios: {
    // Scenario 1: API Health & Non-AI Endpoints
    api_health: {
      executor: "constant-vus",
      vus: 5,
      duration: "30s",
      exec: "apiHealthScenario",
      tags: { scenario: "api_health" },
    },
    // Scenario 2: Publishing API (unauthenticated boundary check)
    publishing_boundary: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 5 },
        { duration: "20s", target: 10 },
        { duration: "10s", target: 0 },
      ],
      exec: "publishingBoundaryScenario",
      tags: { scenario: "publishing_boundary" },
    },
  },
  thresholds: {
    // P95 response time < 500ms for non-AI API endpoints
    "api_latency_ms{endpoint:health}": ["p(95)<500"],
    "api_latency_ms{endpoint:v2_health}": ["p(95)<500"],
    // Error rate should be < 1% (only expected errors: 401 on auth-gated routes)
    http_req_failed: ["rate<0.01"],
  },
};

// ─── Scenario: API Health ─────────────────────────────────────────────────
export function apiHealthScenario() {
  requestCount.add(1);

  // 1. Check AI health endpoint
  const aiHealthStart = Date.now();
  const aiHealthRes = http.get(`${BASE_URL}/api/ai/health`);
  const aiHealthDuration = Date.now() - aiHealthStart;
  apiLatency.add(aiHealthDuration, { endpoint: "health" });

  check(aiHealthRes, {
    "AI health returns 200 or 503": (r) => [200, 207, 503].includes(r.status),
    "AI health response is JSON": (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(aiHealthRes.status === 500 ? 1 : 0);

  sleep(0.5);

  // 2. Check v2 health
  const v2HealthStart = Date.now();
  const v2HealthRes = http.get(`${BASE_URL}/api/v2/health`);
  const v2HealthDuration = Date.now() - v2HealthStart;
  apiLatency.add(v2HealthDuration, { endpoint: "v2_health" });

  check(v2HealthRes, {
    "V2 health returns 200 or 503": (r) => [200, 503].includes(r.status),
  });

  errorRate.add(v2HealthRes.status === 500 ? 1 : 0);

  sleep(1);
}

// ─── Scenario: Publishing Auth Boundary ──────────────────────────────────
export function publishingBoundaryScenario() {
  requestCount.add(1);

  const fakeWorkspaceId = "00000000-0000-0000-0000-000000000000";

  // These should all return 401/302 — we're testing auth boundary under load
  const endpoints = [
    `/api/workspaces/${fakeWorkspaceId}/publishing/accounts`,
    `/api/workspaces/${fakeWorkspaceId}/publishing/drafts`,
    `/api/workspaces/${fakeWorkspaceId}/publishing/posts`,
    `/api/workspaces/${fakeWorkspaceId}/analytics`,
  ];

  for (const endpoint of endpoints) {
    const start = Date.now();
    const res = http.get(`${BASE_URL}${endpoint}`);
    const duration = Date.now() - start;

    apiLatency.add(duration, { endpoint: "publishing_boundary" });

    check(res, {
      "Auth boundary enforced (401/302/307)": (r) =>
        [401, 302, 307, 308].includes(r.status),
      "No 500 errors on auth boundaries": (r) => r.status !== 500,
      "No data leakage (not 200)": (r) => r.status !== 200,
    });

    errorRate.add(res.status === 500 ? 1 : 0);

    sleep(0.2);
  }

  sleep(0.5);
}

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    scenarios: data.metrics,
    thresholds_passed: Object.entries(data.metrics)
      .filter(([, m]) => m.thresholds)
      .every(([, m]) => Object.values(m.thresholds).every((t) => !t.ok === false)),
  };

  return {
    stdout: JSON.stringify(summary, null, 2),
    "tests/load/k6-results.json": JSON.stringify(data, null, 2),
  };
}
