# ReelForge AI v2.0 — Enterprise Social Intelligence & Studio Pipeline

ReelForge AI is an advanced social media intelligence platform and screenplay generation studio built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, **Drizzle ORM**, **Supabase PostgreSQL**, and **Clerk Authentication**. It deconstructs viral Instagram strategies, computes Content DNA blueprints, generates frame-by-frame production scripts, adapts content across 6 social platforms, persists full workspace repositories, and compiles executive reports.

---

## 🚀 Architecture & Provider Layer

ReelForge AI v2.0 implements a strict decoupled **Provider / Factory / Service** architecture. Every subsystem is abstracted via clean TypeScript interfaces, allowing zero-friction drop-in replacement of client-side deterministic engines with real-world external APIs.

```
UI Components
      │
      ▼
Service Layer (Static Orchestrators)
      │
      ▼
Provider Factory (Singleton Gateways)
      │
      ▼
Provider Interfaces (ISettingsProvider / IProjectProvider / IExportProvider)
      │
      ▼
Cloud Providers (Supabase PostgreSQL / Clerk Auth / Drizzle ORM)
```

---

## ✨ Key Platform Modules (v2.0 Phase 1 & 2)

### 1. Enterprise Authentication & Security (Phase 2)
- **Clerk Authentication Layer**: Complete Sign-In, Sign-Up, and User Profile management integrated with Next.js 16 App Router.
- **Dual-Mode Execution**: Automatically operates in **Development Placeholder Mode** (`dev@reelforge.ai`) when live Clerk API keys are absent, guaranteeing zero interruption for local builds and E2E testing.
- **Edge Route Protection**: Next.js Edge Middleware protecting Studio (`/profiles`), Workspace (`/workspace`), Export Center (`/export`), and Settings (`/settings`).
- **Real-Time Webhook Synchronization**: Cryptographically verified Svix webhook receiver (`/api/webhooks/clerk`) synchronizing user identities, subscriptions, usage counters, and user preferences directly into Supabase PostgreSQL.

### 2. Cloud Foundation & Persistence (Phase 1)
- **Drizzle ORM & Supabase PostgreSQL**: Complete production database schema covering 16 tables (`users`, `user_preferences`, `subscriptions`, `usage`, `audit_logs`, `projects`, `profile_analyses`, `brand_reports`, `competitors`, `competitor_analyses`, `collected_content`, `content_intelligence`, `content_dna`, `generated_scripts`, `repurpose_packages`, and `exports`).
- **Connection Pooling**: Server-side query execution via `postgres.js` with direct port connections for Drizzle Kit schema migrations.
- **Diagnostic Endpoint**: Real-time system health check monitoring database ping latency and environment configuration at `/api/v2/health`.

### 3. Studio Analysis Pipeline (Phases 1–9)
- **Profile Ingestion & Brand Teardown**: Extracts target niche, core audience, brand tone, and content pillars.
- **Competitor Benchmarking**: Discovers top competitors and performs comparative viral frame teardowns.
- **Content DNA Blueprint**: Computes sample virality, reusability indexes, dominant hooks, CTAs, and psychology triggers.
- **Studio Script Generator**: Produces frame-by-frame Reel scripts with timestamps, B-roll cues, audio notes, and a **Teleprompter Reading View**.
- **Omnichannel Repurpose Engine**: Automatically adapts winning formulas for **Instagram**, **LinkedIn**, **X (Twitter Threads)**, **Threads**, **Facebook**, and **YouTube Shorts**.

### 4. Project Workspace (v2.0 Phase 3 Cloud Migration)
- **Cloud & Hybrid Persistence**: Asynchronous repository layer (`ProjectRepository`) backed by Supabase PostgreSQL and Drizzle ORM with strict user isolation (`WHERE user_id = :userId`).
- **Hybrid Fallback Provider**: Automatically selects `CloudProjectProvider` in authenticated production mode and seamlessly falls back to `LocalProjectProvider` (`localStorage`) in offline mode or during development.
- **Normalized Phase Syncing**: Asynchronously indexes all 9 pipeline phases into secondary database tables without blocking workspace UI operations.
- **Management Hub**: Search, sort (`Newest`, `Oldest`, `Name A-Z`, `Highest Virality`), rename, duplicate, and delete analyses.
- **Storage Telemetry**: Real-time quota tracking and storage usage stats.

### 5. Export Center (Phase 11)
- **Omnichannel Formatter**: Export any analysis into **PDF Document**, **Markdown (`.md`)**, **Standalone HTML Page**, or **JSON State Backup**.
- **Custom Scopes**: Filter exports by `Executive Summary`, `Complete Report`, `Script Package`, or `Repurpose Package`.

### 6. Settings & Provider Management (Phase 12)
- **Provider Studio**: Configure active data ingestion backends and AI synthesis providers.
- **Appearance Control**: Switch illumination themes (`Dark`, `Light`, `System`) and brand accents (`Purple`, `Blue`, `Emerald`).
- **Backup Suite**: Export and import complete application configuration files as JSON.

---

## 🛠️ Getting Started & Cloud Setup

First, install dependencies and configure your local environment:

```bash
npm install
cp .env.example .env.local
```

### Database & ORM Commands (Drizzle Kit)
ReelForge AI v2.0 uses **Drizzle ORM** and **PostgreSQL** (hosted on Supabase) for cloud persistence.
- **Generate Migrations:** `npm run db:generate`
- **Apply Migrations:** `npm run db:migrate`
- **Launch Database Studio:** `npm run db:studio`

### Running Local Development & Diagnostics
```bash
npm run dev
```
Open [http://localhost:3000/profiles](http://localhost:3000/profiles) to launch the studio.
To verify database connection health and system status, visit the diagnostic endpoint:
- [http://localhost:3000/api/v2/health](http://localhost:3000/api/v2/health)

### Running Production Verification Build
```bash
npm run build
```

---

## 🗺️ Roadmap & Release Status (v2.0.0 GA)
All phases of the ReelForge AI v2.0 enterprise architecture and production hardening sprint have been successfully completed, audited, and verified:
- **Phase 1 (Complete):** Cloud Foundation (Drizzle ORM, Supabase PostgreSQL Schema, Connection Pooling, Health Check).
- **Phase 2 (Complete):** Authentication Foundation (Clerk Auth, Edge Middleware, Webhook Sync, User Schema, Placeholder Dev Mode).
- **Phase 3 (Complete):** Workspace Cloud Migration (Asynchronous Provider Architecture, Drizzle ORM ProjectRepository, User Isolation, Hybrid Provider with LocalStorage Fallback).
- **Phase 4 (Complete):** Hybrid Instagram Scraping Pipeline (FailoverInstagramProvider with Apify, BrightData, RapidAPI, and Mock fallback).
- **Phase 5 (Complete):** Multi-Model AI Intelligence Engine (AIOrchestratorProvider coordinating Gemini, OpenAI, Claude, and Deterministic fallback; PromptBuilder & ResponseNormalizer; CircuitBreakerStore).
- **Phase 6 (Complete):** Billing & GA Release (Stripe Subscriptions, Customer Portal, UsageGuard atomic SQL quota enforcement, Clerk/Stripe Webhook idempotency tracking).
- **Production Hardening Sprint (Complete):** Remediated all critical/high audit vulnerabilities (`SEC-001` through `DEVOPS-001`), integrated sliding-window rate limiting, and implemented 10s graceful container shutdown (`LifecycleManager`).

