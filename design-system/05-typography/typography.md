# ReelForge AI: Typography System

Typography is the most critical UI element in ReelForge. It establishes the premium editorial feel and ensures dense data remains highly legible.

## 1. Typeface Evaluation

We evaluated several modern neo-grotesque and geometric typefaces to find the perfect fit for ReelForge's industrial, premium aesthetic.

| Typeface | Readability | Premium Feel | Editorial | Dashboard | Licensing | Web Perf | Conclusion |
|---|---|---|---|---|---|---|---|
| **Geist** | Excellent | Very High | High | Excellent | Open (OFL) | Excellent | Strong candidate. Perfectly balances geometric rigidity with high legibility. Designed for developer/creator tools. |
| **Inter** | Excellent | Moderate | Moderate | Excellent | Open (OFL) | Excellent | The industry standard for UI. Highly legible, but slightly ubiquitous, which detracts slightly from a unique "premium" feel. |
| **SF Pro** | Excellent | Very High | Moderate | Excellent | Restrictive | N/A | Apple's system font. Beautiful, but legally restricted to Apple platforms. Used as a reference for proportions. |
| **IBM Plex Sans**| Very Good | High | High | Very Good | Open (OFL) | Good | Highly industrial and technical. Excellent for data, but can feel slightly too "developer-centric" and cold for creative ideation. |
| **Satoshi** | Very Good | Very High | Very High | Good | Free (EULA) | Good | Beautiful geometric sans with a strong editorial feel. Slightly wider proportions make dense dashboards challenging. |
| **Suisse Int'l** | Excellent | Very High | Very High | Excellent | Commercial | Good | The ultimate Swiss neo-grotesque. Reference standard for premium editorial tech, but requires commercial web licensing. |

### Final Recommendation: **Geist** by Vercel
**Why Geist?** 
Geist provides the perfect intersection of *Suisse Int'l's* premium editorial starkness and *Inter's* technical dashboard legibility. It was explicitly designed for modern software interfaces, offering exceptional metric optimization (web performance), a completely open license, and a highly geometric, industrial feel that aligns perfectly with our Apple/Nothing/Linear inspiration.

*(Note: We will use `Geist Sans` for UI/Body and `Geist Mono` for code snippets, JSON outputs, and raw AI prompt blocks).*

---

## 2. Typography Scale

We utilize a strict modular scale to ensure hierarchy remains consistent. The scale is based on a `1rem = 16px` root.

### Headings (Display & Structured)
Headings use tighter tracking (letter-spacing) to appear solid and unified.

- **Display 1:** `text-5xl` (48px) | `tracking-tight` (-0.02em) | `font-semibold` | Use: Hero sections.
- **Display 2:** `text-4xl` (36px) | `tracking-tight` (-0.02em) | `font-semibold` | Use: Major page titles.
- **Heading 1 (H1):** `text-2xl` (24px) | `tracking-tight` (-0.01em) | `font-medium` | Use: Dashboard section headers.
- **Heading 2 (H2):** `text-xl` (20px) | `tracking-normal` | `font-medium` | Use: Card titles, modal headers.
- **Heading 3 (H3):** `text-lg` (18px) | `tracking-normal` | `font-medium` | Use: Subsection titles.

### Body & UI (Legibility Focused)
Body text uses standard or slightly loose tracking to maximize readability in dense views.

- **Body Large:** `text-base` (16px) | `leading-relaxed` (1.625) | `font-normal` | Use: Generated scripts, long-form content.
- **Body Default:** `text-sm` (14px) | `leading-normal` (1.5) | `font-normal` | Use: Standard UI elements, tables, lists.
- **Metadata:** `text-xs` (12px) | `tracking-wide` (0.01em) | `font-medium` | Use: Timestamps, tags, small labels. *(Note: Often paired with `text-secondary` color).*
- **Overline:** `text-[10px]` | `uppercase` | `tracking-widest` (0.05em) | `font-semibold` | Use: Tiny section dividers, status badges.

## 3. Implementation Rules
- **No bolding body text for emphasis.** Use `font-medium` or color shifts (e.g., `text-primary` vs `text-secondary`) instead of `font-bold` to maintain an elegant, lightweight feel.
- **Line Heights:** AI-generated text (scripts, hooks) MUST use `leading-relaxed` (1.625) to prevent wall-of-text fatigue. UI elements (buttons, nav) use `leading-none` (1) or `leading-tight` (1.25) to align properly within grids.
