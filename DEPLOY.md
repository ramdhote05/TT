Vercel Deployment
=================

Two easy ways to deploy this app to Vercel: CLI or Git integration.

1) Quick deploy (Vercel CLI)

- Install or use npx:

```bash
npx vercel
```

- First run will prompt you to login or create an account. Follow the prompts.
- When asked for project settings, accept defaults. For the build command use:

```
npm run build
```

and the output directory should be `dist` (Vite default).

To push a production deploy:

```bash
npx vercel --prod
```

2) Git integration (recommended for continuous deploys)

- Push your repo to GitHub, GitLab, or Bitbucket.
- In the Vercel dashboard click "New Project" → Import your repo.
- Vercel will detect `package.json`. Set Build Command to `npm run build` and Output Directory to `dist` if not detected.

Files added

- `vercel.json` — contains static-build config and SPA routing.

Production

- Live preview: https://june-task-manager-fs0nyf89s-techrutids-9345s-projects.vercel.app
- Production (aliased): https://june-task-manager.vercel.app

Custom domain (example: `junetasks.com`)

1) Recommended (Apex + www using A records)

Add these records at your DNS provider for the domain `junetasks.com`:

```
A  junetasks.com  76.76.21.21
A  www.junetasks.com 76.76.21.21
```

2) Alternative: Change nameservers to Vercel DNS

Set your domain's nameservers to:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

After adding records, propagation can take a few minutes to a few hours. Vercel will attempt verification automatically; you can also run:

```bash
npx vercel domains inspect junetasks.com
npx vercel domains verify junetasks.com
```

If you'd like, I can add the domain for you and provide the exact DNS entries (I already added `junetasks.com` and `www.junetasks.com` to the project). Once you add the records, tell me and I can verify them.

Notes

- If you use environment variables, add them in the Vercel dashboard under Project Settings → Environment Variables.
- You can preview a build locally with `npm run build` and `npx vercel dev` (requires Vercel CLI).
