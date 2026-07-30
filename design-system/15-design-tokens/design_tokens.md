# ReelForge AI: Design Token Architecture

The design token system translates abstract design decisions into concrete variables consumed by the React/Tailwind codebase. This ensures the design system can be updated globally without touching individual components.

## 1. Token Structure
Tokens are structured hierarchically: `[Category]-[Property]-[Variant]`

### Color Tokens (CSS Variables)
- `--color-bg-base`: Core background (Matte Black / Off-white)
- `--color-surface-default`: Default card background
- `--color-surface-elevated`: Hover/Elevated background
- `--color-surface-sunken`: Deep background for inputs/code
- `--color-text-primary`: Primary reading text
- `--color-text-secondary`: Metadata and subtitles
- `--color-border-subtle`: 1px structure lines
- `--color-accent-base`: Primary brand action color (Purple)
- `--color-accent-glow`: Translucent version for blurs

### Typography Tokens (Tailwind Config)
- `font-sans`: 'Geist Sans', system-ui, sans-serif
- `font-mono`: 'Geist Mono', monospace
- `text-display`: `font-size: 3rem; letter-spacing: -0.02em; line-height: 1.1;`
- `text-h1`: `font-size: 1.5rem; letter-spacing: -0.01em; line-height: 1.2;`
- `text-body`: `font-size: 0.875rem; line-height: 1.5;`

### Spacing Tokens (8-pt scale)
- `space-1`: 4px
- `space-2`: 8px
- `space-4`: 16px
- `space-6`: 24px
- `space-8`: 32px

### Radius Tokens
We use tight, industrial radiuses. No overly rounded "bubbly" interfaces.
- `radius-sm`: 4px (Checkboxes, small tags)
- `radius-md`: 8px (Buttons, standard inputs)
- `radius-lg`: 12px (Cards, Modals)
- `radius-full`: 9999px (Avatars, Pill badges)

### Elevation & Border Tokens
Depth is achieved primarily through borders and background lightness shifts, NOT heavy shadows.
- `shadow-sm`: `0 1px 2px rgba(0,0,0,0.05)` (Subtle separation in light mode)
- `shadow-glow`: `0 0 20px var(--color-accent-glow)` (AI processing states)
- `border-thin`: `1px solid var(--color-border-subtle)`

### Motion Tokens
- `duration-fast`: 150ms
- `duration-normal`: 250ms
- `ease-spring`: `cubic-bezier(0.175, 0.885, 0.32, 1.275)`
- `ease-smooth`: `cubic-bezier(0.4, 0, 0.2, 1)`

### Opacity & Z-Index Tokens
- `opacity-disabled`: `0.5`
- `z-base`: `0`
- `z-dropdown`: `40`
- `z-modal`: `50`
- `z-toast`: `100`
