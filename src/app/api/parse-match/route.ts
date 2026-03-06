import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    // 1. Send to OpenAI Vision to parse
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an assistant that extracts League of Legends: Wild Rift post-match stats from screenshots. 
          Respond ONLY with a valid JSON object matching this exact schema: 
          { "champion": string, "role": string, "win": boolean, "k_d_a": string (e.g. "10/2/5"), "lp_delta": number (e.g. 15 or -12), "rank_tier": string }`
        },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content returned from OpenAI");
    
    const matchData = JSON.parse(content);

    // 2. Save to Supabase
    const { data, error } = await supabase.from('matches').insert([
      {
        champion: matchData.champion,
        role: matchData.role,
        win: matchData.win,
        k_d_a: matchData.k_d_a,
        lp_delta: matchData.lp_delta,
        rank_tier: matchData.rank_tier,
      }
    ]).select();

    if (error) throw error;

    return NextResponse.json({ success: true, match: data[0] });

  } catch (error: any) {
    console.error("Error parsing match:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
