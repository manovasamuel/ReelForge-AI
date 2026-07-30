# ReelForge AI: Component Library Blueprint

This document catalogs the structural purpose and high-level reasoning for every reusable component in the ReelForge system. (Detailed anatomical specifications exist in `16-component-specifications`).

*Rule: No component is built ad-hoc. Everything must exist in the design system first.*

## 1. Foundation Components

### Buttons
- **Primary:** Solid accent color (or inverted text-primary on surface). Used exclusively for the single most important action on a screen (e.g., "Generate Blueprint").
- **Secondary:** Transparent background, 1px border. Used for alternate actions (e.g., "Cancel", "Save Draft").
- **Ghost/Tertiary:** No background, no border. Used for low-priority actions (e.g., "Edit").
- *Motion:* Scale `1.02` on hover, `0.98` on active (click).

### Inputs & Forms
- **Style:** Borderless by default or 1px subtle border. Focus state reveals a slight glow or strong border using the primary text or accent color.
- **Labels:** Small (`text-xs`), medium weight, positioned directly above the input with `space-1` (4px) gap.
- **Feedback:** Inline validation. Errors turn the border and text red, accompanied by a subtle shake animation.

## 2. Structural Components

### Cards
- **Usage:** Container for discrete pieces of data (e.g., a specific competitor's metrics).
- **Style:** 1px `border-subtle`, standard `surface-default` background, `space-6` (24px) internal padding. 
- **Shadows:** No heavy drop shadows. Use border contrast to define the edge.

### Navigation (Sidebar & Topbar)
- **Sidebar:** Minimal, icon-heavy, collapsible. Uses `surface-sunken` to sit visually behind the main content area.
- **Navbar/Header:** Sticky, contains breadcrumbs, context context (Current Profile), and global actions. 1px bottom border.

## 3. Data Visualization & Density

### Tables & Lists
- **Style:** Row-based hover states (`surface-elevated`), 1px subtle bottom border per row. 
- **Density:** Compact padding (`space-2` vertical) to allow scanning large datasets (e.g., Audience comments).

### Analytics Cards
- **Style:** Large typography for the primary metric (`text-4xl`), small trend indicators (green/red arrows) for delta changes. Never clutter with unnecessary axes or gridlines.

## 4. AI-Specific Components

### Command Palette (Omnibar)
- **Usage:** Keyboard-first global search and AI command input (Cmd/Ctrl + K).
- **Style:** Floating modal, heavily blurred background (backdrop-filter), large input field.

### Blueprint Nodes (Workflow)
- **Usage:** Visual representation of the AIOS DAG (Directed Acyclic Graph).
- **Style:** Connected cards. States (Pending, Running, Completed, Failed) are denoted by border color and a status icon, not heavy background color fills.

### Memory & Context Badges
- **Usage:** Small, pill-shaped tags (`space-1` padding, `text-[10px]`) that indicate which pieces of memory (L0-L5) the AI is currently using. 

## 5. Overlays

### Dialogs / Modals
- **Style:** Centered, max-width bounded, distinct backdrop blur (`backdrop-blur-sm` with `rgba(0,0,0,0.4)` overlay). Contains a clear 'X' dismiss button. 

### Tooltips
- **Style:** Extremely minimal. Dark background (in light mode) or Light background (in dark mode) for high contrast. Appears after a `300ms` delay to prevent UI flashing.
