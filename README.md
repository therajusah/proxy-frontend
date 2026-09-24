# proxy-frontend

RelayNorth public site — the landing page, the browse/relay UI, and the static
policy pages. Split out from the RelayNorth monorepo to deploy on Railway as its
own static service. The API lives in
[`proxy-backend`](https://github.com/therajusah/proxy-backend); the admin console
in [`proxy-admin`](https://github.com/therajusah/proxy-admin).

## What's here

- `index.html` — landing page + relay form.
- `browse.html` — the relay viewer (creates a session and iframes the proxied page).
- `faq/privacy/terms/acceptable-use/copyright/status.html` — static pages.
- `app.js`, `styles.css` — shared script and styles.
- `config.js` — runtime config; sets `window.__API_BASE__` (the backend URL).
- `Dockerfile`, `Caddyfile`, `docker-entrypoint.sh` — static serving for Railway.

## Deploy on Railway (Docker)

Railway auto-detects the `Dockerfile` and serves the site with Caddy on `$PORT`.

1. **New Project → Deploy from GitHub repo →** `therajusah/proxy-frontend`.
2. Set the service variable **`API_BASE`** to the deployed backend's URL, e.g.
   `https://proxy-backend-production.up.railway.app`. The entrypoint bakes it into
   `config.js` at container start (no rebuild needed). Leave empty only if the API
   is served from this same origin.
3. On the **backend** service, add this site's URL to `ALLOWED_APP_ORIGINS` so the
   browser is allowed to call the API cross-origin (CORS).

Local check:

```bash
docker build -t proxy-frontend . && docker run -e PORT=8080 -e API_BASE= -p 8080:8080 proxy-frontend
# open http://localhost:8080
```

## Coupling caveat (read this)

This site was originally rendered **by the backend**. Two consequences when it is
hosted standalone:

- **Static pages and the relay/browse flow work** once `API_BASE` points at the
  backend (session create/status and the proxied iframe all target the API).
- **The blog (`/blog`, `/blog/{slug}`) is server-rendered** by the backend, which
  injects post data into `blog-shell.html` / `article-shell.html`. As a pure static
  service those routes are not populated. To keep the blog, either serve the public
  site from the backend service, or rework `blog-shell.html` to fetch
  `${API_BASE}/api/v1/blog/posts` on the client. The static shells are included here
  so that work can be done in this repo.
