import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing DEEPSEEK_API_KEY" },
      { status: 500 }
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = body.messages;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "'messages' must be a non-empty array" },
      { status: 400 }
    );
  }

  const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
    }),
  });

  if (!deepseekResponse.ok) {
    const errorText = await deepseekResponse.text();
    return NextResponse.json(
      { error: `DeepSeek API error: ${errorText}` },
      { status: deepseekResponse.status }
    );
  }

  const data = await deepseekResponse.json();
  const reply = data.choices?.[0]?.message?.content ?? "";

  return NextResponse.json({ reply });
}
