# ReelForge AI: Illustration & 3D System

ReelForge does not use flat, vector "tech startup" illustrations (e.g., people holding giant pencils). Instead, we rely on abstract 3D assets, high-fidelity materials, and subtle lighting to convey our brand identity as a premium "Intelligence Engine."

## 1. Asset Types

### 1.1 The Engine (Hero Asset)
- **Visual:** An abstract representation of the AIOS. Typically a complex geometric structure (like a neural mesh or glass sphere) that slowly rotates.
- **Material:** Frosted glass outer shell, glowing purple (`accent-base`) inner core.
- **Usage:** Strictly reserved for the Landing Page or Login screen.

### 1.2 Conceptual Metaphors (Empty States & Success)
- **Visual:** Familiar objects rendered in impossible, premium materials.
- **Examples:**
  - *Empty Blueprint:* A glass clipboard with a subtle purple glowing edge.
  - *Success:* A metallic, perfectly machined checkmark.
  - *Data Missing:* A matte black disconnected cable.
- **Usage:** Placed centrally in empty state containers to make the absence of data feel like a premium opportunity.

## 2. Materials & Lighting

- **Glass (Acrylic):** Characterized by high roughness on the refraction, creating a blurred background effect. Edges should catch harsh rim lighting to define the silhouette.
- **Matte Dark Plastic:** Highly absorptive. Barely reflects light, used to ground objects against the dark theme background.
- **Anodized Metal:** Used for structural elements within the 3D assets.
- **Lighting Setup:** Studio lighting. One large softbox for ambient fill, one sharp rim light (often tinted purple) to create edge contrast, and zero deep cast shadows onto the background to keep the UI clean.

## 3. Implementation Rules

- **Format:** Due to the heavy performance cost of real-time rendering, 90% of in-app 3D assets should be pre-rendered as WebM (with alpha transparency) or highly compressed WebP sequences.
- **WebGL:** Only use Three.js / R3F for the Landing Page hero where interactivity (reacting to mouse movement) justifies the performance budget.
- **Responsiveness:** Ensure 3D assets scale down gracefully on mobile devices, or fall back to high-res static WebP images if the viewport is too small to appreciate the detail.
