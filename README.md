# Wild Rift Rank Tracker & Coach

A full-stack Next.js application that uses Google's free Gemini Vision API to automatically read your Wild Rift post-match screenshots, extract the stats (Champion, KDA, Win/Loss, LP Delta), and log them to a Supabase database. Includes a dashboard with Recharts to visualize your progression over time.

## 🚀 Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (Free Tier)
- **Charts**: Recharts
- **AI/Parsing**: Google Gemini 1.5 Flash (Free Tier)

## ⚙️ Setup Instructions

### 1. Clone & Install
```bash
npm install
```

### 2. Database Setup (Supabase)
1. Create a new free project on [Supabase](https://supabase.com).
2. Go to the SQL Editor in your Supabase dashboard.
3. Paste and run the SQL code found in `supabase/schema.sql`.

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_google_gemini_api_key
```

*Note: You can get your free GEMINI_API_KEY from [Google AI Studio](https://aistudio.google.com/app/apikey).*

### 4. Run Locally
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📱 iOS Shortcut Integration (No Web UI Needed)

You can bypass the web app entirely and log games natively from iOS using the Share Sheet. This is the fastest workflow.

1. Open the **Shortcuts** app on your iPhone.
2. Create a new shortcut and tap the "i" info icon at the bottom -> Enable **"Show in Share Sheet"**. 
3. Change the input to accept **Images** only.
4. Add the **"Encode Media"** action. Make sure it's set to encode the Shortcut Input as **Base64** (set line breaks to 'None').
5. Add the **"Get contents of URL"** action:
   - **URL**: `https://your-deployed-vercel-url.com/api/parse-match`
   - **Method**: POST
   - **Headers**: Add a new header `Content-Type` : `application/json`
   - **Request Body**: Select JSON. Add a dictionary with Key: `imageBase64` and Value: `Encoded Media` (Select the variable from the previous step).
6. Save the shortcut as **"Log WR Match"**.

**How to use:** After a match, take a screenshot, tap the iOS Share button, and tap "Log WR Match". The image is sent to your Next.js API, parsed by Gemini, and saved to your database instantly.
