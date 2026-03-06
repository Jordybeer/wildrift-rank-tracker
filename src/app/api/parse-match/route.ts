import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    // 1. Send to Google Gemini Vision to parse
    // Using gemini-1.5-flash for fast, free multimodal parsing
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an assistant that extracts League of Legends: Wild Rift post-match stats from screenshots. 
    Respond ONLY with a valid JSON object matching this exact schema: 
    { "champion": "string", "role": "string (e.g., top, jungle, mid, adc, support)", "win": boolean, "k_d_a": "string (e.g., 10/2/5)", "lp_delta": number (e.g., 15 or -12), "rank_tier": "string" }`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const content = result.response.text();
    
    if (!content) throw new Error("No content returned from Gemini");
    
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
