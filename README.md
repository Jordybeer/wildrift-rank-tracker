# Wild Rift Rank Tracker & Coach

A full-stack Next.js application that uses Google's free Gemini Vision API to automatically read your Wild Rift post-match screenshots, extract the stats (Champion, KDA, Win/Loss, LP Delta), and log them to a Supabase database. Includes a dashboard with Recharts to visualize your progression over time.

## 🚀 Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (Free Tier)
- **Charts**: Recharts
- **AI/Parsing**: Google Gemini 1.5 Flash (Free Tier)
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
5. Copy these three values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`) → This is `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key (long string under "Project API keys") → This is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key (click "Reveal" to see it) → This is `SUPABASE_SERVICE_ROLE_KEY`

#### Create Database Table
1. In your Supabase project, go to **SQL Editor** (lightning bolt icon in sidebar).
2. Click **"New Query"**.
3. Copy the entire contents of `supabase/schema.sql` from this repo and paste it into the editor.
4. Click **"Run"** (or press `Ctrl+Enter`).
5. You should see "Success. No rows returned" — this means your `matches` table is created.

#### Google Gemini (Vision AI)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API Key"**.
4. Copy the key → This is `GEMINI_API_KEY`

---

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Import your `wildrift-rank-tracker` repository.
4. Vercel will auto-detect it's a Next.js project.
5. **Before clicking Deploy**, expand **"Environment Variables"** and add these 4 variables:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role secret |
   | `GEMINI_API_KEY` | Your Google Gemini API key |

6. Click **"Deploy"**.
7. Wait 2-3 minutes for the build to complete.
8. You'll get a URL like `https://wildrift-rank-tracker.vercel.app` — **Save this URL!**

#### Option B: Deploy via Vercel CLI (Advanced)
```bash
npm i -g vercel
vercel login
vercel --prod
```
Follow the prompts and add your environment variables when asked.

---

### Step 3: Test Your Deployment

1. Open your Vercel deployment URL in a browser.
2. You should see the dark dashboard with "Wild Rift Tracker & Coach" at the top.
3. Click **"Choose File"** and upload any Wild Rift post-game screenshot.
4. Wait 3-5 seconds. If it works:
   - You'll see the match appear in the "Recent Matches" section.
   - The LP chart will update.
5. If you get an error:
   - Go to your Vercel project dashboard → **Deployments** → Click the latest one → **Function Logs**.
   - Look for errors mentioning missing API keys.

---

### Step 4: iOS Shortcut (Upload Screenshots from Your Phone)

This lets you log matches instantly from your iPhone without opening a browser.

1. Open the **Shortcuts** app on your iPhone.
2. Tap the **"+"** icon to create a new shortcut.
3. Tap the three dots at the top-right, then:
   - **Turn ON** "Show in Share Sheet"
   - Under "Share Sheet Types", select **Images** only
4. Add actions in this exact order:

   **Action 1: Get Shortcut Input**
   - Should already be there by default (it's the screenshot you'll share)

   **Action 2: Base64 Encode**
   - Search for "Base64 Encode"
   - Set **Input** to "Shortcut Input"
   - Set **Line Breaks** to **None**

   **Action 3: Get Contents of URL**
   - Search for "Get Contents of URL"
   - **URL**: `https://YOUR-VERCEL-URL.vercel.app/api/parse-match` (replace with your actual URL)
   - **Method**: POST
   - **Headers**: Tap "Add new field" → Key: `Content-Type`, Value: `application/json`
   - **Request Body**: JSON
   - Tap "Add new field" → Key: `imageBase64`, Value: tap and select **Base64 Encoded** (the blue variable from step 2)

   **Action 4: Show Notification (Optional)**
   - Search for "Show Notification"
   - Set text to "Match logged successfully!"

5. Tap **Done** and name it **"Log WR Match"**.

#### How to Use:
- After a Wild Rift game, take a screenshot.
- Tap the screenshot thumbnail → Share button.
- Scroll down and tap **"Log WR Match"**.
- Wait 3-5 seconds. Done!

---

## 🛠️ Troubleshooting

### "Failed to parse match. Make sure API keys are set."
**Fix**: You added env vars to Vercel but forgot to redeploy.
1. Go to Vercel Dashboard → Your Project → **Deployments** tab.
2. Click the three dots next to your latest deployment → **Redeploy**.
3. Wait for the build to finish, then try again.

### "Error: fetch failed" in iOS Shortcut
**Fix**: Check your API URL in the shortcut.
- Make sure it ends with `/api/parse-match`
- Make sure it's `https://` not `http://`
- Test the URL in Safari first to make sure your site loads.

### No matches showing on dashboard
**Fix**: Your Supabase table might not be set up correctly.
1. Go to Supabase Dashboard → **Table Editor**.
2. You should see a table called `matches`. If not, run the `supabase/schema.sql` script again.

### Gemini API says "API key not valid"
**Fix**: Regenerate your API key.
1. Go back to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Delete the old key and create a new one.
3. Update the `GEMINI_API_KEY` in Vercel → Redeploy.

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
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
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
- [ ] Scriptable iOS widget for at-a-glance stats
- [ ] Export data as CSV

---

## 📝 License

MIT - Do whatever you want with this.
