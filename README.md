## Calendar for Gamers

### Pterodactyl Python environment

This app can run in a Pterodactyl egg with Python. If Node.js/npm is also available,
`server.py` automatically builds the frontend when `dist/` is missing.
If the frontend build is still missing after that, the Python server exits during
startup instead of serving a broken web page.

For Python-only eggs, build the frontend on a machine with Node.js:

```bash
npm install
npm run build
```

If `npm install` fails on Windows with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, run:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npm install
npm run build
```

Upload these files/directories to Pterodactyl:

```txt
server.py
requirements.txt
dist/
```

Set environment variables:

```env
GEMINI_API_KEY=your_api_key
WEB_PORT=your_allocated_port
```

If `WEB_PORT` is omitted, the server also accepts `SERVER_PORT` or `PORT`.
Set `AUTO_BUILD_FRONTEND=false` when using a Python-only egg and uploading `dist/`
manually.

Start command:

```bash
python3 server.py
```
