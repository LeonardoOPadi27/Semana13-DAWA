# Despliegue en Vercel

Configura estas variables en Vercel Project Settings > Environment Variables:

```env
NEXTAUTH_URL=https://tu-app.vercel.app
NEXTAUTH_SECRET=un_secret_largo
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

El registro con credenciales usa Vercel KV o Upstash Redis por REST en produccion.
En local usa `data/users.json` como fallback.

Callbacks OAuth:

```txt
https://tu-app.vercel.app/api/auth/callback/google
https://tu-app.vercel.app/api/auth/callback/github
```

Build command:

```txt
npm run build
```

Output framework preset:

```txt
Next.js
```
