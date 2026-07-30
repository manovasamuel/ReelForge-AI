# ReelForge AI: Component Specifications

This document defines the strict usage rules, anatomy, and behavior of core UI components before they are implemented in React.

---

## 1. Primary Button
- **Purpose:** The single most important action on a screen (e.g., "Generate Blueprint").
- **Anatomy:** `radius-md` (8px), `space-4` horizontal padding, `h-10` (40px) height. Uses `text-sm` `font-medium`.
- **Variants:** Default (Solid Accent), Destructive (Solid Red), Disabled.
- **States:** 
  - **Hover:** Scale `1.02`, Opacity `0.9`, cursor `pointer`.
  - **Active:** Scale `0.98`.
  - **Disabled:** `opacity-disabled` (0.5), cursor `not-allowed`.
- **Interaction Rules:** Never place two Primary Buttons adjacent to each other.
- **Anti-patterns:** Do not use for navigation links. Do not use all-caps text.

---

## 2. Standard Card
- **Purpose:** Grouping related data (e.g., an Audience Sentiment profile).
- **Anatomy:** `radius-lg` (12px), `border-thin`, `surface-default` background, `space-6` padding.
- **Variants:** Interactive (clickable), Static.
- **Hover Behavior (Interactive Only):** Background shifts to `surface-elevated`. No vertical translation.
- **Responsive Behavior:** Width spans 100% of parent container. Padding reduces to `space-4` on mobile viewports.

---

## 3. Command Palette (Omnibar)
- **Purpose:** Rapid keyboard navigation and AI querying.
- **Anatomy:** Centered modal `max-w-2xl`. Input field uses `text-lg`. Search results list below.
- **States:** 
  - **Closed:** `opacity(0) scale(0.95) pointer-events-none`.
  - **Open:** `opacity(1) scale(1) backdrop-blur`. Focus is automatically trapped in the input.
- **Accessibility:** Must close on `Escape`. Must trap focus so Tab navigates results. `aria-modal="true"`.

---

## 4. Blueprint Node (Workflow Graph)
- **Purpose:** Visually represent a step in the AIOS DAG.
- **Anatomy:** A compact card containing an Icon, Label (e.g., "Generate Script"), and a Status Indicator (Pending, Running, Complete, Failed).
- **Animation Behavior:** 
  - When "Running", the border gently pulses with `accent-glow`.
  - When transitioning from "Running" to "Complete", the border flashes Success Green (`150ms`) before fading back to `border-thin`.
- **Anti-patterns:** Do not fill the entire background of the node with color based on status. Keep it minimal; rely on the border and icon.

---

## 5. Input Field
- **Purpose:** Text data entry.
- **Anatomy:** `radius-md`, `h-10`, `border-thin`, `surface-sunken` (dark mode) or `surface-default` (light mode).
- **States:**
  - **Focus:** 2px ring using `accent-base`.
  - **Error:** 2px ring using `error-base`.
- **Usage Examples:** Username fields, Configuration inputs.
- **Anti-patterns:** Never use placeholder text as a replacement for a label. Always provide a clear `<label>` positioned above the input.
