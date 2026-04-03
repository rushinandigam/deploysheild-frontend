# Deploy frontend on Render (Static Site)

**No GitHub Actions** — use the [Render dashboard](https://dashboard.render.com). The API should already be deployed as a Render **Web Service**; use its URL as **`VITE_API_BASE_URL`**.

---

## Create a Static Site

1. **New → Static Site** → connect this GitHub repo.
2. **Root directory:** leave empty (repo root).
3. **Build command:**  
   `pnpm install && pnpm run build`
4. **Publish directory:** `dist`

## Environment (build-time — required)

Add in Render **Environment** for this static site:

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | Your backend URL, e.g. `https://your-api.onrender.com` (**no** trailing slash) |

Vite reads this when `pnpm run build` runs on Render.

The backend allows **all** origins in CORS — no `CORS_ORIGINS` setup needed.

## After you change the API URL

Update **`VITE_API_BASE_URL`** on the static site, then **Clear build cache & deploy** (or trigger a new deploy).

## Local preview of production build

```bash
export VITE_API_BASE_URL=https://your-api.onrender.com
pnpm run build
pnpm run preview
```

---

## Optional: Firebase Hosting

If you use Firebase instead, build locally with `VITE_API_BASE_URL` set, then `firebase deploy --only hosting`. **`firebase.json`** / **`.firebaserc`** are optional; not required for Render-only hosting.
