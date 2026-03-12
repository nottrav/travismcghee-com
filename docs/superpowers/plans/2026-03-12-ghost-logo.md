# Ghost Logo Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static site logo PNG with an interactive SVG ghost logo component whose eyes track the cursor and tilt with head movement.

**Architecture:** A single `GhostLogo.astro` component renders an SVG with three layers (background circle, ghost body, eyes) and attaches a vanilla JS event listener for mouse tracking, head tilt, and blink animation. Theme colors are driven by CSS custom properties. The component replaces the existing `<img>` in `Header.astro`.

**Tech Stack:** Astro, SVG, vanilla TypeScript (inline script), CSS custom properties, Tailwind class-based dark mode.

---

## Chunk 1: GhostLogo component + Header integration

### Task 1: Create GhostLogo.astro

**Files:**
- Create: `src/components/GhostLogo.astro`

- [ ] **Step 1: Create the component file with SVG markup**

Create `src/components/GhostLogo.astro` with the following content:

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
  style="overflow: visible;"
>
  <g id="ghost-head">
    <circle cx="50" cy="50" r="48" fill="var(--ghost-bg)" />
    <path
      d="M18 52 C18 30 32 14 50 14 C68 14 82 30 82 52 L82 82 L73 73 L64 82 L55 73 L46 82 L37 73 L28 82 Z"
      fill="var(--ghost-body)"
    />
    <ellipse id="ghost-left-eye"  cx="38" cy="48" rx="6" ry="7" fill="var(--ghost-eye)" />
    <ellipse id="ghost-right-eye" cx="62" cy="48" rx="6" ry="7" fill="var(--ghost-eye)" />
  </g>
</svg>

<style>
  :root {
    --ghost-bg:   #1e293b;
    --ghost-body: #f8fafc;
    --ghost-eye:  #1e293b;
  }
  .dark {
    --ghost-bg:   #e2e8f0;
    --ghost-body: #0f1117;
    --ghost-eye:  #e2e8f0;
  }
</style>

<script>
  const LEFT_CENTER  = { x: 38, y: 48 };
  const RIGHT_CENTER = { x: 62, y: 48 };
  const MAX_TRAVEL   = 4;
  const MAX_TILT     = 5; // degrees

  function init() {
    const svg      = document.getElementById("ghost-logo") as SVGSVGElement | null;
    const head     = document.getElementById("ghost-head") as SVGGElement | null;
    const leftEye  = document.getElementById("ghost-left-eye")  as SVGEllipseElement | null;
    const rightEye = document.getElementById("ghost-right-eye") as SVGEllipseElement | null;

    if (!svg || !head || !leftEye || !rightEye) return;

    const controller = new AbortController();
    const { signal } = controller;

    let leftOffset  = { x: 0, y: 0 };
    let rightOffset = { x: 0, y: 0 };
    let blinking    = false;

    function calcOffset(
      eye: { x: number; y: number },
      svgX: number,
      svgY: number,
      mult: number
    ) {
      const dx   = svgX - eye.x;
      const dy   = svgY - eye.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const t    = Math.min(dist / 45, 1) * MAX_TRAVEL * mult;
      const a    = Math.atan2(dy, dx);
      return { x: Math.cos(a) * t, y: Math.sin(a) * t };
    }

    document.addEventListener(
      "mousemove",
      (e) => {
        const rect   = svg.getBoundingClientRect();
        const scaleX = 100 / rect.width;
        const scaleY = 100 / rect.height;
        const svgX   = (e.clientX - rect.left) * scaleX;
        const svgY   = (e.clientY - rect.top)  * scaleY;

        // Head tilt based on horizontal cursor position
        const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, (svgX - 50) * 0.1));
        head.setAttribute("transform", `rotate(${tilt.toFixed(2)}, 50, 50)`);

        // Eye tracking — always update offsets even while blinking
        leftOffset  = calcOffset(LEFT_CENTER,  svgX, svgY, 1.0);
        rightOffset = calcOffset(RIGHT_CENTER, svgX, svgY, 0.85);

        if (!blinking) {
          leftEye.setAttribute("cx",  String(LEFT_CENTER.x  + leftOffset.x));
          leftEye.setAttribute("cy",  String(LEFT_CENTER.y  + leftOffset.y));
          rightEye.setAttribute("cx", String(RIGHT_CENTER.x + rightOffset.x));
          rightEye.setAttribute("cy", String(RIGHT_CENTER.y + rightOffset.y));
        }
      },
      { signal }
    );

    // Blink animation
    function scheduleBlink() {
      setTimeout(blink, 2000 + Math.random() * 3000);
    }

    function blink() {
      blinking = true;
      const steps = [7, 4, 1.5, 0.2, 1.5, 4, 7];
      let i = 0;
      const tick = setInterval(() => {
        leftEye.setAttribute("ry",  String(steps[i]));
        rightEye.setAttribute("ry", String(steps[i]));
        i++;
        if (i >= steps.length) {
          clearInterval(tick);
          leftEye.setAttribute("ry",  "7");
          rightEye.setAttribute("ry", "7");
          // Restore tracked positions
          leftEye.setAttribute("cx",  String(LEFT_CENTER.x  + leftOffset.x));
          leftEye.setAttribute("cy",  String(LEFT_CENTER.y  + leftOffset.y));
          rightEye.setAttribute("cx", String(RIGHT_CENTER.x + rightOffset.x));
          rightEye.setAttribute("cy", String(RIGHT_CENTER.y + rightOffset.y));
          blinking = false;
          scheduleBlink();
        }
      }, 38);
    }

    scheduleBlink();

    // Clean up before next View Transition swap
    document.addEventListener("astro:before-swap", () => controller.abort(), { once: true, signal });
  }

  document.addEventListener("astro:page-load", init);
