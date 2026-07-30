# ReelForge AI: Page Architecture

This document defines the macro-level structure for the primary views within ReelForge AI. Consistency in page architecture reduces cognitive load as users navigate the app.

## 1. Global Application Shell (Dashboard)
The core authenticated experience wraps all pages in a consistent shell.
- **Left Sidebar:** Primary navigation (Home, Profiles, Blueprints, Studio, Settings). Collapsible to icons only for power users.
- **Top Header:** Contextual. Shows the currently active Profile, a global Command Palette trigger (Cmd+K), and user account actions.
- **Main Content Area:** The scrolling container for the specific page.

## 2. Landing Page
- **Hero Section:** Massive typography, vast whitespace, and a high-fidelity 3D WebGL/Video background showcasing the Intelligence Engine.
- **Social Proof:** Grayscale logos of platforms/brands.
- **Feature Zig-Zag:** Alternating text (left) and 3D asset (right) layout.
- **Footer:** Minimal, structured links.

## 3. Dashboard (Home)
- **Header:** "Welcome back, [Name]". 
- **Top Row (Metrics):** 4-column grid of key aggregated stats (Total Posts, Engagement Rate, etc.).
- **Middle Row:** Split 70/30. Left 70%: Recent AI Executions (Blueprint history). Right 30%: Upcoming scheduled tasks or notifications.

## 4. Blueprint Studio (Ideation & Editing)
This is the core working view of ReelForge. It requires maximum screen real estate.
- **Layout:** Three-pane structure (Linear-style).
- **Left Pane (Context):** The active Profile metrics and the currently loaded Knowledge Base snippets.
- **Center Pane (Workspace):** The primary ideation chat/command interface, or the multi-step node visualizer.
- **Right Pane (Output):** The generated Script/Caption document editor. This pane can be expanded to full-screen mode for focused writing.

## 5. Intelligence (Brand / Audience / Competitor)
These are data-heavy pages requiring structured hierarchy.
- **Header:** Sticky header with Tabs (Overview, Sentiments, Topics).
- **Content:** Card-based masonry layout or strict grid. Each card represents a specific AI insight (e.g., "Audience Sentiment on Pricing").

## 6. Settings
- **Layout:** Standard two-column structure.
- **Left Column:** Sticky vertical navigation list (Account, Billing, API Keys, Team).
- **Right Column:** The active form. Max-width bounded (`max-w-3xl`) to prevent form inputs from stretching infinitely.
