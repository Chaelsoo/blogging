# CLAUDE.md - Writeup Rewriting Brief for chaelsoo.me

This file tells you everything you need to know to rewrite a raw Notion writeup
into a blog post for chaelsoo.me. Read it fully before touching any file.

---

## What this blog is

Personal security blog by Abderrahmen (kanyo), 4th-year cybersecurity engineering
student at ESI SBA, Algeria. CTF player, bug bounty hunter, offensive security focus.
The blog is for the security community: people learning AD attacks, following HTB
seasons, doing CPTS, or just trying to understand how things actually work.

The goal of every post is two things simultaneously:
1. Teach the reader something real about how a vulnerability or technique works
2. Feel like it was written by an actual person who was sitting at a terminal

---

## What this blog runs on

Hugo static site generator with the hugo-blog-awesome theme.

Content lives in `content/writeups/<slug>.md`.
Images live in `static/images/writeups/<slug>/` and are referenced as `/images/writeups/<slug>/filename.png`.

---

## The voice

First person, direct, no filler. Write like you're explaining something to a
sharp friend who is slightly less experienced than you in this specific area.

**Things kanyo says:**
- Short sentences when landing a point. Long ones when building context.
- Casual but precise. Not "the exploit was executed", write "I ran it." instead
- Personal observations mid-section: "This is the kind of thing that shows up
  everywhere in real environments." or "I almost missed this."
- Mentions teammates when relevant: "Did this one with X. Always more fun."
- No corporate speak. No "In conclusion." No "In this post, we will explore."

**Things kanyo does NOT say:**
- "In this writeup, I will..." then just start
- "Let's dive in"
- "As we can see"
- "It is worth noting that" (say it directly instead)
- Passive voice: "the flag was obtained" → "I got the flag"

---

## Structure of a writeup post

### Opening paragraph (no heading)
One or two paragraphs. Set the scene: what is this machine/challenge, what
made it interesting, what's the core concept. This is NOT a summary of steps.
It's a hook. The reader should want to keep going.

Mention a teammate if you did it together. Keep it human.

### Sections
Use `##` for major phases. Typical structure for HTB/CTF:
- Recon
- Foothold (or the specific entry technique)
- Privilege Escalation (or lateral movement, or specific technique name)
- [Optional: Beyond Root / Rabbit Holes / What I Learned]

For bug bounty writeups the structure follows the attack chain, not a template.
Name sections after what actually happened, not generic labels.

### The "why before how" rule (critical)
Before showing a command or exploit, explain why it works. Not a textbook
definition, a 2-4 sentence intuition that makes the reader understand the
concept. If the reader could explain it to someone else after reading your
explanation, you got it right.

### Dead ends and real moments
Include wrong turns when they're instructive or just human. "I tried X first,
it didn't work because Y" is valuable. Don't manufacture drama, but if you
spent 45 minutes on a rabbit hole, mention it briefly.

### Inline asides
Use italics for short asides: disclaimers, observations, context that doesn't
fit in the main flow.

### Cross-references
If a technique appeared in a previous post on the blog, link it by name.
This builds the blog as a connected body of knowledge, not isolated posts.

---

## Teaching philosophy

Every post should leave the reader with a transferable mental model, not just
a set of commands to copy.

**What to explain fully (4-8 sentences + context):**
- Any technique that's non-obvious or has a surprising root cause
- CVEs and how they actually work
- AD attack primitives (RBCD, ADCS ESC*, ACL chains, etc.)
- Anything involving cryptography or protocol internals

**Explain briefly (1-2 sentences):**
- Standard tools used in their obvious way (nmap, gobuster, etc.)
- Techniques covered in a previous post (link instead)

**No explanation needed:**
- Commands that are self-evident from context
- Things every reader at this level already knows

---

## Frontmatter rules

```yaml
---
title: "HTB: Cicada"
description: "One sentence. Technical, past tense. Mention platform + core technique."
date: YYYY-MM-DD
tags: ["htb", "windows", "adcs", "kerberos", "active-directory"]
draft: false
---
```

