# ReelForge AI: 3D System & Guidelines

3D rendering is a core part of the ReelForge brand identity (inspired by Nothing and Apple), signaling premium craftsmanship, deep technology, and tangible intelligence. However, 3D must be applied with extreme restraint to prevent the UI from becoming cluttered or looking like a video game.

## 1. Where 3D is Allowed
3D assets and materials are reserved for high-impact, emotional, or transitional moments:

- **Landing Page Hero:** A massive, hyper-detailed 3D representation of the "Intelligence Engine."
- **Empty States:** Beautiful 3D icons (e.g., a frosted glass folder) to make empty dashboards feel like an opportunity rather than a dead end.
- **AI Processing (Loading):** Subtle rotating or shifting 3D shapes representing agents working in the background.
- **Success Screens:** A triumphant, highly polished 3D asset upon completing a major workflow (e.g., publishing a campaign).
- **Marketing/Pricing Pages:** Explaining features via abstract 3D visual metaphors.

## 2. Where 3D is Forbidden
- **Standard UI Elements:** Buttons, inputs, standard cards, and sidebars must remain strictly 2D (flat/structural).
- **Data Visualization:** Charts, graphs, tables, and analytics widgets must be flat for maximum legibility.
- **Typography:** No 3D text.

## 3. Material & Lighting Rules
Our 3D aesthetic relies on sophisticated, realistic materials, not cartoonish "claymorphism."

- **Primary Material: Frosted Glass (Acrylic)**
  - Use heavily blurred refraction (`backdrop-filter`) simulating thick glass.
  - Denotes "AI transparency" and depth.
- **Secondary Material: Matte Dark Plastic / Anodized Metal**
  - High roughness, low specularity.
  - Grounding materials that match our dark theme charcoal.
- **Lighting:**
  - Soft, diffused studio lighting.
  - Singular, harsh rim light (often tinted with our Purple accent) to separate the object from the dark background.
  - No dramatic, distracting cast shadows.

## 4. Web Performance Integration
3D assets on the web can destroy performance if handled poorly. We must maintain the 60 FPS performance budget.

- **Implementation:** Prefer pre-rendered, highly compressed MP4/WebM loops or high-res WebP images over real-time WebGL/Three.js unless interactive rotation is strictly required (e.g., Landing Hero).
- **Lazy Loading:** All 3D assets must be lazy-loaded. 
- **Graceful Fallbacks:** If the device is low-tier or on a slow connection, gracefully fall back to a high-quality 2D static image or CSS gradient without layout shifting.