</script>
```

- [ ] **Step 2: Verify the dev server compiles without errors**

```bash
cd /Users/travis/Projects/cybersec-blog && pnpm dev
```

Expected: dev server starts at `localhost:4321` with no TypeScript or Astro errors in the terminal.

- [ ] **Step 3: Commit**

```bash
cd /Users/travis/Projects/cybersec-blog
git add src/components/GhostLogo.astro
git commit -m "feat: add interactive GhostLogo SVG component"
```

---

### Task 2: Integrate GhostLogo into Header

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Replace the static logo img with GhostLogo**

Open `src/components/Header.astro`. The current file looks like:

```astro
---
import Container from "@components/Container.astro";
import Link from "@components/Link.astro";
import { SITE } from "@consts";
---

<header>
  <Container>
    <div class="flex flex-wrap gap-y-2 justify-between">
      <Link href="/" underline={false}>
        <div class="font-semibold flex items-center gap-2">
          {SITE.LOGO && (
            <img
              src={SITE.LOGO}
              alt={`${SITE.NAME} logo`}
              width="30"
              height="30"
              class="h-[30px] w-[30px] rounded-sm object-cover"
            />
          )}
          <span>{SITE.NAME}</span>
        </div>
      </Link>
      <nav class="flex gap-1">
        <Link href="/blog">
          blog
        </Link>
        <span>
          {`/`}
        </span>
        <Link href="/projects">
          projects
        </Link>
      </nav>
    </div>
  </Container>
</header>
```

Replace it entirely with:

```astro
---
import Container from "@components/Container.astro";
import GhostLogo from "@components/GhostLogo.astro";
import Link from "@components/Link.astro";
import { SITE } from "@consts";
---

<header>
  <Container>
    <div class="flex flex-wrap gap-y-2 justify-between">
      <Link href="/" underline={false}>
        <div class="font-semibold flex items-center gap-2">
          <GhostLogo width={30} height={30} />
          <span>{SITE.NAME}</span>
        </div>
      </Link>
      <nav class="flex gap-1">
        <Link href="/blog">
          blog
        </Link>
        <span>
          {`/`}
        </span>
        <Link href="/projects">
          projects
        </Link>
      </nav>
    </div>
  </Container>
</header>
```

- [ ] **Step 2: Check dev server — ghost logo should appear in the header**

Open `http://localhost:4321`. Verify:
- Ghost logo appears to the left of "Travis McGhee" in the header
- Moving mouse over the page causes the eyes to follow
- Head tilts subtly left/right with horizontal mouse movement
- Blink fires after a few seconds

- [ ] **Step 3: Commit**

```bash
cd /Users/travis/Projects/cybersec-blog
git add src/components/Header.astro
git commit -m "feat: replace static logo img with GhostLogo component in header"
```

---

