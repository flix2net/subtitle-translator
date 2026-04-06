import { NextRequest, NextResponse } from "next/server";

interface XAIRequest {
  apiKey?: string;
  messages: Array<{ role: string; content: string }>;
  model: string;
  temperature?: number;
  top_p?: number;
}

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as XAIRequest;
    const { apiKey, messages, model, temperature, top_p } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Missing required parameter: messages" }, { status: 400 });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey?.trim()) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const requestBody: Record<string, unknown> = {
      messages,
      model,
    };

    if (temperature !== undefined) requestBody.temperature = temperature;
    if (top_p !== undefined) requestBody.top_p = top_p;

    const response = await fetch(XAI_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("xAI API returned non-JSON response:", responseText.substring(0, 500));
      return NextResponse.json(
        {
          error: `xAI API returned invalid response (HTTP ${response.status}). Check your API key.`,
          details: responseText.substring(0, 300),
        },
        { status: 502 },
      );
    }

    if (!response.ok) {
      console.error("xAI API error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("xAI proxy error:", error);

    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
