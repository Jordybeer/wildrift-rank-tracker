# Wild Rift Rank Tracker & Coach

A full-stack Next.js application for tracking your Wild Rift ranked progression. Log matches manually, visualize your LP over time, and see detailed stats per champion.

## 🚀 Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (Free Tier)
- **Charts**: Recharts
- **Deployment**: Vercel (Free Tier)

---

## ⚙️ Complete Setup Guide

### Step 1: Get Your Free API Keys

#### Supabase (Database)
1. Go to [supabase.com](https://supabase.com) and sign up for free.
2. Click **"New Project"** and fill in:
   - Project name: `wildrift-tracker` (or any name)
   - Database password: Generate a strong password and save it
   - Region: Choose closest to you
3. Wait 2-3 minutes for the project to provision.
4. Once ready, click on your project and go to **Project Settings** (gear icon in sidebar) → **API**.
5. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`) → This is `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key (long string under "Project API keys") → This is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Create Database Table
1. In your Supabase project, go to **SQL Editor** (lightning bolt icon in sidebar).
2. Click **"New Query"**.
3. Copy the entire contents of `supabase/schema.sql` from this repo and paste it into the editor.
4. Click **"Run"** (or press `Ctrl+Enter`).
5. You should see "Success. No rows returned" — this means your `matches` table is created.

---

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Import your `wildrift-rank-tracker` repository.
4. Vercel will auto-detect it's a Next.js project.
5. **Before clicking Deploy**, expand **"Environment Variables"** and add these 2 variables:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |

6. Click **"Deploy"**.
7. Wait 2-3 minutes for the build to complete.
8. You'll get a URL like `https://wildrift-rank-tracker.vercel.app` — **Save this URL!**

---

### Step 3: Start Logging Matches

1. Open your Vercel deployment URL in a browser.
2. You should see the dark dashboard with "Wild Rift Tracker & Coach" at the top.
3. Fill out the manual match entry form:
   - Champion name
   - Role (Top, Jungle, Mid, ADC, Support)
   - K/D/A
   - Win or Loss
   - LP Change (e.g., `15` or `-12`)
   - Rank Tier (optional)
4. Click **"Log Match"**.
5. Your match appears in the Recent Matches section and the LP chart updates automatically.

---

## 🛠️ Troubleshooting

### No matches showing on dashboard
**Fix**: Your Supabase table might not be set up correctly.
1. Go to Supabase Dashboard → **Table Editor**.
2. You should see a table called `matches`. If not, run the `supabase/schema.sql` script again.

### Supabase read/write errors
**Fix**: Check your environment variables.
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**.
2. Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly.
3. Redeploy after any changes.

---

## 🧪 Local Development (Optional)

If you want to run this on your computer instead of Vercel:

```bash
git clone https://github.com/Jordybeer/wildrift-rank-tracker.git
cd wildrift-rank-tracker
npm install
```

Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Run the dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📊 What This Tracks

- ✅ Champion played
- ✅ Role (Top, Jungle, Mid, ADC, Support)
- ✅ Win/Loss
- ✅ KDA (Kills/Deaths/Assists)
- ✅ LP gained or lost
- ✅ Rank tier
- ✅ Timestamp (automatic)

## 🎯 Roadmap

- [ ] Per-champion win rate analytics
- [ ] Time-of-day performance heatmap
- [ ] Session tracking (group consecutive games)
- [ ] AI coaching insights ("You lose more after 11 PM")
- [ ] iOS Shortcuts integration for faster logging
- [ ] Export data as CSV

---

## 📝 License

MIT - Do whatever you want with this.
