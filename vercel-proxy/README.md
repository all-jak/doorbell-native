# DoorBell Vercel Proxy

This folder is a standalone WooCommerce proxy/backend for Vercel. Deploy this folder only. The Expo mobile app stays where it is.

## What this deploy gives you

- `GET /health`
- `GET /health/woo`
- `GET /config`
- `GET /home`
- `GET /catalog/categories`
- `GET /catalog/products`
- `GET /catalog/products/:slug`
- `POST /checkout/place-order`

## Environment variables

Set these in the Vercel project:

- `DOORBELL_WOO_BASE_URL`
- `DOORBELL_WOO_CONSUMER_KEY`
- `DOORBELL_WOO_CONSUMER_SECRET`

Use `.env.example` as the template.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, create a new project from the repo.
3. Set the project Root Directory to `vercel-proxy`.
4. Add the three WooCommerce environment variables above.
5. Deploy.

This folder uses Vercel's documented zero-config Express setup with `app.ts` at the project root.

## Test after deploy

Replace the domain below with your real Vercel URL.

- `https://your-project.vercel.app/health`
- `https://your-project.vercel.app/health/woo`
- `https://your-project.vercel.app/config`
- `https://your-project.vercel.app/catalog/categories`

Check `/health` first. If that works, check `/health/woo` next. `/health/woo` is the fastest way to confirm that Vercel can actually reach your WooCommerce API.

## Point the mobile app to Vercel

In the Expo app `.env`, set:

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-project.vercel.app
```

Then restart Metro or rebuild the app so the new env value is picked up.
