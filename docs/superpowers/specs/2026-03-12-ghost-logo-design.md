# Ghost Logo Design Spec

**Date:** 2026-03-12
**Status:** Approved

## Overview

Replace the current static `site-logo.png` in `travismcghee.com` with an interactive SVG ghost logo component. Eyes follow the user's cursor and blink randomly, inspired by [markhorn.dev/blog/batcat-brand](https://markhorn.dev/blog/batcat-brand).

## Visual Design

### Structure (3 layers)

1. **Background circle** — a filled circle that is part of the logo itself, not the page background
2. **Ghost body** — classic ghost silhouette (rounded dome top, wavy 4-bump bottom) rendered as a solid filled path on top of the circle
3. **Eyes** — two small solid ellipses drawn on top of the ghost body that move with the cursor

### Theme Adaptation

| Mode | Circle | Ghost body | Eyes |
|------|--------|------------|------|
| Dark | `#e2e8f0` (white) | `#0f1117` (dark) | `#e2e8f0` (white) |
| Light | `#1e293b` (dark) | `#f8fafc` (white) | `#1e293b` (dark) |

Colors switch via CSS custom properties scoped to `:root` and `.dark` selectors inside the component's `<style>` block (not Tailwind utility classes, since SVG `fill` attributes can't use Tailwind directly). Example:

```css
:root {
  --ghost-bg: #1e293b;
  --ghost-body: #f8fafc;
  --ghost-eye: #1e293b;
}
.dark {
  --ghost-bg: #e2e8f0;
  --ghost-body: #0f1117;
  --ghost-eye: #e2e8f0;
}
```

SVG elements reference these via `fill="var(--ghost-bg)"` etc.

### SVG Coordinates

ViewBox: `0 0 100 100`

- **Circle:** `cx=50 cy=50 r=48`
- **Ghost path:** `M18 52 C18 30 32 14 50 14 C68 14 82 30 82 52 L82 82 L73 73 L64 82 L55 73 L46 82 L37 73 L28 82 Z`
- **Left eye center:** `cx=38 cy=48 rx=6 ry=7`
- **Right eye center:** `cx=62 cy=48 rx=6 ry=7`

## Animation

### Mouse Tracking

Tracking is **event-driven** (no `requestAnimationFrame` loop needed).

On each `mousemove`:
1. Get the SVG bounding rect via `getBoundingClientRect()`
2. Convert mouse to SVG coordinate space: `svgX = (clientX - rect.left) * (100 / rect.width)`
3. Compute offset vector from each eye center to the mouse position in SVG space
4. Clamp travel to `MAX_TRAVEL = 4` SVG units: `travel = Math.min(dist / 45, 1) * MAX_TRAVEL`
5. Apply 85% multiplier to the right eye's offset vector before setting position (not after clamping) — this creates subtle parallax depth
6. Set eye `cx`/`cy` attributes directly

**Important:** Always update the stored `leftOffset` / `rightOffset` variables even when `blinking === true` (do not move the eyes visually, but keep position current so they snap to the right place after blink).

### Head Tilt

The entire ghost (circle + body + eyes) rotates subtly based on horizontal cursor position, applied as a `transform` on a wrapping `<g id="ghost-head">` element.

- Compute horizontal offset: `svgX - 50` (SVG center is 50)
- Tilt angle: `angle = clamp(svgX - 50, -50, 50) * 0.1` → max ±5°
- Apply as SVG transform: `ghost-head.setAttribute("transform", \`rotate(\${angle}, 50, 50)\`)`
- Rotation pivot is `(50, 50)` — the center of the viewBox
- Tilt updates on every `mousemove` alongside eye tracking
- The eye ellipses live inside `ghost-head`, so they tilt with the body but still track the cursor independently via their `cx`/`cy` offsets

**SVG structure change:** wrap circle, ghost path, and eye ellipses in `<g id="ghost-head">`.

### Blink

- Random interval: 2000–5000ms after each blink completes
- Animate eye `ry` through `[7, 4, 1.5, 0.2, 1.5, 4, 7]` at 38ms per frame
- Set `blinking = true` at start, `false` at end
- After blink completes, restore eye `cx`/`cy` from the stored offset variables

## Implementation

### Files to create / modify

| File | Action |
|------|--------|
| `src/components/GhostLogo.astro` | Create — SVG + `<script>` for interactivity |
| `src/components/Header.astro` | Modify — replace `<img>` block with `<GhostLogo />` at `width=30 height=30` |
| `src/types.ts` | Modify — remove `LOGO` field from `Site` interface |
| `src/consts.ts` | Modify — remove `LOGO` field from `SITE` object |
| `public/favicon-dark-32.png` | Replace — see Favicon Generation below |
| `public/favicon-light-32.png` | Replace — see Favicon Generation below |

### GhostLogo.astro structure

```astro
---
interface Props {
  width?: number;
  height?: number;
}
const { width = 30, height = 30 } = Astro.props;
---

<svg
  id="ghost-logo"
  width={width}
  height={height}
  viewBox="0 0 100 100"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <circle cx="50" cy="50" r="48" fill="var(--ghost-bg)"/>
  <path d="M18 52 ..." fill="var(--ghost-body)"/>
  <ellipse id="ghost-left-eye"  cx="38" cy="48" rx="6" ry="7" fill="var(--ghost-eye)"/>
  <ellipse id="ghost-right-eye" cx="62" cy="48" rx="6" ry="7" fill="var(--ghost-eye)"/>
</svg>

<style>
  :root { --ghost-bg: #1e293b; --ghost-body: #f8fafc; --ghost-eye: #1e293b; }
  .dark  { --ghost-bg: #e2e8f0; --ghost-body: #0f1117; --ghost-eye: #e2e8f0; }
</style>

<script>
  // Standard bundled Astro script (NOT is:inline)
  // Use AbortController to clean up listeners on each page swap
  ...
</script>
```

### Script — View Transitions + listener cleanup

Use a standard bundled Astro `<script>` (not `is:inline`). Astro deduplicates bundled scripts automatically. Handle View Transitions with `astro:page-load` and clean up with `AbortController`:

```ts
function init() {
  const controller = new AbortController();
  const { signal } = controller;

  const svg = document.getElementById("ghost-logo");
  // ... attach mousemove on document with { signal }

  document.addEventListener("astro:before-swap", () => controller.abort(), { once: true });
}

document.addEventListener("astro:page-load", init);
```

This ensures the listener is removed before the next page loads, preventing stacked handlers across navigations.

### Header.astro change

Remove the entire `{SITE.LOGO && ( ... )}` block and replace with:

```astro
import GhostLogo from "@components/GhostLogo.astro";
...
<GhostLogo width={30} height={30} />
```

The existing `h-[30px] w-[30px] rounded-sm object-cover` classes on the `<img>` are dropped — sizing is handled by the `width`/`height` props on the SVG directly.

### Favicon Generation

No automated rasterization pipeline exists. Generate the two favicon PNGs manually:

1. Open `ghost-final-v6.html` from `.superpowers/brainstorm/` in a browser
2. Use browser DevTools to screenshot the 30×30 dark-mode ghost SVG, or use an online SVG-to-PNG tool (e.g. svgtopng.com) with the SVG source at 32×32
3. Save dark variant as `public/favicon-dark-32.png`, light variant as `public/favicon-light-32.png`
4. Existing `Head.astro` favicon-switching logic requires no changes

## Out of Scope

- No touch/mobile parallax
- No favicon animation
