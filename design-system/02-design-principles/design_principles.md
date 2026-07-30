# ReelForge AI: Design Principles

These principles guide every UI and UX decision made in the platform. They act as the objective filter through which all designs must pass.

## 1. Simplicity over Complexity
ReelForge handles incredibly complex data (AI ideation, competitor graphs, multi-agent workflows). The UI's job is to abstract this complexity. 
- **Rule:** If a screen feels complicated, it is wrong. Use progressive disclosure to reveal advanced settings only when requested.
- **Implementation:** Favor clean typography and whitespace over bounding boxes and dividing lines.

## 2. Unambiguous Hierarchy
Users should instinctively know what is most important on any given screen without scanning.
- **Rule:** There must be exactly one primary focal point (action or data visualization) per view.
- **Implementation:** Use stark typographic contrast (e.g., 24px Semibold headers vs 14px Regular body) and reserve accent colors exclusively for the primary focal point.

## 3. Intentional Whitespace
Whitespace is treated as an active design element, not just empty space. It groups related elements and creates "breathing room."
- **Rule:** Be generous with margins and padding. Content should never feel cramped.
- **Implementation:** Strictly adhere to the 8-pt grid system for all spacing tokens.

## 4. Calm & Consistent Interactions
Interactions should feel smooth, physics-based, and predictable, reducing cognitive load.
- **Rule:** Never surprise the user with erratic motion or jarring layout shifts.
- **Implementation:** Standardize transition durations (e.g., 150ms for hovers, 300ms for layout shifts) and use Apple/Framer-style spring easings.

## 5. Purposeful AI Accentuation
AI is the core of ReelForge, but it shouldn't scream at the user. It should feel integrated, natural, and premium.
- **Rule:** AI moments should feel "magical" but restrained.
- **Implementation:** Use subtle gradient borders, frosted glass (acrylic), or gentle 3D reflections to highlight AI suggestions, separating them from user-generated content.

## 6. Performance as a Design Feature
A slow UI destroys the illusion of a premium tool. The interface must feel instantaneous.
- **Rule:** 60 FPS is non-negotiable. 
- **Implementation:** Rely on CSS/GPU-accelerated transforms (`transform: translate3d`) rather than animating layout properties (`width`, `margin`). Limit JS-heavy animations in favor of CSS transitions.

## 7. Uncompromising Accessibility
A premium tool is a usable tool for everyone.
- **Rule:** We do not sacrifice accessibility for aesthetics. 
- **Implementation:** Ensure all text meets WCAG AA contrast standards, provide clear focus states (not just the browser default), and support keyboard navigation natively.
