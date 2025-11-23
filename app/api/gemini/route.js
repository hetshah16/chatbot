// app/api/gemini/route.js
import { NextResponse } from 'next/server';

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_URL || !GEMINI_API_KEY) {
  // Note: This top-level check is optional; you can keep it for faster dev feedback.
  console.warn('GEMINI_API_URL or GEMINI_API_KEY not set in environment.');
}

/**
 * Accepts POST { prompt: "..." } and forwards to Gemini generateContent.
 * Returns JSON { text: "generated text" }.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    if (!GEMINI_API_URL || !GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Server misconfigured: set GEMINI_API_URL and GEMINI_API_KEY' },
        { status: 500 }
      );
    }

    const upstreamBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      // generationConfig: { temperature: 0.2, maxOutputTokens: 512 }
    };

    const r = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify(upstreamBody),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error('Gemini upstream error:', r.status, txt);
      return NextResponse.json(
        { error: 'Upstream Gemini error', status: r.status, details: txt },
        { status: 502 }
      );
    }

    const json = await r.json();
    const generated =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ??
      json?.candidates?.[0]?.content?.[0]?.text ??
      '';

    const out = generated || JSON.stringify(json).slice(0, 1500);
    return NextResponse.json({ text: out });
  } catch (err) {
    console.error('route POST error', err);
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}

/**
 * Optional: expose a GET route for quick health check or to show environment info (safe values only).
 */
export async function GET() {
  return NextResponse.json({ status: 'ok', modelUrl: GEMINI_API_URL ? 'configured' : 'not configured' });
}
