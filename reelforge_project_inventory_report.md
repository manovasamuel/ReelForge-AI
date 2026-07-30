# ReelForge Project Inventory Report

## 1. Overall Architecture

ReelForge is built as a modern, high-performance web application designed for AI-driven content generation and strategic analysis.

- **Frontend**: Next.js (App Router) using React 18+. Styling is powered by Tailwind CSS with Radix UI (shadcn/ui) for accessible, unstyled components.
- **Backend**: Next.js Server Components and Serverless Route Handlers (`/api/v2/`).
- **Database**: Supabase (PostgreSQL) using pgBouncer for connection pooling. Handles relational data, user profiles, and project storage.
- **Authentication**: Supabase Auth (migrated from Clerk, though Clerk keys remain in the environment as legacy/fallback).
- **AIOS (AI Orchestration System)**: A custom, DAG-based multi-agent orchestration engine. Uses a `WorkflowStateManager` to route tasks through specialized agents (ScriptAgent, AuditAgent, etc.).
- **AI Providers**: Managed via an `AIClientFactory` and `ModelRouter`. Supports Groq (primary, ultra-low latency Llama 3), Gemini (reasoning/fallback), OpenRouter, and OpenAI.
- **External Services**: Apify and RapidAPI for scraping/data collection; Meta Graph API for Instagram publishing.
- **Media**: Supabase Storage for storing generated assets and temp files.
- **Deployment**: Vercel (frontend and serverless functions).

---

## 2. Folder Structure

```
ReelForge-AI/
├── src/
│   ├── app/                    # Next.js App Router Pages & API Routes
│   │   ├── (auth)/             # Authentication pages (sign-in, sign-up)
│   │   ├── api/                # Backend API Routes (e.g., /api/v2/workflow/run)
│   │   ├── audit/              # Profile Audit feature UI
│   │   ├── brands/             # Brand Management UI
│   │   ├── copilot/            # Interactive Studio Copilot UI
│   │   ├── profiles/           # Profile selection/creation UI
│   │   ├── workspace/          # Core workspace dashboard UI
│   │   ├── layout.tsx          # Root Layout
│   │   └── page.tsx            # Landing Page
│   ├── components/             # React Components (UI, Layout, Features)
│   │   ├── ui/                 # shadcn/ui generic components (buttons, dialogs)
│   │   ├── auth/               # Authentication components
│   │   ├── shared/             # Shared app components (navigation, headers)
│   │   ├── brand-intelligence/ # Feature specific components
│   │   ├── competitor-analysis/# Feature specific components
│   │   ├── copilot/            # Feature specific components
│   │   └── script-generation/  # Feature specific components
│   ├── services/               # Core Business Logic & External Integrations
│   │   ├── aios/               # AI Orchestration System (Agents, DAG, State)
│   │   ├── ai/                 # AI Provider Clients (Groq, Gemini) & Normalizers
│   │   ├── analytics/          # Data processing and metrics
│   │   ├── instagram/          # Instagram Graph API connectors
│   │   └── publishing/         # Publishing execution engine
│   ├── types/                  # TypeScript Domain Models & Interfaces
│   │   ├── database.ts         # Supabase Database Schema types
│   │   ├── script-generation.ts
│   │   └── brand-intelligence.ts
│   └── lib/                    # Utilities, DB clients, and Security
│       ├── supabase/           # Supabase client initialization
│       ├── security/           # Rate limiting and guards
│       └── reliability/        # Circuit breakers and retry logic
├── supabase/                   # Supabase configuration and DB Migrations
├── tests/                      
│   └── e2e/aios/               # Playwright E2E testing suite for AIOS
└── .env.local                  # Environment variables
```

---

## 3. Feature Inventory

### Brand Intelligence
- **Purpose**: Generates and manages the foundational brand voice, tone, industry position, and content pillars for a profile.
- **Status**: Implemented
- **Files used**: `src/components/brand-intelligence/*`, `src/services/brand-intelligence/*`, `src/types/brand-intelligence.ts`
- **Dependencies**: AIOS (`StrategyAgent`), Supabase

### Competitor Analysis
- **Purpose**: Discovers niche competitors and analyzes their strategies to identify gaps and opportunities.
- **Status**: Implemented
- **Files used**: `src/components/competitor-analysis/*`, `src/services/competitors/*`, `src/types/competitor-analysis.ts`
- **Dependencies**: AIOS (`CompetitorAgent`), Scraping APIs (Apify/RapidAPI)

