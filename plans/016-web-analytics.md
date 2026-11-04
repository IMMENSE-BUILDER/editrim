# Vercel Web Analytics

PR #1 from the Vercel bot installed `@vercel/analytics` and mounted the React component at the app root.

## Changes

- `package.json` / `package-lock.json`: `@vercel/analytics@^2.0.1`.
- `src/App.tsx`: `import { Analytics } from '@vercel/analytics/react'` and `<Analytics />` after `<Routes>` inside `ToastProvider`.
- README updated: the old "no analytics" claim is replaced with the actual cookieless, aggregate analytics behaviour.

## Production verification

Vercel project `editrim` has Web Analytics enabled (`webAnalytics.enabledAt` present). On `https://editrim.vercel.app`:

```text
GET  /_vercel/insights/script.js   200  application/javascript
POST /_vercel/insights/view        200  first page view
POST /_vercel/insights/view        200  /dashboard after client-side navigation
```

The injected script reports `@vercel/analytics/react` 2.0.1 and `vam: production`. The script ignores headless/automation user agents by design, so verification uses a normal Chrome fingerprint with `navigator.webdriver` disabled.

## Notes

- Analytics is cookieless and only records page-view metadata; designs, uploads and AI prompts stay out of it.
- No environment variables are required. Enabling Web Analytics in the Vercel project is the only dashboard setting.
