# Changelog

All notable changes to **ReelForge AI** will be documented in this file.

## [2.0.0] — 2026-07-05 (Official GA Release)

### Added & Hardened
- **v2.0 Phase 6 — Billing & GA Release**:
  - Integrated Stripe billing checkout and customer portal endpoints (`/api/billing/checkout`, `/api/billing/portal`, `/api/billing/summary`).
  - Added `UsageGuard` and `UsageRepository` with atomic SQL quota enforcement (`tryReserveScraperCall`, `refundScraperCall`) and monthly cycle reset.
  - Implemented Clerk authentication webhook and Stripe subscription webhook (`/api/webhooks/stripe`, `/api/webhooks/clerk`) with L1 memory and L2 PostgreSQL idempotency tracking (`stripe_webhook_events` table).
- **v2.0 Phase 5 — Multi-Model AI Intelligence Engine**:
  - Introduced `AIOrchestratorProvider` coordinating Google Gemini (`gemini-2.5-flash`), OpenAI (`gpt-4o-mini`), Anthropic Claude (`claude-3-5-sonnet`), and Deterministic Fallback.
  - Implemented `PromptBuilder` and `ResponseNormalizer` centralized layers.
  - Created `CircuitBreakerStore` with hybrid L1 in-memory and L2 Upstash Redis distributed circuit breaking (3 failures -> 60s cooldown).
  - Implemented `RateLimiter` edge middleware throttling (60 req/min in prod).
- **v2.0 Phase 4 — Hybrid Instagram Scraping Pipeline**:
  - Introduced `FailoverInstagramProvider` coordinating Apify, BrightData, RapidAPI, and MockInstagramProvider.
- **Production Hardening Sprint (Sprint 1 & Sprint 2)**:
  - Remediated all critical and high audit vulnerabilities (`SEC-001`, `SEC-002`, `SEC-003`, `DB-001`, `DB-002`, `REL-001`, `BILL-001`, `DEVOPS-001`).
  - Added `LifecycleManager` and `src/instrumentation.ts` for 10-second graceful container shutdown and PostgreSQL pool draining.

## [2.0.0-phase3] — 2026-07-04 (Workspace Cloud Migration)

### Added
- **v2.0 Phase 3 — Workspace Cloud Migration**:
  - **Asynchronous Provider Architecture**: Refactored `IProjectProvider` and `LocalProjectProvider` to return promises (`Promise<...>`) and standardized project IDs on UUID v4 (`crypto.randomUUID()`).
  - **Server-Side ProjectRepository**: Implemented centralized Drizzle ORM query layer (`src/lib/db/repositories/project.repository.ts`) with strict user isolation (`WHERE user_id = :userId`) and automatic normalization across all 9 phase tables.
  - **REST API Endpoints**: Created collection (`GET/POST /api/v2/projects`) and individual project (`GET/PUT/DELETE /api/v2/projects/[id]`) routes with built-in development identity resolution.
  - **Hybrid Provider with Offline Fallback**: Created `CloudProjectProvider` and `HybridProjectProvider` (`src/services/projects/providers/`). Automatically routes to Supabase PostgreSQL in authenticated production mode and seamlessly falls back to browser `localStorage` during offline or local development mode.
  - **Studio & Workspace Integration**: Upgraded `WorkspaceService` and Studio controller (`src/app/profiles/page.tsx`) to await asynchronous operations while preserving 100% of existing UI/UX.
  - **Database Schema Upgrades**: Generated Drizzle migration `drizzle/0001_bizarre_human_cannonball.sql` adding `metadata` and `state_snapshot` (JSONB) columns to the `projects` table.

## [1.3.0] — 2026-07-03 (MVP Release)

### Added
- **v1.3 Phase 12 — Settings & Provider Management Studio**:
  - Centralized dashboard controlling studio theme illumination (`Dark Mode`, `Light Mode`, `System Sync`) and brand accent highlights (`Purple`, `Blue`, `Emerald`).
  - Swappable provider layer controls with status badges (`Active`, `Available`, `Coming Soon`, `Not Configured`) for Instagram scraping backends and AI synthesis engines.
  - Workspace preferences for live auto-save toggling, startup landing view configuration, and recent project list limits.
  - Storage footprint breakdown telemetry across saved projects, export audit logs, and configuration payloads.
  - Destructive storage operations (`Clear Export History`, `Clear Workspace Projects`, `Reset Factory Storage`) gated behind explicit confirmation modals.
  - Developer runtime diagnostics (Build Type, Storage Engine, Active Providers, Schema Version, Mock Mode status, and Read-Only Feature Flags).
  - 1-click JSON Settings Backup and file-upload Restoration.
- **v1.2 Phase 11 — Export Center**:
  - Omnichannel export suite supporting `PDF Report` (via HTML+print stylesheet layout), `Markdown (.md)`, `Standalone HTML Page`, and `JSON State Backup`.
  - Granular intelligence scope filtering (`Executive Summary`, `Complete Report`, `Script Package`, `Repurpose Package`, `Raw Project`).
  - Quick export cards with instant download triggers and dedicated clipboard copy buttons.
  - Persistent Export Audit Log tracking file generation history up to 100 entries.
- **v1.1 Phase 10 — Project Workspace**:
  - Full client-side repository abstraction (`WorkspaceService` + `LocalProjectProvider`) storing complete multi-phase state snapshots in browser `localStorage`.
  - Interactive workspace dashboard with search, sorting (`Newest`, `Oldest`, `Name A-Z`, `Highest Virality`), renaming, duplicating, and deleting.
- **Phases 1–9 — Deterministic Social Intelligence Pipeline**:
  - Profile Ingestion & Validation (Phase 1)
  - Brand Intelligence Teardown (Phase 2)
  - Competitor Discovery (Phase 3)
  - Deep Profile Competitor Analysis (Phase 4)
  - Top Performing Content Collection (Phase 5)
  - Content Intelligence & Framework Breakdown (Phase 6)
  - Content DNA Blueprint & Executive Scorecard (Phase 7)
  - Screenplay & Script Generation Engine with Teleprompter Reading View (Phase 8)
  - Omnichannel Multi-Platform Repurpose Engine across 6 social platforms (Phase 9)

### Architecture & Engineering
- 100% Deterministic Client-Side Architecture running without external database dependencies or API keys.
- Strict Provider / Factory / Service layer decoupling ready for v2.0 real-world API drop-in replacements.
- Next.js 16 + React 19 + Tailwind CSS v4 sleek dark glassmorphism design system.
