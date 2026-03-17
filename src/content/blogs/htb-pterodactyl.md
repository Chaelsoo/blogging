---
title: "HTB Season 10: Pterodactyl"
description: "A Linux Medium built around a game server management panel. Exploitation leads through database access all the way to root, with a couple of interesting hops in between."
author: "Chaelsoo"
pubDate: 2026-02-07
draft: false
tags: ["htb", "season-10", "linux"]
---

Pterodactyl is a Linux Medium that puts a popular open source game server panel front and center. If you've ever set up a Minecraft or game hosting environment, the interface will feel familiar, which makes spotting what's wrong with it a bit more satisfying.

## What's Inside

- A known vulnerability in a widely deployed panel. Enumeration pays off here
- Database access as a stepping stone, not the final goal
- Credential reuse across services (classic, but it works)
- A privilege escalation that builds naturally on what you already have

HTB Season 10 is still active. Full writeup drops once this machine retires.
