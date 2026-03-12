# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev            # dev server at localhost:4321
pnpm build          # tsc + astro build to ./dist/
pnpm preview        # preview production build
pnpm lint           # ESLint
pnpm lint:fix       # auto-fix lint issues
pnpm run astro ...  # Astro CLI (e.g. astro check, astro add)
```

## Architecture

Static Astro site (no server runtime). All pages use `getStaticPaths()` for pre-rendered HTML.

**Routing** maps directly to `src/pages/`:
- `/` → `index.astro` (homepage: featured projects + latest posts)
- `/blog/` → listing grouped by year; `/blog/[...slug]` → individual posts
- `/blog/tag/[tag]` → tag-filtered listing
- `/projects/` → listing; `/projects/[...slug]` → individual projects
- `rss.xml`, `robots.txt` generated via `.ts` endpoint files

**Content collections** live in `src/content/`:
- `blog/` — markdown/MDX posts. Schema: `title`, `description`, `date`, `draft?`, `tags?`, `series?` (`{ name, order }`)
- `projects/` — markdown entries. Schema: `title`, `description`, `date`, `draft?`, `featured?`, `status?` (planning/in-progress/completed), `stack?`, `image?`, `demoURL?`, `repoURL?`

**Layout chain:** every page uses `PageLayout.astro` → includes `Head.astro`, `Header.astro`, `Footer.astro`. `Container.astro` provides `max-w-screen-sm` centering.

**Site-wide constants** are in `src/consts.ts`: site name, homepage post/project counts, social links. Update this file when changing global metadata.

**Path alias:** `@` → `./src/` (e.g. `import { cn } from "@/lib/utils"`).

## Key Conventions

- **Linting:** semicolons required, double quotes required (enforced by ESLint)
- **TypeScript:** strict mode (`astro/tsconfigs/strict`), `strictNullChecks: true`
- **Styling:** Tailwind utility classes + `@tailwindcss/typography` for prose content; dark mode is class-based
- **Class merging:** use `cn()` from `@/lib/utils` (wraps `clsx` + `tailwind-merge`)
- **Theme toggle:** handled in `Footer.astro`; favicon also switches on theme change (logic in `Head.astro`)

## Adding Content

New blog post: create a `.md` or `.mdx` file in `src/content/blog/`. The filename becomes the slug.
New project: create a `.md` file in `src/content/projects/`.

## Notes

- `astro.config.mjs` still has the placeholder site URL (`astro-nano-demo.vercel.app`) — update before deploying
- Tag utility functions including special `"DCIM Capstone"` handling live in `src/lib/utils.ts`
- PDFs served from `public/` (capstone, research papers)
