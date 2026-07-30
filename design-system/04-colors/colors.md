# ReelForge AI: Color System

The ReelForge color system is highly restrained. It relies on a structural, industrial palette of grays, warm whites, and charcoal, reserving vibrant colors strictly for AI accents and semantic feedback (success, warning, error). 

**Rule:** NEVER use raw hex values in React components. Always consume semantic tokens (e.g., `var(--color-surface-elevated)`).

## 1. Light Theme (Warm & Editorial)
The light theme avoids harsh, blinding whites. It leans towards a soft, "warm paper" feel, inspired by high-end editorial layouts.

### Backgrounds & Surfaces
- `background-base`: `#FCFCFC` (Off-white, almost paper-like)
- `surface-default`: `#FFFFFF` (Pure white for elevated cards)
- `surface-elevated`: `#FFFFFF` (Differentiated by shadow rather than color)
- `surface-sunken`: `#F5F5F5` (Used for code blocks, secondary sidebars)

### Borders (Thin & Structural)
- `border-subtle`: `rgba(0, 0, 0, 0.06)`
- `border-default`: `rgba(0, 0, 0, 0.12)`
- `border-strong`: `rgba(0, 0, 0, 0.24)`

### Typography
- `text-primary`: `#111111` (Near black for maximum contrast)
- `text-secondary`: `#666666` (Used for metadata, subtitles)
- `text-tertiary`: `#999999` (Used for disabled text, subtle hints)

---

## 2. Dark Theme (Deep Charcoal & Matte Black)
The dark theme is inspired by Linear and Claude. It avoids absolute black `#000000` for backgrounds to prevent eye strain, instead using deep, rich charcoals. Depth is achieved via border highlights, not drop shadows.

### Backgrounds & Surfaces
- `background-base`: `#0A0A0A` (Deep matte black)
- `surface-default`: `#121212` (Card background)
- `surface-elevated`: `#1A1A1A` (Dialogs, dropdowns)
- `surface-sunken`: `#000000` (Code blocks, command palette inputs)

### Borders (Light-catching edges)
- `border-subtle`: `rgba(255, 255, 255, 0.06)`
- `border-default`: `rgba(255, 255, 255, 0.12)`
- `border-strong`: `rgba(255, 255, 255, 0.24)`

### Typography
- `text-primary`: `#EDEDED` (Off-white to prevent blooming)
- `text-secondary`: `#A1A1A1`
- `text-tertiary`: `#666666`

---

## 3. The AI Accent (Purple & Iridescence)
Purple is the brand color, but it is treated as a rare, valuable resource. It represents **Intelligence, Action, and Premium Value**.

- `accent-base`: `#7C3AED` (Deep Violet)
- `accent-hover`: `#6D28D9`
- `accent-subtle`: `rgba(124, 58, 237, 0.1)` (Used for active states on list items)
- `accent-glow`: `rgba(124, 58, 237, 0.4)` (Used for AI thinking blur effects)
- `ai-gradient`: `linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)` (Used *only* for the "Generate" button, AI loading borders, and Premium highlights).

---

## 4. Semantic Feedback Colors
Used universally across both themes (opacity/lightness adjusted for contrast).

### Success (Calm Green)
- Light Theme: `#059669`
- Dark Theme: `#10B981`
- Use: Validation checks, successful deployments, positive analytics trends.

### Warning (Amber/Yellow)
- Light Theme: `#D97706`
- Dark Theme: `#F59E0B`
- Use: Approaching limits, missing data warnings.

### Error (Restrained Red)
- Light Theme: `#DC2626`
- Dark Theme: `#EF4444`
- Use: Destructive actions, system failures, required field errors.
