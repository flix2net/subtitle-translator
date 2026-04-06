import { NextRequest, NextResponse } from "next/server";

interface MistralRequest {
  apiKey?: string;
  messages: Array<{ role: string; content: string }>;
  model: string;
  temperature?: number;
  top_p?: number;
}

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MistralRequest;
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

    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Mistral API returned non-JSON response:", responseText.substring(0, 500));
      return NextResponse.json(
        {
          error: `Mistral API returned invalid response (HTTP ${response.status}). Check your API key.`,
          details: responseText.substring(0, 300),
        },
        { status: 502 },
      );
    }

    if (!response.ok) {
      console.error("Mistral API error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Mistral proxy error:", error);

    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
