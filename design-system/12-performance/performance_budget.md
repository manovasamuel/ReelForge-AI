# ReelForge AI: Performance Budget

Performance is a fundamental pillar of the ReelForge design language. A premium UI that drops frames or lags during interactions instantly destroys trust in the platform. We treat performance metrics with the same rigidity as brand colors.

## 1. The 60 FPS Mandate
All animations, transitions, and scrolling must maintain 60 frames per second on mid-tier hardware (e.g., a 3-year-old laptop).
- **Enforcement:** Never animate layout properties (`width`, `height`, `margin`, `top`, `left`). These trigger expensive browser reflows.
- **Solution:** ONLY animate `transform` (`translate`, `scale`, `rotate`) and `opacity`. These are GPU-accelerated and do not block the main thread.

## 2. Minimal JavaScript Overhead
ReelForge relies heavily on complex data (AI responses, large JSON datasets). The UI layer must remain as thin as possible.
- **Rule:** Do not load massive external libraries for simple tasks. (e.g., Use native browser APIs like `Intl.NumberFormat` instead of heavy formatting libraries like `moment.js`).
- **Data Fetching:** Utilize React Server Components (RSC) and server-side fetching as much as possible to reduce client-side bundle size.

## 3. Image & 3D Optimization
The 3D aesthetic can easily bloat load times if mismanaged.
- **Images:** All raster images must be served in `WebP` or `AVIF` formats, properly sized via `srcset`, and aggressively lazy-loaded using `loading="lazy"`.
- **3D Assets:** 
  - Real-time 3D (WebGL) should be reserved *only* for the landing page hero, and its bundle must be code-split.
  - In-app 3D elements (empty states, success screens) should be highly compressed, pre-rendered looping videos (WebM/MP4 with `muted playsinline loop`).

## 4. Code Splitting & Lazy Loading
- **Rule:** The initial Javascript payload should be under `150KB` (gzipped).
- **Implementation:** Code-split heavy components (e.g., large data tables, rich text editors, markdown parsers) and load them dynamically only when the user navigates to those specific views.

## 5. Streaming UI for AI Generation
AI generation is inherently slow (often 5-15 seconds). We must optimize the *perceived* performance.
- **Rule:** Never show a static loading spinner for more than 2 seconds.
- **Implementation:** Stream the AI response in chunks to the UI as it generates. If the AI is in a "thinking" phase, provide skeleton loaders or pulsing 3D gradients to assure the user the system hasn't stalled.
