# ReelForge AI: Motion Storyboards

This document specifies the exact micro-interactions and macro-transitions across the platform. Future implementations must adhere strictly to these timings and triggers.

## 1. Landing Page: Hero Reveal
- **Trigger:** Initial Page Load.
- **Sequence:**
  1. Header navigation fades in (`duration-slow`, `ease-smooth`).
  2. Main Hero Headline translates up 20px and fades in (Delay: 100ms, `duration-slow`, `ease-spring`).
  3. 3D Engine Asset fades in and slowly rotates continuously (Delay: 300ms, `opacity` transition `duration-slow`, rotation is `linear` infinite).
- **Performance:** Ensure 3D asset is fully loaded before triggering fade to prevent popping.

## 2. Interactive Elements: Card Hover
- **Trigger:** Mouse Enter.
- **Action:** Scale to `1.02` and change background from `surface-default` to `surface-elevated` (or slightly lighter gray).
- **Easing:** `ease-spring`.
- **Duration:** `150ms`.
- **Mouse Leave:** Revert to default (`ease-smooth`, `150ms`).

## 3. AI Thinking State (Blueprint Generation)
- **Trigger:** User clicks "Generate".
- **Action:**
  1. The "Generate" button morphs into a loading state (width transitions to a square, icon becomes a spinner).
  2. The target output container (Empty State) is overlaid with a subtle, blurred purple gradient (`accent-glow`).
  3. The gradient pulses in opacity from `30%` to `60%`.
- **Easing:** `ease-in-out` for pulse.
- **Duration:** Pulse cycle `2000ms`, infinite until generation completes.

## 4. Modal / Dialog Entrance
- **Trigger:** User clicks a settings or confirmation action.
- **Backdrop:** Immediately fades in to `rgba(0,0,0,0.4)` with `backdrop-blur-sm` (`duration-fast`).
- **Dialog Box:** Starts at `scale(0.95)` and `opacity(0)`. Transitions to `scale(1)` and `opacity(1)`.
- **Easing:** `ease-spring`.
- **Duration:** `250ms`.

## 5. Page Transitions
- **Trigger:** Navigating between major dashboard sections (e.g., Profiles -> Blueprint Studio).
- **Action:** The incoming content container fades in and shifts up `10px`.
- **Easing:** `ease-smooth`.
- **Duration:** `200ms`.
- **Note:** Do NOT animate the sidebar or top navigation during page transitions. Only animate the main content area to maintain a stable application shell.

## 6. Success State (Toast Notification)
- **Trigger:** Data saved or AI generation successful.
- **Action:** Slides in from the bottom-right corner. Starts at `translateY(20px)` and `opacity(0)`.
- **Easing:** `ease-spring`.
- **Duration:** `300ms`.
- **Exit:** Waits 4000ms, then slides down and fades out (`ease-smooth`, `200ms`).
