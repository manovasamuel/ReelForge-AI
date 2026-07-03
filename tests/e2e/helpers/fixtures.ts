/**
 * Shared test fixtures & helpers for ReelForge AI e2e suite.
 */

export const VALID_INSTAGRAM_URLS = [
  "https://www.instagram.com/cristiano",
  "https://instagram.com/natgeo",
];

// URL with trailing query string — this must pass after BUG-RF-002 fix
export const VALID_URL_WITH_QUERY = "https://www.instagram.com/zuck/?hl=en";

// URL with igsh tracking param — mirrors mobile share links
export const VALID_URL_WITH_IGSH = "https://www.instagram.com/nasa?igsh=MTIzNDU2";

export const INVALID_URLS = [
  "not-a-url",
  "https://twitter.com/someuser",
  "https://instagram.com/",  // No username
  "ftp://instagram.com/user",
];

export const EMPTY_INPUT = "";

/** Timeout used for API-backed pipeline steps (mock responds in <2s) */
export const API_TIMEOUT = 15000;

/** Full pipeline timeout — covers all 9 phases end-to-end */
export const FULL_PIPELINE_TIMEOUT = 120000;
