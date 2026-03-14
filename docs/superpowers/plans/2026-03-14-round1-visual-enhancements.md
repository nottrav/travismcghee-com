# Round 1: Visual Enhancements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dot grid background, scroll-triggered reveals, micro-interactions, blog TOC, ghost idle animation, RSS footer link, and active theme indicator.

**Architecture:** All changes are CSS/JS additions to existing Astro components. No new dependencies. The dot grid is a pure CSS `background-image` on `body`. Scroll reveals replace the current `setTimeout`-based `.animate` system with `IntersectionObserver`. TOC is a new Astro component rendered on blog post pages. RSS is an SVG icon link added to the footer.

**Tech Stack:** Astro, Tailwind CSS, vanilla JS, CSS

---

## Chunk 1: Dot Grid Background + Scroll-Triggered Reveals

### Task 1: Add dot grid background pattern

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add dot grid CSS to body**

Add a radial-gradient dot pattern to `body` in `global.css`. The dots should be very faint — barely visible — to keep the minimal aesthetic. Different opacity for light vs dark mode.

```css
body {
  @apply font-sans antialiased;
  @apply flex flex-col;
  @apply bg-stone-100 dark:bg-zinc-900;
  @apply text-black/50 dark:text-white/75;
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}

html.dark body {
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
}
```

- [ ] **Step 2: Verify in browser**

Run: `pnpm dev`

