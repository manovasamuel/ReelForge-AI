# ReelForge AI: Design QA Checklist

No screen, component, or view is approved for merging into production unless it passes this strict QA checklist. This ensures the integrity of the design system remains intact as the team scales.

## 1. Spacing & Layout
- [ ] Are all margins, paddings, and gaps strict multiples of 8px (or 4px for micro-adjustments)?
- [ ] Does the page respect the defined container widths (`max-w-7xl` or `max-w-3xl`)?
- [ ] Is there exactly one primary focal point on the screen?
- [ ] On mobile viewports, are all interactive touch targets at least 44x44px?

## 2. Typography
- [ ] Is the designated font stack (`Geist`) applied correctly?
- [ ] Are headings utilizing tight tracking (`tracking-tight`) and body text using relaxed line-heights?
- [ ] Have we avoided using `font-bold` in body text, favoring `font-medium` or color contrast instead?

## 3. Color & Tokens
- [ ] Are ALL colors consuming semantic CSS variables/Tailwind tokens (e.g., `text-primary`, `surface-elevated`) rather than raw hex codes?
- [ ] Is the primary accent color (Purple) reserved strictly for AI interactions and primary CTAs?
- [ ] In Dark Mode, are backgrounds using deep charcoal (`#0A0A0A`) rather than absolute black (`#000000`)?

## 4. Motion & Interactivity
- [ ] Do hover states utilize GPU-accelerated scaling (`transform: scale(1.02)`) rather than animating layout properties?
- [ ] Are easing curves consistent (using `ease-spring` or `ease-smooth`)?
- [ ] Do modal and dialog entrances fade and scale up seamlessly?
- [ ] Does the UI respect the `prefers-reduced-motion` media query by disabling scaling/translating animations?

## 5. Performance
- [ ] Does the screen maintain a smooth 60 FPS during interactions and scrolling?
- [ ] Are heavy assets (3D renders, large charts) lazy-loaded?
- [ ] Is the initial JavaScript payload optimized (code splitting applied to heavy sub-views)?

## 6. Accessibility (a11y)
- [ ] Do all text elements meet the WCAG AA contrast ratio of at least 4.5:1?
- [ ] Can the entire view be navigated and interacted with using only the Keyboard (`Tab`, `Enter`, `Space`)?
- [ ] Do focused elements display a clear, custom focus ring?
- [ ] Do icon-only buttons include `aria-label` or `.sr-only` descriptions?

## 7. Tone & Copywriting
- [ ] Are button labels descriptive `<Verb> <Noun>` formats?
- [ ] Is the tone calm, confident, and free of unnecessary enthusiasm (no emojis or exclamation points for standard actions)?
- [ ] Do error messages clearly explain what went wrong and offer a recovery path?
