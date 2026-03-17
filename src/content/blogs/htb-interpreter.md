---
title: "HTB Season 10: Interpreter"
description: "A Linux Medium built around a healthcare integration platform. The exploit path is interesting, but the privesc is what makes this machine worth remembering."
author: "Chaelsoo"
pubDate: 2026-02-21
draft: false
tags: ["htb", "season-10", "linux"]
---

Interpreter is a Linux Medium that puts a healthcare integration platform in the spotlight. The domain context adds some flavor. Think HL7, FHIR adjacent tooling, the kind of software that runs hospitals and rarely sees a pentest. Getting in is one thing; what happens after is the more memorable part.

## What's Inside

- A web facing integration platform with an exploitable component
- Enough context clues in the app to understand what you're targeting
- A foothold that requires reading the application's behavior carefully
- A privilege escalation involving code execution in an unexpected context. This one sticks with you

HTB Season 10 is still active. Full writeup drops once this machine retires.