**Description rule:** 2-3 short sentences max. Should read like something a
person would actually say out loud. Mention the platform, what the interesting
technique was, and what made it click.

Good: "Windows box with a weirdly misconfigured ADCS setup. Turns out you could
rewrite the template attributes yourself and just ask for a domain admin cert.
Certipy makes it almost too easy once you know what to look for."

Bad: "A Windows-based machine featuring ADCS ESC4 misconfiguration enabling
privilege escalation via certificate template modification."

NEVER use the em dash character (—) anywhere. Use a comma, a period, or rewrite.

**Tag convention:** lowercase, hyphenated. Platform tag always included
(linux, windows, web). Technique tags (adcs, kerberos, rbcd, mssql, etc.).
Platform origin tag (htb, ctf, bug-bounty). Season tag if applicable (htb-s11).

**Slug convention:** `htb-cicada`, `htb-escapetwo`, `bug-bounty-dynatrace`.
Lowercase, hyphenated. The filename IS the slug.

---

## Image handling

### Where images come from

Raw screenshots from Notion will already be downloaded into `notion/pics/<slug>/`
before you start. Do not trust the original filenames, they mean nothing.

### Step 1: build the image manifest

Before writing a single line of the post, go through every file in `notion/pics/<slug>/`
and look at each image. For each one, decide:

- What does this screenshot actually show?
- At what point in the attack chain does it belong?
- What should it be called?

Build a manifest:
```
image_01.png -> nmap-initial-scan.png      "nmap output showing ports 88 389 445 open"
image_02.png -> bloodhound-writedacl.png   "BloodHound WriteDacl edge from svc_helpdesk"
image_03.png -> certipy-esc4-request.png   "certipy req output with admin cert issued"
```

### Step 2: copy and rename into the right place

Copy each image from `notion/pics/<slug>/` to `static/images/writeups/<slug>/`
using the meaningful name from the manifest.

### Step 3: place images in the post

Images go where they add information to the narrative. Reference as:
```markdown
![nmap output showing ports 88 389 445 open](/images/writeups/htb-cicada/nmap-initial-scan.png)
```

Alt text = manifest description, written as a sentence describing what's visible.

### Naming convention

`<tool-or-context>-<what-it-shows>.png`

Good: `nmap-initial-scan.png`, `bloodhound-writedacl-path.png`, `certipy-esc4-request.png`
Bad: `image1.png`, `screenshot.png`, `Untitled.png`

---

## What to do with the raw Notion content

Process:
1. Read the full Notion page first. Understand the full attack chain.
2. Identify: what is the core concept this post will teach?
3. Write the opening paragraph around that concept.
4. Structure the sections around what actually happened, not the Notion headings.
5. For each major technique: write the "why" explanation first, then show the commands.
6. Add inline asides where the notes hint at something interesting.
7. Write the frontmatter last.

**Do not** just convert Notion blocks to markdown. Rewrite from scratch using
the notes as source material.

**Preserve all command output.** Full nmap output, ldapsearch results, certipy
template blocks — all of it. Trimming this strips the writeup of its essence.
Only trim extremely long outputs where a representative excerpt makes the point.

**Preserve all references.** Any standalone link in the Notion source is a
deliberate reference. Place it as an italic line near the relevant section:
`*Reference: [Title](url)*`

---

## Quick checklist before committing a post

- [ ] Opening paragraph hooks without being generic
- [ ] Every major technique has a "why" explanation before the commands
- [ ] At least one personal moment (observation, dead end, teammate mention)
- [ ] No passive voice in action sequences
- [ ] All images have descriptive alt text
- [ ] Images copied to `static/images/writeups/<slug>/`
- [ ] Image paths use `/images/writeups/<slug>/filename.png` format
- [ ] Frontmatter description is concise and human
- [ ] Tags are lowercase and follow the convention
- [ ] No filler phrases ("let's dive in", "in this post we will", "as we can see")
- [ ] No em dashes anywhere