Check both light and dark mode. The dots should be subtle — visible if you look for them but not distracting. Adjust opacity values if needed (light: `0.06`, dark: `0.04`).

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "style: add subtle dot grid background pattern"
```

---

### Task 2: Replace setTimeout animation with IntersectionObserver

The current `animate()` function in `Head.astro` uses `setTimeout` with staggered delays. This means elements below the fold animate before the user scrolls to them. Replace with `IntersectionObserver` so elements animate when they enter the viewport.

**Files:**
- Modify: `src/components/Head.astro` (the `animate()` function inside the inline script)
- Modify: `src/styles/global.css` (add `.animate-immediate` class for above-the-fold elements)

- [ ] **Step 1: Add `.animate-immediate` CSS class**

In `global.css`, add a variant that animates on page load (for above-the-fold content like the page title and first paragraph):

```css
.animate-immediate {
  @apply opacity-0 translate-y-3;
  animation: fadeInUp 0.7s ease-out forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 2: Replace the `animate()` function in Head.astro**

Find the existing `animate()` function in the inline script and replace it:

```js
function animate() {
  const animateElements = document.querySelectorAll(".animate");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  animateElements.forEach((element) => {
    // If element is near top of page, show immediately with stagger
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.75) {
      const index = Array.from(animateElements).indexOf(element);
      setTimeout(() => {
        element.classList.add("show");
      }, index * 150);
    } else {
      observer.observe(element);
    }
  });
}
```

This keeps the staggered entrance for above-the-fold content and uses IntersectionObserver for everything below.

- [ ] **Step 3: Verify in browser**

Run: `pnpm dev`

1. Load the homepage — the intro, "Hi, I'm Travis" should still stagger in on load
2. Scroll down — "Featured projects", "Latest posts", and "Let's Connect" sections should fade in as you scroll to them
3. Navigate to `/blog` — same behavior, year sections animate in as scrolled
4. Test page transitions via Astro's client router — animations should re-trigger on each page

- [ ] **Step 4: Commit**

```bash
git add src/components/Head.astro src/styles/global.css
git commit -m "feat: scroll-triggered reveals via IntersectionObserver"
```

---

## Chunk 2: Micro-Interactions

### Task 3: Tag pill hover micro-interaction

**Files:**
- Modify: `src/components/ArrowCard.astro`
- Modify: `src/pages/blog/[...slug].astro`

- [ ] **Step 1: Update tag pill classes in ArrowCard.astro**

Find the tag `<a>` elements inside ArrowCard and add scale + background transition:

Old class:
```
no-underline text-xs rounded-md px-2 py-0.5 border border-black/15 dark:border-white/20 hover:border-black/30 dark:hover:border-white/40 hover:text-black dark:hover:text-white transition-colors
```

New class:
```
no-underline text-xs rounded-md px-2 py-0.5 border border-black/15 dark:border-white/20 hover:border-black/30 dark:hover:border-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:scale-105 transition-all duration-200
```

- [ ] **Step 2: Update tag pill classes in blog/[...slug].astro**

Same change for the tag pills on the blog post detail page. Find the tag `<a>` elements and apply the same class update.

Old class:
```
no-underline text-xs rounded-md px-2 py-1 border border-black/15 dark:border-white/20 hover:border-black/30 dark:hover:border-white/40 hover:text-black dark:hover:text-white transition-colors
```

New class:
```
no-underline text-xs rounded-md px-2 py-1 border border-black/15 dark:border-white/20 hover:border-black/30 dark:hover:border-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 hover:scale-105 transition-all duration-200
```

- [ ] **Step 3: Verify in browser**

Hover over tag pills on the homepage and on a blog post page. They should subtly scale up and get a faint background fill.

- [ ] **Step 4: Commit**

```bash
git add src/components/ArrowCard.astro "src/pages/blog/[...slug].astro"
git commit -m "style: add hover scale + bg micro-interaction to tag pills"
```

---

### Task 4: Active theme button indicator

**Files:**
- Modify: `src/components/Footer.astro`
- Modify: `src/components/Head.astro` (add logic to highlight active button)

- [ ] **Step 1: Add active indicator styles to Footer.astro theme buttons**

Add an `id`-based approach. Each button already has an id (`light-theme-button`, `dark-theme-button`, `system-theme-button`). Add a CSS class `theme-active` that shows a faint ring. Add this `<style>` block to Footer.astro:

```html
<style>
  .theme-active {
    background-color: rgba(0, 0, 0, 0.08);
    border-radius: 9999px;
  }
  :global(.dark) .theme-active {
    background-color: rgba(255, 255, 255, 0.1);
  }
</style>
```

- [ ] **Step 2: Add JS to set active button in Head.astro**

Add a `updateActiveThemeButton()` function inside the inline script, and call it from `init()` and after each theme button click:

```js
function updateActiveThemeButton() {
  const theme = localStorage.getItem(THEME_KEY) || "system";
  document.getElementById("light-theme-button")?.classList.toggle("theme-active", theme === "light");
  document.getElementById("dark-theme-button")?.classList.toggle("theme-active", theme === "dark");
  document.getElementById("system-theme-button")?.classList.toggle("theme-active", theme === "system" || !localStorage.getItem(THEME_KEY));
}
```

Call `updateActiveThemeButton()` at the end of `init()`, and inside each theme button's click handler after `toggleTheme()`.

- [ ] **Step 3: Verify in browser**

Click each theme button. The active one should have a subtle circular background highlight. On fresh load with no preference, the system button should be highlighted.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro src/components/Head.astro
git commit -m "feat: highlight active theme toggle button"
```

---

### Task 5: Ghost logo idle bob animation

**Files:**
- Modify: `src/components/GhostLogo.astro`

- [ ] **Step 1: Add CSS float animation**

Add a keyframe animation to the `<style>` block in GhostLogo.astro:

```css
@keyframes ghost-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

#ghost-logo {
  animation: ghost-bob 3s ease-in-out infinite;
}
```

- [ ] **Step 2: Verify in browser**

The ghost in the header should gently bob up and down. The eye tracking should still work on mousemove. The bob should be subtle (2px).

- [ ] **Step 3: Commit**

```bash
git add src/components/GhostLogo.astro
git commit -m "style: add subtle idle bob animation to ghost logo"
```

---

## Chunk 3: RSS Footer Link + Blog TOC

### Task 6: Add RSS link to footer

**Files:**
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Add RSS icon button next to theme toggles**

Add an RSS link before the theme toggle buttons in Footer.astro. Place it in the `flex flex-wrap gap-1 items-center` div, before the light theme button:

```html
<a
  href="/rss.xml"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="RSS Feed"
  class="group size-8 flex items-center justify-center rounded-full"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="group-hover:stroke-black group-hover:dark:stroke-white transition-colors duration-300 ease-in-out"
  >
    <path d="M4 11a9 9 0 0 1 9 9"></path>
    <path d="M4 4a16 16 0 0 1 16 16"></path>
    <circle cx="5" cy="19" r="1"></circle>
  </svg>
