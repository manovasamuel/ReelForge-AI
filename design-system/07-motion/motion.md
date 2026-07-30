# ReelForge AI: Motion System

Motion in ReelForge is functional, physical, and subtle. Inspired by Apple and Linear, animations must never force the user to wait, and they must feel grounded in real-world physics (GPU-accelerated springs), avoiding cheap, linear "fade-ins."

## 1. Core Principles
- **Speed:** Animations should be fast enough to not cause delays (150ms-300ms), but slow enough to be perceived.
- **Physics:** Objects don't move at a constant speed in the real world. We use bezier curves (Ease-Out) and Spring physics, never `linear`.
- **Hardware Acceleration:** Only animate properties that the GPU can handle cheaply: `transform` (scale, translate) and `opacity`. NEVER animate `width`, `height`, `margin`, or `padding` unless absolutely necessary via a specialized layout library (like Framer Motion).

## 2. Easing Curves
We define three primary easing tokens:

- `ease-spring`: `cubic-bezier(0.175, 0.885, 0.32, 1.275)` (Slight overshoot, feels tactile and snappy. Use for hovers, button clicks, dropdowns).
- `ease-smooth`: `cubic-bezier(0.4, 0, 0.2, 1)` (Material-style ease-out. Fast acceleration, gentle deceleration. Use for page transitions, sidebars).
- `ease-linear`: `linear` (Forbidden for standard UI. Used ONLY for continuous loading spinners).

## 3. Animation Durations
- `duration-fast`: `150ms` (Hovers, active states, micro-interactions)
- `duration-normal`: `250ms` (Dialogs, dropdowns, command palettes)
- `duration-slow`: `400ms` (Page transitions, large layout shifts, hero reveals)

## 4. Specific Interactions

### Hover States (Cards & Buttons)
- **Effect:** Do not move items up (no `translateY`). Instead, use a subtle scale to simulate depth.
- **Values:** `transform: scale(1.02); opacity: 0.9;`
- **Timing:** `duration-fast ease-spring`

### Page & Component Entrances
- **Effect:** Subtle fade-up.
- **Values:** `opacity: 0 -> 1`, `transform: translateY(10px) -> translateY(0)`
- **Timing:** `duration-normal ease-smooth`

### Dialogs & Command Palettes
- **Effect:** Scale up from center with fade.
- **Values:** `opacity: 0 -> 1`, `transform: scale(0.95) -> scale(1)`
- **Timing:** `duration-normal ease-spring`

### AI Generation (Thinking State)
- **Effect:** Slow, deliberate pulse to indicate heavy processing without causing anxiety.
- **Values:** Pulse opacity of the purple accent gradient from `0.3 -> 0.7`.
- **Timing:** `duration: 2000ms`, `ease-in-out`, `infinite`.

## 5. Accessibility (Reduced Motion)
All animations MUST respect the user's OS-level reduced motion preferences.
- **Implementation:** Wrap all transition logic in `@media (prefers-reduced-motion: no-preference)` or equivalent React hooks. If reduced motion is enabled, default to instant transitions or simple `150ms` opacity fades (no transforms).
