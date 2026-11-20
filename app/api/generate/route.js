import { NextResponse } from "next/server";

/**
 * AI generation endpoint.
 *
 * The integration is real: when OPENAI_API_KEY is configured this calls an
 * OpenAI-compatible chat completion endpoint and returns a structured concept.
 * Without a key it answers 503 so the studio can show an honest "not connected"
 * state instead of pretending a generation happened.
 */
const SYSTEM_PROMPT = `You are the concept director for NAYSPERA AI, a creative community.
Turn the user's idea into a rich creative concept brief.
Reply with strict JSON only: {"title": string, "description": string, "tags": string[]}.
The title is at most 8 words. The description is 2-3 sentences about mood, lighting,
composition and materials. Tags are 2-4 short capitalised labels.`;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const prompt = String(body?.prompt || "").trim();
  const category = String(body?.category || "Concept Art");
  const style = String(body?.style || "Cinematic");

  if (prompt.length < 8) {
    return NextResponse.json(
      { error: "Describe your idea in at least 8 characters." },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "AI generation is not connected in this build. Add OPENAI_API_KEY to .env.local to enable it.",
      },
      { status: 503 }
    );
  }

  const baseUrl = (
    process.env.OPENAI_BASE_URL || "https://freebuff.com/api/v1/paid"
  ).replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Category: ${category}\nStyle: ${style}\nIdea: ${prompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("NAYSPERA AI upstream error", response.status, detail.slice(0, 400));
      return NextResponse.json(
        {
          error: "upstream_error",
          message: "The generation service could not be reached.",
        },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const raw = payload?.choices?.[0]?.message?.content || "";
    let concept;
    try {
      concept = JSON.parse(raw);
    } catch {
      concept = { title: "Generated concept", description: raw, tags: [category] };
    }

    return NextResponse.json({
      concept: {
        title: String(concept.title || "Untitled concept").slice(0, 90),
        description: String(concept.description || "").slice(0, 600),
        tags: Array.isArray(concept.tags)
          ? concept.tags.slice(0, 4).map((tag) => String(tag).slice(0, 24))
          : [category],
      },
    });
  } catch (error) {
    console.error("NAYSPERA AI request failed", error);
    return NextResponse.json(
      { error: "request_failed", message: "The generation request failed." },
      { status: 500 }
    );
  }
}