</a>
<div class="w-px h-4 bg-black/10 dark:bg-white/10 mx-0.5"></div>
```

The `<div>` is a small vertical separator between the RSS icon and the theme toggles.

- [ ] **Step 2: Verify in browser**

The RSS icon should appear in the footer to the left of the theme toggles, separated by a thin vertical line. Hovering should match the theme button hover style. Clicking should open `/rss.xml` in a new tab.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: add RSS feed link to footer"
```

---

### Task 7: Blog post table of contents component

**Files:**
- Create: `src/components/TableOfContents.astro`
- Modify: `src/pages/blog/[...slug].astro`

- [ ] **Step 1: Create TableOfContents.astro**

Create a new component that receives headings and renders a collapsible TOC. The TOC should only render if there are 3+ headings (short posts don't need it).

```astro
---
type Props = {
  headings: { depth: number; slug: string; text: string }[];
};

const { headings } = Astro.props;
const filteredHeadings = headings.filter((h) => h.depth <= 3);
---

{filteredHeadings.length >= 3 && (
  <details class="my-6 rounded-lg border border-black/15 dark:border-white/20 overflow-hidden">
    <summary class="cursor-pointer px-4 py-2.5 text-sm font-semibold text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200 select-none">
      Table of Contents
    </summary>
    <nav class="px-4 pb-3 pt-1">
      <ul class="space-y-1.5 text-sm list-none pl-0">
        {filteredHeadings.map((heading) => (
          <li style={heading.depth > 2 ? `padding-left: ${(heading.depth - 2) * 1}rem` : ""}>
            <a
              href={`#${heading.slug}`}
              class="no-underline text-black/50 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors duration-200"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </details>
)}
```

- [ ] **Step 2: Add TOC to blog post page**

In `src/pages/blog/[...slug].astro`, import the component and render it above the article content.

Add import:
```ts
import TableOfContents from "@components/TableOfContents.astro";
```

Get headings from the post render (update the render line):
```ts
const { Content, headings } = await post.render();
```

Add the TOC component just before the `<article>` tag:
```html
<div class="animate">
  <TableOfContents headings={headings} />
</div>
<article class="animate">
  <Content />
</article>
```

- [ ] **Step 3: Verify in browser**

1. Navigate to a blog post with 3+ headings — TOC should appear as a collapsible section
2. Click "Table of Contents" to expand/collapse
3. Click a heading link — should smooth-scroll to that section
4. Navigate to a short post with fewer than 3 headings — TOC should not appear

- [ ] **Step 4: Add smooth scroll for anchor links**

Add to `global.css`:

```css
html {
  overflow-y: scroll;
  color-scheme: light;
  font-size: 18px;
  scroll-behavior: smooth;
  scroll-padding-top: 5rem;
}
```

`scroll-padding-top` accounts for the fixed header so anchored headings aren't hidden behind it.

- [ ] **Step 5: Commit**

```bash
git add src/components/TableOfContents.astro "src/pages/blog/[...slug].astro" src/styles/global.css
git commit -m "feat: add collapsible table of contents to blog posts"
```

---

## Final: Start dev server for review

- [ ] **Start the dev server**

```bash
pnpm dev
```

Open `http://localhost:4321` and review all changes:

1. Dot grid background visible in both themes
2. Scroll-triggered reveals on homepage and blog listing
3. Tag pill hover interactions
4. Active theme button indicator
5. Ghost logo bobbing
6. RSS icon in footer
7. TOC on blog posts with 3+ headings
