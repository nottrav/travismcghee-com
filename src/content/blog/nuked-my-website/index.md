---
title: "I Nuked My Website"
description: "Migrating from WordPress to Astro wasn't pretty, but it was worth it."
tags:
  - Web Development
date: 2026-01-30
---

Same URL. Completely different site underneath.

The old one ran on WordPress — paid hosting, a graveyard of plugins, pages that took three seconds to load a paragraph of text. I'd stopped noticing how slow it was, the same way you stop noticing a noise until it's gone.

Then I tried to update a plugin and the admin panel went white. Classic WordPress white screen of death. I fixed it, closed the laptop, and sat there thinking: I'm actually paying money for this experience.

That night I started looking at alternatives. By morning I'd landed on Astro and Netlify. Static files, Markdown posts, no database, no dashboard. Push to GitHub and the site updates. The whole thing made sense to me in a way WordPress never did.

## The Migration Became a Redesign

I told myself it would be a straightforward port. It wasn't. Once I was already tearing things apart, it felt wrong to put them back the same way. I rebuilt the layout from scratch — cleaner typography, a dark mode toggle, pages that load in under a second. If I was going to blow up the site anyway, I might as well come out the other side with something I actually liked.

## The Real Pain

Getting the old posts out was where things got ugly. WordPress exports a bloated XML file full of tags, shortcodes, and formatting that means nothing outside of WordPress. Converting that to clean Markdown took longer than building the new site.

I lost an afternoon to regex and trial and error. Paragraphs that wouldn't split right. Characters that rendered as gibberish. Links that quietly pointed nowhere. Each post needed a pass to clean it up before it looked like something a human had written.

## Worth It

The site is faster, simpler, and actually mine. I know how every piece of it works. Writing a post means opening a Markdown file instead of fighting a dashboard. No plugins to update, no mysterious white screens.

If something looks broken, let me know. And if it loads fast enough that you don't notice — that's the point.
