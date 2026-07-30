# ReelForge AI: Accessibility (a11y)

Accessibility is not a feature; it is a foundational requirement. ReelForge must be fully usable by individuals relying on assistive technologies, keyboard navigation, and varying visual requirements. We target **WCAG 2.1 AA** compliance.

## 1. Keyboard Navigation
Power users and users with motor disabilities rely on keyboards.
- **Focus States:** The browser default focus outline is insufficient. Every interactive element (buttons, inputs, links) MUST have a highly visible, custom focus state (e.g., a 2px solid `accent-base` ring with a 2px offset).
- **Tab Order:** The logical flow of the DOM must match the visual layout. No hidden `tabindex` hacks.
- **Command Palette:** Ensure the global command palette (Cmd+K) allows full keyboard traversal of all major platform actions.

## 2. Color Contrast
The subtle, industrial aesthetic (dark grays, muted texts) presents a high risk for contrast failures.
- **Text:** All text must maintain a minimum contrast ratio of `4.5:1` against its background. 
- **Large Text:** Headings (18pt+) must maintain a `3:1` ratio.
- **UI Boundaries:** Essential UI elements (input borders, active tab indicators) must maintain a `3:1` ratio to ensure boundaries are clearly perceived.

## 3. Reduced Motion
Animations that feel premium to some can cause vestibular nausea for others.
- **Rule:** Respect the OS-level `prefers-reduced-motion` media query.
- **Implementation:** When enabled, disable all scaling, sliding, and physics-based animations. Fall back to instant state changes or simple, rapid (150ms) opacity crossfades.

## 4. Screen Readers & ARIA
- **Semantic HTML:** Use native elements (`<button>`, `<nav>`, `<main>`, `<dialog>`) over `<div>` elements with ARIA roles whenever possible.
- **ARIA Labels:** Any icon-only button (e.g., a "Trash" icon for delete) MUST have an `aria-label` or visually hidden screen-reader text describing the action.
- **Live Regions:** When AI finishes generating a blueprint in the background, announce the completion via `aria-live="polite"` so screen readers are informed without interrupting the user.