### Script Generation
- **Purpose**: Generates highly engaging, hook-driven short-form video scripts and captions.
- **Status**: Implemented
- **Files used**: `src/components/script-generation/*`, `src/services/script-generation/*`, `src/types/script-generation.ts`
- **Dependencies**: AIOS (`ScriptAgent`, `HookAgent`, `CaptionAgent`)

### Content DNA & Intelligence
- **Purpose**: Analyzes historically successful posts to reverse-engineer winning hooks, structures, and CTA patterns.
- **Status**: Implemented
- **Files used**: `src/services/content-dna/*`, `src/types/content-dna.ts`
- **Dependencies**: Scraping APIs, AIOS (`ContentPlannerAgent`)

### Content Repurposing
- **Purpose**: Adapts existing content packages (scripts/captions) for other platforms like LinkedIn, X, and Threads.
- **Status**: Implemented
- **Files used**: `src/services/repurpose/*`, `src/types/repurpose.ts`
- **Dependencies**: AIOS (`StrategyAgent`)

### Interactive Studio Copilot
- **Purpose**: Provides a conversational UI for users to refine scripts, ask for alternative hooks, or tweak brand voice.
- **Status**: Implemented
- **Files used**: `src/app/copilot/*`, `src/components/copilot/*`
- **Dependencies**: AIOS (Direct LLM streaming)

### Publishing (Instagram)
- **Purpose**: Publishes generated content directly to connected Instagram accounts.
- **Status**: Backend Implemented (Mocked in tests)
- **Files used**: `src/services/instagram/*`, `src/services/publishing/*`
- **Dependencies**: Meta Graph API

---

## 4. AI Features

The platform utilizes a multi-agent system (AIOS). The agents are registered in `agent-registry.ts`.

- **AuditAgent**: Performs a comprehensive strategic audit of a user's Instagram profile.
- **CompetitorAgent**: Analyzes competitor profiles and extracts strategic insights (content pillars, strengths, weaknesses).
- **StrategyAgent**: Generates content strategies grounded in audit and competitor data.
- **ScriptAgent**: Generates full video scripts with a hook, body, and CTA based on specific constraints (e.g., length, topic).
- **CaptionAgent**: Generates optimized Instagram captions with appropriate emojis and character counts.
- **HookAgent**: Specializes purely in generating attention-grabbing, pattern-interrupt video hooks.
- **HashtagAgent**: Generates targeted hashtag sets for maximum reach and SEO value.
- **SEOAgent**: Analyzes and optimizes written content for algorithm discoverability.
- **ValidatorAgent**: Validates AI outputs against strict schemas and business rules, triggering retries if requirements fail.
- **ContentPlannerAgent**: Plans content calendars and multi-post campaigns based on Brand Intelligence.

**How they work**:
Users do not call agents directly. The user sends a request to the `AIOrchestratorService`, which classifies the intent, builds a DAG (Directed Acyclic Graph) of required tasks, and assigns tasks to specialized agents. Agents read input from a shared Memory Context (L0) and output structured JSON, normalized by the `ResponseNormalizer`.

---

## 5. APIs

- **Supabase**: 
  - *Why*: Core Database and Authentication.
  - *Current Usage*: Used for all CRUD operations (Profiles, Workspaces, Projects) and user sessions.
  - *Required*: Yes.
- **Groq API**:
  - *Why*: Ultra-low latency inference for simple and rapid generations (e.g., Llama-3.1).
  - *Current Usage*: Primary AI provider for script and caption generation.
  - *Required*: Yes.
- **Gemini API**:
  - *Why*: High-context and advanced reasoning tasks.
  - *Current Usage*: Secondary/Fallback AI provider.
  - *Required*: Optional but Highly Recommended.
- **OpenRouter API**:
  - *Why*: Fallback routing to various models (Hermes, Claude) if Groq/Gemini fail.
  - *Current Usage*: Fallback provider.
  - *Required*: Optional.
- **Clerk API**:
  - *Why*: Legacy Authentication.
  - *Current Usage*: Deprecated/Inactive (replaced by Supabase Auth).
  - *Required*: No.
- **Meta Graph API (Instagram/Facebook)**:
  - *Why*: Publishing content directly to user accounts.
  - *Current Usage*: `InstagramConnector` class, currently awaiting valid tokens.
  - *Required*: Yes (for publishing feature).
- **Apify / RapidAPI**:
  - *Why*: Scraping Instagram for competitor analysis and Content DNA.
  - *Current Usage*: Data ingestion layers.
  - *Required*: Yes (for intelligence features).

---

## 6. Database

Powered by PostgreSQL (via Supabase). Defined in `src/types/database.ts`.

