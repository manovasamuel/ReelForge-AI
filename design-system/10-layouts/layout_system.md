# ReelForge AI: Layout System

The layout system ensures consistency across all device sizes. It dictates how the dense information of a creative intelligence platform reflows gracefully on smaller screens.

## 1. Grid System

ReelForge uses a standard 12-column CSS Grid for macro layouts, scaling down to a single column on mobile.

- **Desktop (≥ 1024px):** 12 Columns, `space-6` (24px) gaps, `space-8` (32px) outer margins.
- **Tablet (≥ 768px):** 8 Columns, `space-4` (16px) gaps, `space-6` (24px) outer margins.
- **Mobile (< 768px):** 4 Columns (effectively 1 column for content), `space-4` (16px) gaps, `space-4` (16px) outer margins.

## 2. Container Widths

We restrict the maximum width of content to ensure readability. Text lines should ideally sit between 60-80 characters.

- **Reading Container (Scripts, Settings):** `max-w-3xl` (768px). Prevents text fatigue.
- **Dashboard Container (Analytics, Grids):** `max-w-7xl` (1280px). Allows data density without stretching infinitely on ultra-wide monitors.
- **Fluid Container (Full-width data tables):** `max-w-full`. Only used when horizontally dense data is strictly required.

## 3. Responsive Behavior Rules

1. **Sidebars:** On Desktop, the sidebar is a fixed 240px left-hand column. On Mobile, it collapses entirely into a bottom tab bar or a hidden hamburger menu (Drawer).
2. **Data Grids:** A 4-column metrics grid on Desktop (`grid-cols-4`) must reflow to a 2-column grid on Tablet (`grid-cols-2`), and a 1-column stack on Mobile (`grid-cols-1`).
3. **Typography Scaling:** Headings scale down on smaller viewports. (e.g., `text-4xl` on Desktop becomes `text-2xl` on Mobile) to prevent awkward wrapping.
4. **Touch Targets:** Any interactive element on Mobile MUST be at least 44x44px. This may require increasing padding strictly for the mobile breakpoint.
