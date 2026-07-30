# ReelForge AI: Iconography System

Icons are visual accelerators. They must be instantly recognizable, mathematically aligned, and perfectly consistent in weight and style.

**Primary Library:** [Lucide Icons](https://lucide.dev/) (Chosen for its clean, modern, and highly legible stroke-based design).

## 1. Icon Sizing
Icons must scale consistently with typography and the 8-pt grid.

- **Micro (`size-4` / 16px):** Used inside small badges, secondary buttons, or inline with metadata (`text-xs`).
- **Standard (`size-5` / 20px):** Used inside primary buttons, standard list items, and form inputs.
- **Medium (`size-6` / 24px):** Used for sidebar navigation items, section headers.
- **Large (`size-8` / 32px):** Used for empty states or macro-level dashboard cards.
- **Display (`size-12` / 48px+):** Reserved for marketing pages or massive empty state illustrations.

## 2. Stroke & Style Rules
- **Stroke Width:** All icons must maintain a strict `stroke-width: 2px` (or `1.5px` if scaled above 32px to prevent them from looking too heavy). Do NOT mix `1px` and `2px` stroke icons in the same UI view.
- **Fill:** Do NOT use filled icons unless indicating an "Active" state in bottom tab bars (mobile). All dashboard icons should be outlined to maintain an airy, lightweight feel.
- **Corner Radius:** Lucide defaults to rounded caps and joins (`stroke-linecap="round" stroke-linejoin="round"`). This provides a subtle softness that balances our highly structured geometric grid.

## 3. Placement & Alignment
- **Buttons:** When pairing an icon with text in a button, place the icon on the left (leading) side. Provide a `space-2` (8px) gap between the icon and text.
- **Alignment:** Icons must be optically centered with their adjacent text. Since icons are square bounding boxes, use CSS Flexbox (`items-center`) to ensure perfect vertical alignment.

## 4. Usage Rules
- **Never use icons purely for decoration.** If an icon doesn't clarify the adjacent text, remove it.
- **Accessibility:** If an icon is standalone (e.g., a "Settings" gear without a label), it MUST have an `aria-label="Settings"` or `<span class="sr-only">Settings</span>` for screen readers.
- **Color:** Icons inherit the text color of their parent container by default (`currentColor`). Do not manually color an icon unless it indicates a specific semantic state (e.g., Red for Delete/Trash).
