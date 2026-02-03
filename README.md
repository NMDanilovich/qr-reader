QR-reader
---
This is a simple website designed to keep score for my wife's birthday contest. The idea was that for each ID there is a specific QR code and when scanned, the counter should be updated.

## Propertys

## Using

Install the poetry manager

```bash
python3 -m pip install --user pipx
pipx install poetry
```

Install dependencies

```bash
python3 -m venv .venv
.\.venv\Scripts\activate # for Windows
. .venv/bin/activate # for Linux
poetry install
```

For correctly work we need create https connaction. First, find out your server's IP address

```bash
ipconfig # for Windows
ifconfig # for Linux
```

then replace with your local network address in command and generate the temporary self-signed certificate. 

```bash
cd ssl-certs
openssl.exe req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=RU/CN=myhomeserver" -addext "subjectAltName = IP:192.168.*.*,DNS:myhomeserver.local" -config ssl-config.cnf
```

Two files should appear. To check the correctness of the generation, use

```bash
openssl x509 -in cert.pem -text -noout
openssl x509 -in cert.pem -dates -noout
openssl rsa -in key.pem -check
openssl s_client -connect 192.168.*.*:8080
```

Run the project

```bash
uvicorn client.main:app --host 0.0.0.0 --port 8080 --reload --ssl-keyfile ssl-certs/key.pem --ssl-certfile ssl-certs/cert.pem
```
