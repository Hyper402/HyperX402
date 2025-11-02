// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, model = "anthropic/claude-3.5-sonnet", temperature = 0.6 } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY!;
    const base = process.env.OPENROUTER_BASE || "https://openrouter.ai/api/v1";
    if (!apiKey) return NextResponse.json({ error: "server key missing" }, { status: 500 });

    const resp = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature }),
      // no-cache helps while developing
      cache: "no-store",
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: text || resp.statusText }, { status: 500 });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
