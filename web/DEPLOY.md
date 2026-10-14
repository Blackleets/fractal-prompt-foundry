# Deploy — Fractal Prompt Foundry (web/)

App estática local-first. Sin backend.

## Local

```bash
cd web
npm install
npm run dev     # http://localhost:3000
npm run test
npm run build
```

## Vercel (recomendado)

- Root Directory: `web`
- Build: `npm run build`
- Output: `dist`
- `vercel.json` ya incluye rewrites SPA + cache de assets + `/health.json`.

## Cloudflare Pages / Netlify

- Build: `npm run build`, output `dist`.
- SPA fallback a `/index.html`. `public/404.html` incluido.

## Notas prod v1.0

- Modo heurístico por defecto, sin key.
- LLM opcional BYOK desde Settings (la key queda solo en tu navegador).
- Share links `?run=` llevan solo prompt + reporte, nunca API keys.
- Health: `/health.json`.
