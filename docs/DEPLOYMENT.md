# Personal Life OS — Hosting and Domain Tutorial

This guide deploys the application from GitHub to Cloudflare Workers, connects it to Supabase, and attaches a custom domain.

## 1. Prepare Supabase

1. Open the Supabase dashboard and select the project.
2. Open **SQL Editor**.
3. Copy the full contents of:

   `supabase/migrations/202607220001_core_foundation.sql`

4. Run the SQL once.
5. Open **Project Settings → API** and copy:
   - Project URL
   - Publishable/anon key
6. Never place the `service_role` key in the browser, repository, or Cloudflare public environment variables.

### Configure authentication URLs

In **Authentication → URL Configuration**:

- During initial testing, add the Worker preview URL, for example:
  `https://personal-life-os.<your-subdomain>.workers.dev`
- After the domain is attached, set the Site URL to the production URL, for example:
  `https://life.example.com`
- Add both production and local development URLs to Redirect URLs:
  - `http://localhost:3000/**`
  - `https://life.example.com/**`

The current app uses Supabase magic-link authentication. After a user submits an email, Supabase sends a secure sign-in link and redirects back to the configured site.

## 2. Configure environment variables locally

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_ANON_KEY
```

Do not commit `.env.local`.

## 3. Test locally

Use Node.js 22 as defined by `.nvmrc`.

```bash
npm ci
npm run dev
```

Open:

- Application: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`

The health endpoint should return `status: "ok"` when both Supabase variables are available.

## 4. Deploy with Cloudflare Workers Builds

1. Sign in to Cloudflare.
2. Open **Workers & Pages**.
3. Select **Create application** and connect the GitHub repository:
   `atemkevin/second-brain-app`
4. Choose `main` as the production branch.
5. Configure the commands currently used by the repository:

   - Build command: `npm run build`
   - Deploy command: `npm run deploy:cloudflare`

6. Add these variables in the Worker build/runtime settings:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

7. Deploy.
8. Open the generated `workers.dev` URL and visit `/api/health`.

## 5. Move to the approved OpenNext runtime

The repository currently contains a Cloudflare-compatible prototype runtime. The approved production target is standard Next.js App Router using `@opennextjs/cloudflare`.

During the runtime-migration pull request, the commands will become:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload"
  }
}
```

After that migration, set Cloudflare's deploy command to:

```bash
npm run deploy
```

Do not manually switch commands until the runtime-migration PR has passed CI.

## 6. Connect a custom domain

A Cloudflare Worker is the application's origin, so use a **Custom Domain**, not a Worker Route.

1. Add your domain to Cloudflare and make sure the zone is active.
2. Open **Workers & Pages** and select the deployed Worker.
3. Open **Settings → Domains & Routes** or the **Domains** tab.
4. Select **Add → Custom Domain**.
5. Enter a hostname such as:

   `life.example.com`

6. Confirm the change.

Cloudflare creates the required DNS record and TLS certificate automatically. The hostname cannot already have a conflicting CNAME record.

## 7. Update Supabase after adding the domain

Return to **Supabase → Authentication → URL Configuration**:

1. Set Site URL to `https://life.example.com`.
2. Add `https://life.example.com/**` to Redirect URLs.
3. Keep the `workers.dev` URL temporarily until production login is verified.

Test:

1. Open the production domain.
2. Select the cloud-account/sign-in option.
3. Request a magic link.
4. Open the email and confirm that it returns to the production domain.
5. Create a capture item.
6. Refresh the page and verify that the item remains available.

## 8. Domain recommendations

For this personal application, use a subdomain instead of replacing an existing main website:

- `life.yourdomain.com`
- `brain.yourdomain.com`
- `app.yourdomain.com`

This keeps the application separate from a portfolio or business website.

## 9. Troubleshooting

### Health endpoint returns 503

One or both Supabase variables are missing in Cloudflare. Add them to both build and runtime variable settings, then redeploy.

### Magic link returns to localhost

Update the Supabase Site URL and Redirect URLs to include the production domain.

### Database request returns permission denied

Confirm that:

- the migration ran successfully;
- the user is authenticated;
- the row's `user_id` equals the authenticated user's ID;
- RLS remains enabled.

### Custom domain cannot be added

Delete any existing CNAME for the same hostname, then add it as a Worker Custom Domain again.

### Never expose these values

Do not expose or commit:

- Supabase `service_role` key
- database password
- Cloudflare API token
- Wrangler authentication files