**Core Tables & Relationships**:
- `users`: Core authentication identity.
- `profiles`: The primary entity. A user can have multiple profiles (e.g., personal, business).
- `workspaces`: A collaborative container linked to a profile.
- `projects`: Individual content pieces (reels, posts) linked to a workspace.
- `brand_intelligence`: 1:1 relationship with a profile, storing brand voice, audience, and pillars.
- `competitors`: 1:N relationship with a profile, storing tracked competitor handles and metrics.
- `content_dna`: Stores insights derived from scraping past successful content.

**Stored Data**:
JSONB is heavily utilized for flexible schema storage (e.g., storing the full generated script JSON inside a `project` row).

**Sessions/Cache**:
User sessions are managed by Supabase Auth JWTs. Orchestrator state (`WorkflowStateManager`) is currently in-memory but designed to be migrated to Redis.

---

## 7. UI Pages

- **`/` (Root)**: Landing Page / Marketing.
- **`/sign-in` & `/sign-up`**: Authentication.
- **`/profiles`**: Dashboard to view, select, or create a new Profile/Workspace.
- **`/workspace/[id]`**: Main dashboard for a specific workspace.
- **`/audit`**: UI for running and reviewing the initial Profile Audit.
- **`/brands`**: UI for reviewing and editing Brand Intelligence.
- **`/competitors`**: Competitor tracking and intelligence reports.
- **`/copilot`**: Interactive Studio Copilot for chat-based content generation.

---

## 8. User Flow

1. **Onboarding**: User navigates to the app and authenticates via Supabase Auth.
2. **Profile Creation**: User creates a Profile (e.g., "Tech Educator") and provides their Instagram handle.
3. **Intelligence Gathering**: 
   - User runs a Profile Audit to establish baselines.
   - User adds competitors, triggering scraping and Competitor Analysis.
   - User generates a Brand Intelligence report to lock in their brand tone and content pillars.
4. **Content Generation**: 
   - User opens a new Project (or uses the Copilot) and requests a "15-second hook about AI".
   - The AIOS kicks in, passing the request through the DAG (Strategy -> Hook -> Script -> Caption).
5. **Review & Refine**: The user reviews the generated `ReelContentPackage` in the UI and makes edits.
6. **Publishing**: User clicks publish, sending the media and caption through the `InstagramConnector` to the live Instagram Graph API.

---

## 9. Integrations

- **Supabase**: Postgres DB, Auth, Storage.
- **Groq**: Llama-3 AI inference.
- **Gemini (Google)**: Reasoning AI inference.
- **OpenRouter**: Backup AI routing.
- **Meta (Instagram/Facebook)**: Graph API for publishing.
- **Apify**: Scraper provider.
- **RapidAPI**: Fallback scraper provider.
- **Playwright**: E2E automated testing integration.

---

## 10. Current Roadmap

**Completed**:
- Initial Application Scaffolding (Next.js, Tailwind).
- Supabase Database Schema & Type Definitions.
- AIOS Architecture (Orchestrator, DAG Planner, specialized Agents).
- Provider Abstractions (Groq, Gemini, Fallbacks).
- Reliability Layer (Circuit Breakers, Retries).
- Test Suite Stabilization (100% Pass Rate in Playwright).

**In Progress**:
- Security Review (Validating API keys, secret management, and rate limiting).
- Performance Tuning (Reviewing telemetry to optimize AI inference and latency).

**Planned**:
- Instagram Integration (Configuring live access tokens).
- Redis Integration (Migrating `WorkflowStateManager` from in-process memory to Redis for durability).

**Future**:
- Mobile App / React Native wrapper.
- Video/Audio generation (Text-to-Speech, AI avatars).

---

## 11. Technical Debt

1. **In-Memory State**: `WorkflowStateManager` stores active orchestrations in an in-memory Map. This will cause data loss if the serverless function cold-starts or crashes. Must be migrated to Redis.
2. **Legacy Auth Remnants**: `.env.local` contains Clerk API keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`). Clerk was migrated out in favor of Supabase Auth, but traces might remain in the codebase or environment files.
3. **Mock Publishing Connector**: The publishing flow heavily relies on `MockConnector` for E2E testing because live Instagram tokens are missing. The `InstagramConnector` is written but completely unverified against the live Graph API.
4. **Database Test Seeding**: Tests currently inject a fake `profileId`. A robust DB seeding script is required for true E2E DB tests.
5. **JSON Schema Flexibility**: `ResponseNormalizer` was patched to return raw JSON for older MVP agents that don't pass a specific `schemaType`. These agents should be updated to use strict Zod schemas and validation.

---

## 12. Documentation

*This report is generated dynamically based on the current state of the ReelForge-AI source code as of July 2026.*
