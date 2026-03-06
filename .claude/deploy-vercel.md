Read CLAUDE.md for system goals and .claude/context.md for where we left off. Deploy this Next.js app to Vercel:

1. Install Vercel CLI if not already installed: npm i -g vercel
2. Run: vercel link (link to existing Vercel account, create new project "gstreet-ledger")
3. Set environment variables on Vercel (use vercel env add for each):
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - DATABASE_URL
   - PLAID_CLIENT_ID
   - PLAID_SECRET
   - PLAID_ENV (set to "sandbox")
   - PLAID_TOKEN_ENCRYPTION_KEY (generate a 32-byte hex key)
   Read values from .env.local for the ones that exist.
4. Run: vercel --prod to deploy
5. Verify the deployment URL works
6. Add the Plaid redirect URI: add the Vercel production URL to Plaid's allowed redirect URIs (note this for the user to do manually in Plaid dashboard)

Update .claude/context.md with the production URL when done. Commit and push.
