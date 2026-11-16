# CVE-2024-4040 PoC

Python exploit for CVE-2024-4040

## Description

A server side template injection vulnerability in CrushFTP in all versions before 10.7.1 and 11.1.0 on all platforms allows unauthenticated remote attackers to read files from the filesystem outside of the VFS Sandbox, bypass authentication to gain administrative access, and perform remote code execution on the server. 

## Options

```bash
-h  --help               Show this screen.
-t  --target             Specify target URL
-f  --file               Specify file to include
```

## Examples

```bash
Only test if vulnerable:     exploit.py -t http://10.10.1.23:8080
Include /etc/passwd:         exploit.py -t http://10.10.1.23:8080 -f /etc/passwd
```

## Requirements

- Python3

## Installation

```bash
git clone https://github.com/1ncendium/CVE-2024-4040.git
cd CVE-2024-4040
python3 exploit.py -t http://target:8080
```