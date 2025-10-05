# MacroWire (Next.js + Supabase + OpenAI)

## Deploy rápido sin instalar nada local
1. Sube este código a un repo **GitHub** (usa la web de GitHub → *Add file* → *Upload files* y arrastra todas las carpetas).
2. En **Vercel → New Project → Import from GitHub** selecciona tu repo.
3. En **Vercel → Settings → Environment Variables** añade:
   - `OPENAI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NEWS_FEEDS`
   - `CRON_SECRET` (opcional)
4. Deploy. Vercel programará el cron `/api/ingest` cada 15 min (verlo en Settings → Cron Jobs).
5. Crea la tabla `articles` en Supabase con el SQL del documento inicial.
6. Ejecuta manualmente `https://TU-DOMINIO.vercel.app/api/ingest` (añade header Authorization: Bearer CRON_SECRET si lo configuraste).
7. Visita la portada para ver artículos.

## Desarrollo local (opcional)
```bash
npm install
npm run dev
# configura .env.local con las variables de entorno
```

## Estructura
- `app/api/*` → endpoints (ingest, articles, daily-brief)
- `lib/*` → clientes de Supabase y OpenAI
- `components/ui/*` → componentes UI simples (sin shadcn)
- `app/page.tsx` → portada
- `vercel.json` → cron cada 15 min
- `.env.example` → variables necesarias
