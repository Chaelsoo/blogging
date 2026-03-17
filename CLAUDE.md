# CLAUDE.md — kanyo's blog

This file is read automatically by Claude Code at the start of every session.
Follow all instructions here by default, unless explicitly told otherwise.

---

## Project Overview

This is an Astro blog using the Space Ahead theme, deployed on GitHub Pages.
- **Author:** Abderrahmen (kanyo)
- **GitHub:** github.com/Chaelsoo
- **Live URL:** https://chaelsoo.github.io
- **Blog posts:** src/content/blogs/ (.md or .mdx files)
- **Config:** src/site.config.ts

---

## Writing Style Guide

When writing, editing, or polishing any blog post, follow this style:

### Voice & Tone
- First person, casual and direct, write like you're explaining to a friend who knows the basics
- Think out loud, show the reasoning process, not just the steps
- Ask questions and answer them: "So how do I use this? Let me show you."
- Avoid sounding like documentation or a tutorial, sound like a person

### Structure
- Short paragraphs, 2-3 sentences max
- Use headers to split sections, but not too many
- Add personal commentary between technical steps ("this tripped me up", "the docs hint at something here")
- Add a `TIP:` callout when there's a useful shortcut or trick

### What to Avoid
- Don't list every single step robotically
- Don't open with "In this blog post I will..."
- Don't over-explain things the reader likely already knows
- No filler phrases like "it's worth noting that" or "as we can see"
- NEVER use em dashes (—). Use a comma, period, or rewrite the sentence instead.

### Formatting
- Code blocks for all commands and snippets
- Explain what a command does BEFORE showing it, not after
- If referencing an external resource, say why it's good
- Keep it human, if it sounds like AI wrote it, rewrite it

### Tags
- Keep tags minimal: only "htb" and the OS type (linux, windows, freebsd, etc.)
- Example: tags: [htb, linux]
- Do NOT add technique tags, CVE tags, difficulty tags, or anything else
- The author will add extra tags manually if needed

---

## Blog Post Frontmatter Format

Check existing posts in src/content/blogs/ for the exact format.
Standard fields:
```
---
title: ""
description: ""
pubDate: YYYY-MM-DD
tags: []
draft: false
---
```

---

## Identity & Site Config

- Site name: kanyo
- Author: Abderrahmen
- Hero heading: "a work in progress"
- Hero badge/tag: "cybersec · cloud · automation"
- Hero bio: "I write about things so they stick around, maybe they will for you too."
- Socials: GitHub (github.com/Chaelsoo), X, LinkedIn (linkedin.com/in/chaelsoo)

---

## Rules

- Never change the visual design, colors, fonts, or layout unless explicitly asked
- Always check existing files before creating new ones
- When adding features, do one at a time and verify it works before moving on
- Don't install packages without mentioning it first
