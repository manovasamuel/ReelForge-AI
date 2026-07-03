# ReelForge AI v1.3.0 — Deterministic Social Intelligence & Studio Pipeline

ReelForge AI is an advanced, deterministic social media intelligence platform and screenplay generation studio built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**. It deconstructs viral Instagram strategies, computes Content DNA blueprints, generates frame-by-frame production scripts, adapts content across 6 social platforms, persists full workspace repositories, and compiles executive reports—all strictly inside your browser using heuristic algorithms and client-side storage.

---

## 🚀 Architecture & Provider Layer

ReelForge AI v1.3.0 implements a strict decoupled **Provider / Factory / Service** architecture. Every subsystem is abstracted via clean TypeScript interfaces, allowing zero-friction drop-in replacement of client-side deterministic engines with real-world external APIs in v2.0.

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
Local Providers (Browser localStorage / Deterministic Heuristics)
```

---

## ✨ Key Platform Modules (v1.3.0 MVP)

### 1. Studio Analysis Pipeline (Phases 1–9)
- **Profile Ingestion & Brand Teardown**: Extracts target niche, core audience, brand tone, and content pillars.
- **Competitor Benchmarking**: Discovers top competitors and performs comparative viral frame teardowns.
- **Content DNA Blueprint**: Computes sample virality, reusability indexes, dominant hooks, CTAs, and psychology triggers.
- **Studio Script Generator**: Produces frame-by-frame Reel scripts with timestamps, B-roll cues, audio notes, and a **Teleprompter Reading View**.
- **Omnichannel Repurpose Engine**: Automatically adapts winning formulas for **Instagram**, **LinkedIn**, **X (Twitter Threads)**, **Threads**, **Facebook**, and **YouTube Shorts**.

### 2. Project Workspace (Phase 10)
- **Persistent Local Repository**: Automatically saves live studio progress and analytical teardowns to browser storage.
- **Management Hub**: Search, sort (`Newest`, `Oldest`, `Name A-Z`, `Highest Virality`), rename, duplicate, and delete analyses.
- **Storage Telemetry**: Real-time quota tracking and storage usage stats.

### 3. Export Center (Phase 11)
- **Omnichannel Formatter**: Export any analysis into **PDF Document** (via HTML+Print stylesheet), **Markdown (`.md`)**, **Standalone HTML Page**, or **JSON State Backup**.
- **Custom Scopes**: Filter exports by `Executive Summary`, `Complete Report`, `Script Package`, or `Repurpose Package`.
- **Audit Log**: Persistent history of previously generated reports.

### 4. Settings & Provider Management (Phase 12)
- **Provider Studio**: Configure active data ingestion backends and AI synthesis providers with status indicators (`Active`, `Coming Soon`, `Not Configured`).
- **Appearance Control**: Switch illumination themes (`Dark`, `Light`, `System`) and brand accents (`Purple`, `Blue`, `Emerald`).
- **Workspace & Storage**: Configure auto-save rules, default startup landing views, and confirmation-gated destructive storage resets.
- **Backup Suite**: Export and import complete application configuration files as JSON.

---

## 🛠️ Getting Started

First, install dependencies and run the local development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/profiles](http://localhost:3000/profiles) with your browser to launch the 4-way platform studio (`Studio` | `Workspace` | `Export Center` | `Settings`).

### Running Production Verification Build

```bash
npm run build
```

---

## 🗺️ Roadmap to v2.0
With v1.3.0 frozen as the stable MVP release, ReelForge AI v2.0 will introduce:
- **Real Instagram Data Ingestion**: Integration with Apify Residential Scrapers & BrightData Web Unlocker.
- **External LLM Synthesis**: Integration with Google Gemini 2.5 Flash, OpenAI GPT-4o, and Anthropic Claude 3.5 Sonnet.
- **Cloud Persistence**: Database migration to Supabase / PostgreSQL with multi-user authentication.
