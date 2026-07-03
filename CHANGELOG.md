# Changelog

All notable changes to **ReelForge AI** will be documented in this file.

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
