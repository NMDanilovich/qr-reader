```bash
python3 -m pip install --user pipx
```

```bash
pipx install poetry
```

```bash
python3 -m venv .venv
.\.venv\Scripts\activate
poetry install
```

```bash
ipconfig
```

```bash
openssl.exe req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=RU/CN=myhomeserver" -addext "subjectAltName = IP:192.168.1.10,DNS:myhomeserver.local" -config ssl-config.cnf
```

```bash
openssl x509 -in cert.pem -text -noout
```

```bash
openssl x509 -in cert.pem -dates -noout
```

```bash
openssl rsa -in key.pem -check
```

```bash
uvicorn client.main:app --host 0.0.0.0 --port 8080 --reload --ssl-keyfile ssl-certs/key.pem --ssl-certfile ssl-certs/cert.pem
```

```bash
openssl s_client -connect 192.168.1.10:8080
```

