# ReelForge AI: Spacing System

ReelForge utilizes a strict **8-point grid system** for all margin, padding, layout dimensions, and icon sizing. This mathematical consistency eliminates guesswork, aligns elements perfectly to pixel grids, and ensures a rhythmic, scalable layout.

## 1. The 8-Point Scale

All spacing values must be multiples of 8 (with a 4px half-step for micro-adjustments).

| Token | Pixel Value | Rem Value (Base 16) | Common Usage |
|---|---|---|---|
| `space-1` | 4px | 0.25rem | Micro-spacing: Inner padding for badges, gap between icon and text. |
| `space-2` | 8px | 0.5rem | Component-level: Input padding, list item gaps. |
| `space-3` | 12px | 0.75rem | Small containers: Tooltip padding, pill buttons. |
| `space-4` | 16px | 1rem | Standard UI: Default card padding, primary button height (40px = 16+24). |
| `space-6` | 24px | 1.5rem | Layout spacing: Gap between adjacent cards, modal padding. |
| `space-8` | 32px | 2rem | Section spacing: Margins between distinct dashboard sections. |
| `space-12` | 48px | 3rem | Page level: Top margin below navigation, major section gaps. |
| `space-16` | 64px | 4rem | Landing page spacing: Gaps between marketing sections. |
| `space-24` | 96px | 6rem | Hero spacing: Massive whitespace for premium editorial layouts. |

## 2. Spacing Principles

### Proximity Dictates Relationship
Elements that belong together must be closer to each other than elements that don't.
- *Example:* The gap between a label and its input (`space-1`, 4px) must be smaller than the gap between two separate form fields (`space-4`, 16px).

### Generous Outer Padding
To achieve the premium, "Nothing/Apple" aesthetic, containers must have generous internal whitespace. Content should never hug the borders.
- *Example:* Standard cards use `p-6` (24px) padding, never `p-2` (8px). 

### Vertical Rhythm
Pages should flow mathematically. If a page header has a `mb-8` (32px) margin, all subsequent sibling sections on that level should also use `space-8` or a strict multiple (e.g., `space-16`) to maintain vertical rhythm.

## 3. Anti-Patterns
- **No arbitrary values:** Never use values like `15px`, `10px`, or `21px`. 
- **No optical adjustments breaking the grid:** If something looks slightly off by 1px, adjust the *component's internal structure* (like line-height or bounding box), do not break the 8-pt rule.
