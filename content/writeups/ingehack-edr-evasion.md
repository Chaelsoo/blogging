---
description: "An Active Directory series from IngeHack. First challenge: bypassing Windows Defender to get tooling onto the machine. The rest of the chain is in progress."
tags: ["windows", "active-directory", "edr-evasion", "antivirus-bypass", "ingehack"]
title: "IngeHack: EDR Evasion"
date: 2026-04-21
draft: false
---


An Active Directory series from IngeHack. The chain is built around a Windows environment with Defender active — meaning before you can do anything meaningful, you have to get your tooling past it. That was the first challenge, and the one this writeup covers for now.

The approach was modifying GodPotato to strip or replace the signatures that Defender flags, combined with techniques for building custom versions of common tools that don't carry recognizable bytecode patterns. The two resources below were the most useful references for this:

- [Modifying GodPotato to Evade Antivirus](https://freedium-mirror.cfd/https://medium.com/@luisgerardomoret_69654/modifying-godpotato-to-evade-antivirus-f066aa779cf9)
- [Custom Tools Antivirus Bypass](https://cyberwave.network/custom-tools-antivirus-bypass/)

*To be continued.*
