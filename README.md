# EzyVest

EzyVest is an app-first financial intelligence and paper-trading platform. It is designed for evidence-led research, not personalized investment advice or real-money trading.

## Run web

```bash
npm install
copy .env.example .env.local
npm run dev
```

Set `TWELVE_DATA_API_KEY` for development-market data. The interface shows unavailable states instead of invented prices when it is absent. `GEMINI_API_KEY` is reserved for the server-side grounded research provider; it is never exposed to the browser.

## Database

Apply `supabase/migrations/202609140001_ezyvest_foundation.sql` using the Supabase SQL editor or CLI. It creates the normalized market, research, thesis, paper-trading, watchlist, source, and RLS foundations.

## Mobile

The Expo starter is in `mobile/` and is intentionally separate from the web dependency tree:

```bash
cd mobile
npm install
npm start
```

## Required environment variables

`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `GEMINI_API_KEY`, and (for current development market data) `TWELVE_DATA_API_KEY`.

`NEXT_PUBLIC_SUPABASE_*` values are the Supabase URL and publishable/anon key only; never put the secret/service key in a public variable. For official SEC retrieval, set an identifying `SEC_USER_AGENT` value. Gemini research intentionally remains unavailable until vetted source retrieval is connected; EzyVest will not send ungrounded prompts to a model.

## Product capabilities

Authentication, profiles, watchlist creation, and immediate-execution paper orders use Supabase and RLS. Apply the migration before using them. Paper orders execute through the atomic `execute_paper_order` database function; balances and positions are never client-calculated. A stored `securities` record is required before placing an order.

The web app is ready for Vercel once environment variables are configured. Expo/EAS deployment still requires each platform's developer credentials and has not been submitted to app stores.