### Task 3: Remove LOGO from types and consts

**Files:**
- Modify: `src/types.ts`
- Modify: `src/consts.ts`

- [ ] **Step 1: Remove LOGO from Site type**

In `src/types.ts`, remove the `LOGO?: string;` line:

```ts
export type Site = {
  NAME: string;
  EMAIL?: string;
  NUM_POSTS_ON_HOMEPAGE: number;
  NUM_PROJECTS_ON_HOMEPAGE: number;
};
```

- [ ] **Step 2: Remove LOGO from SITE constant**

In `src/consts.ts`, remove the `LOGO: "/site-logo.png",` line:

```ts
export const SITE: Site = {
  NAME: "Travis McGhee",
  EMAIL: "",
  NUM_POSTS_ON_HOMEPAGE: 4,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};
```

- [ ] **Step 3: Run lint to confirm no remaining LOGO references**

```bash
cd /Users/travis/Projects/cybersec-blog && pnpm lint
```

Expected: no errors. If any file still references `SITE.LOGO`, it will surface here.

- [ ] **Step 4: Run build to confirm TypeScript passes**

```bash
cd /Users/travis/Projects/cybersec-blog && pnpm build
```

Expected: build completes with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/travis/Projects/cybersec-blog
git add src/types.ts src/consts.ts
git commit -m "chore: remove LOGO field from Site type and SITE constant"
```

---

### Task 4: Generate new favicons

**Files:**
- Replace: `public/favicon-dark-32.png`
- Replace: `public/favicon-light-32.png`

- [ ] **Step 1: Open the preview in a browser and screenshot the dark variant**

Open `http://localhost:4321` in dark mode. Open browser DevTools, select the `#ghost-logo` SVG element, and use the DevTools screenshot node feature, or use an online tool like [svgtopng.com](https://svgtopng.com) with this SVG source at 32×32:

**Dark mode SVG** (white ghost on dark circle):
```svg
<svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#e2e8f0"/>
  <path d="M18 52 C18 30 32 14 50 14 C68 14 82 30 82 52 L82 82 L73 73 L64 82 L55 73 L46 82 L37 73 L28 82 Z" fill="#0f1117"/>
  <ellipse cx="38" cy="48" rx="6" ry="7" fill="#e2e8f0"/>
  <ellipse cx="62" cy="48" rx="6" ry="7" fill="#e2e8f0"/>
</svg>
```

Save result as `public/favicon-dark-32.png`.

- [ ] **Step 2: Generate the light variant**

**Light mode SVG** (dark ghost on light circle):
```svg
<svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#1e293b"/>
  <path d="M18 52 C18 30 32 14 50 14 C68 14 82 30 82 52 L82 82 L73 73 L64 82 L55 73 L46 82 L37 73 L28 82 Z" fill="#f8fafc"/>
  <ellipse cx="38" cy="48" rx="6" ry="7" fill="#1e293b"/>
  <ellipse cx="62" cy="48" rx="6" ry="7" fill="#1e293b"/>
</svg>
```

Save result as `public/favicon-light-32.png`.

- [ ] **Step 3: Verify favicons in the browser tab**

Hard-reload `http://localhost:4321`. The tab icon should now show the ghost. Toggle between light/dark mode and confirm the favicon switches.

- [ ] **Step 4: Commit**

```bash
cd /Users/travis/Projects/cybersec-blog
git add public/favicon-dark-32.png public/favicon-light-32.png
git commit -m "feat: replace favicons with ghost logo variants"
```

---

## Chunk 2: Final verification

### Task 5: Full build and smoke test

- [ ] **Step 1: Run full build**

```bash
cd /Users/travis/Projects/cybersec-blog && pnpm build
```

Expected: build completes cleanly with no errors.

- [ ] **Step 2: Preview the production build**

```bash
cd /Users/travis/Projects/cybersec-blog && pnpm preview
```

Open `http://localhost:4321`. Verify:
- Ghost logo renders in the header at the correct size
- Eye tracking works in the production build
- Head tilt works
- Blink fires
- Toggle dark/light/system theme — ghost colors flip correctly, favicon switches

- [ ] **Step 3: Navigate between pages to test View Transitions**

Click blog, click a post, click back. Verify:
- Ghost logo continues to function on every page (eyes track, tilt works)
- No console errors about duplicate listeners

