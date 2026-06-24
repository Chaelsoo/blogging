---
description: "Medium Linux box. Exposed .git directory identifies Anuko Time Tracker 1.20, exploited via CVE-2022-24707 SQL injection in the puncher plugin. Webmin on port 10000 hands over root through credential reuse."
tags: ["linux", "anuko", "sqli", "webmin", "hackini"]
title: "HackINI 2026: Legacy"
date: 2026-05-26
draft: false
---


The fourth machine in the chain. A Linux server running two web services on non-standard ports. One was an older Anuko Time Tracker instance with a known SQL injection CVE, the other was a Webmin panel that opened up once you had the right credentials. The interesting part here was that this machine didn't require brute-forcing or clever guessing: the credentials came from earlier in the chain, and the exploit path came from recognizing the software version and knowing where to look.

## Recon

```bash
nmap -sV -sC -T4 10.186.15.197
```

```
PORT      STATE SERVICE  VERSION
22/tcp    open  ssh      OpenSSH 8.4p1 Debian
80/tcp    open  http     Apache httpd 2.4.67 (Debian)
10000/tcp open  http     MiniServ (Webmin)
```

SSH, Apache on 80, and Webmin on 10000. What changed the approach immediately was something nmap's HTTP scripts caught on port 80:

```
| http-git:
|   10.186.15.197:80/.git/
|     Git repository found!
|     Remotes:
|       https://github.com/anuko/timetracker.git
```

A `.git/` directory exposed on the web root. This told me two things: the application is Anuko Time Tracker, and whoever deployed it did a `git clone` directly into the web root without restricting access to `.git/`. In a real engagement that's a high-value finding: you can reconstruct the full source, read every config file ever committed, and find credentials that were hardcoded and later removed. Here it also confirmed the exact application and version.

## Anuko Time Tracker

Browsing port 80 showed the Anuko login page. The version was visible in the UI: **1.20.0.5620**, squarely in the range affected by CVE-2022-24707.

CVE-2022-24707 is a SQL injection in Anuko's puncher plugin. The `date` parameter in the time punch endpoint gets passed directly into a SQL query without sanitization. Three things are needed to trigger it: a valid authenticated session, an existing project in the system, and the puncher plugin enabled.

Credentials from the Drupal intranet earlier in the chain included a temporary password for the Anuko admin account: `admin:Anuko1nTh3Sh3ll`.

**The mistake.** My first instinct was to reset `svc_webmin`'s password through the admin panel, log in as them, and proceed with the exploit. I did it — and immediately broke the challenge. The machine had to be reset by the CTF author.

The obvious lesson in hindsight: resetting a service account's password is a destructive action. It breaks integrations, triggers alerts, and in a CTF that simulates real infrastructure, it breaks the machine for everyone. The right mindset is to harvest or replicate access, not overwrite it.

**The right approach.** Instead of touching `svc_webmin`, I used the admin account to create a new group with equivalent permissions:

![Anuko Adding Group form — creating a new Manager group as kanyo](/images/writeups/hackini-legacy/image.png)

Same capabilities, no existing account modified, infrastructure stays intact. Logged in as the new user, then enabled the puncher plugin:

![Anuko Time Tracker Plugins page showing Puncher enabled with Configure link highlighted](/images/writeups/hackini-legacy/activate_plugin.png)

**Exploiting CVE-2022-24707.** With a project set up and the puncher plugin active under the new session:

```bash
python3 anuko_sqli.py \
  --url http://10.186.15.197 \
  --user testuser \
  --pass '<password>' \
  --action dump-users
```

The injection dumped all user password hashes from the Anuko database. Older versions used MD5-based hashing, crackable offline:

```bash
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
```

![hashcat cracking the MD5 hash from the Anuko SQLi dump, result: webm@ster](/images/writeups/hackini-legacy/crack.png)

Cracked: `webm@ster`.

## Webmin

Webmin runs as root by default on most Linux installations: it's a system administration panel that needs root-level access to manage users, services, and files. Credential reuse from earlier in the chain got me in on port 10000.

Once authenticated, command execution as root was straightforward through Webmin's built-in modules.

![Webmin File Manager browsing root's home directory with payroll-reconciliation-emergency.txt selected](/images/writeups/hackini-legacy/flag_from_webmin.png)

Root on legacy.

## Reflection

The `.git/` exposure is one of those findings that looks trivial but has real impact. Commit history, stripped config files, hardcoded secrets: an exposed `.git/` is consistently one of the higher-value quick wins in web recon.

CVE-2022-24707 is also a good example of a vulnerability that requires a specific setup to trigger. It's not a one-shot unauthenticated RCE. In the context of the CTF chain though, you arrive at this machine with credentials, which is exactly how a real pentest plays out after compromising earlier infrastructure.

The `svc_webmin` mistake is the one that stuck with me. The instinct to just reset a password and move on is fast but destructive. In a real engagement that's the kind of action that breaks production and ends contracts. CTFs that simulate real environments are good at punishing exactly that instinct: you can't undo a password change the way you can undo a flag submission.
