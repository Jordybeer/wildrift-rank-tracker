import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function cleanJson(text: string) {
  return text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
}

export async function POST(req: Request) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY in server environment.' }, { status: 500 });
    }

    if (!SUPABASE_URL) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL in server environment.' }, { status: 500 });
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY in server environment.' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Request missing imageBase64.' }, { status: 400 });
    }

    const effectiveMimeType = typeof mimeType === 'string' && mimeType.length > 0 ? mimeType : 'image/jpeg';
    const model = 'gemini-2.0-flash';

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationConfig: {
            responseMimeType: 'application/json',
          },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: 'Extract Wild Rift post-match stats from this screenshot. Respond only as JSON with this schema: {"champion":"string","role":"string","win":boolean,"k_d_a":"string","lp_delta":number,"rank_tier":"string"}',
                },
                {
                  inline_data: {
                    mime_type: effectiveMimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const geminiPayload = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const message = geminiPayload?.error?.message || `Gemini request failed with status ${geminiResponse.status}.`;
      return NextResponse.json({ error: `${message} (model: ${model})` }, { status: 500 });
    }

    const rawText = geminiPayload?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: `Gemini returned no parseable text. (model: ${model})` }, { status: 500 });
    }

    const matchData = JSON.parse(cleanJson(rawText));

    const requiredFields = ['champion', 'role', 'win', 'k_d_a', 'lp_delta', 'rank_tier'];
    for (const field of requiredFields) {
      if (matchData[field] === undefined || matchData[field] === null || matchData[field] === '') {
        return NextResponse.json({ error: `Gemini response missing required field: ${field}` }, { status: 500 });
      }
    }

    const { data, error } = await supabase
      .from('matches')
      .insert([
        {
          champion: String(matchData.champion),
          role: String(matchData.role),
          win: Boolean(matchData.win),
          k_d_a: String(matchData.k_d_a),
          lp_delta: Number(matchData.lp_delta),
          rank_tier: String(matchData.rank_tier),
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: `Supabase insert failed: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, match: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown server error.' }, { status: 500 });
  }
}
