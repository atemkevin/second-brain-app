# Deploy Second Brain to Cloudflare Workers

The app builds as a Cloudflare Worker with static assets and uses Supabase for authentication and data.

## Recommended: Cloudflare Builds with GitHub

1. Push this project to a GitHub repository.
2. In Cloudflare, open **Workers & Pages**, choose **Create application**, then **Import a repository**.
3. Select the GitHub repository and use these settings:
   - Worker name: `second-brain-app`
   - Build command: `npm run build`
   - Deploy command: `npm run deploy:cloudflare`
   - Production branch: `main`
4. Add these Worker environment variables in Cloudflare:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy and copy the resulting `workers.dev` URL.
6. In Supabase **Authentication → URL Configuration**, set the Cloudflare URL as the Site URL and add it to Redirect URLs.

Do not add the Supabase `service_role` key. The publishable key is the correct browser-facing credential; Row Level Security protects each user's records.

## Command-line alternative

After authenticating Wrangler locally:

```sh
npm ci
npm run build
npm run deploy:cloudflare
```

Configure the two environment variables in the Cloudflare dashboard before using cloud sync.
