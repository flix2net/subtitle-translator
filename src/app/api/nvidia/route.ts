import { NextRequest, NextResponse } from "next/server";

interface NvidiaRequest {
  apiKey?: string;
  messages: Array<{ role: string; content: string }>;
  model: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  chat_template_kwargs?: Record<string, unknown>;
  reasoning_effort?: string;
}

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NvidiaRequest;
    const { apiKey, messages, model, temperature, top_p, max_tokens, stream, chat_template_kwargs, reasoning_effort } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Missing required parameter: messages" }, { status: 400 });
    }

    if (!apiKey?.trim()) {
      return NextResponse.json({ error: "Missing Nvidia API key" }, { status: 401 });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
    };

    // Build request body with optional parameters
    const requestBody: Record<string, unknown> = {
      messages,
      model,
      stream: stream ?? false,
    };

    if (temperature !== undefined) requestBody.temperature = temperature;
    if (top_p !== undefined) requestBody.top_p = top_p;
    if (max_tokens !== undefined) requestBody.max_tokens = max_tokens;
    if (chat_template_kwargs !== undefined) requestBody.chat_template_kwargs = chat_template_kwargs;
    if (reasoning_effort !== undefined) requestBody.reasoning_effort = reasoning_effort;

    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    // Get response as text first to handle non-JSON responses
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Nvidia API returned non-JSON response:", responseText.substring(0, 500));
      return NextResponse.json(
        {
          error: `Nvidia API returned invalid response (HTTP ${response.status}). Check your API key and model ID.`,
          details: responseText.substring(0, 300),
        },
        { status: 502 },
      );
    }

    if (!response.ok) {
      console.error("Nvidia API error:", data);

      // Handle rate limiting with helpful error message
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter ? ` Try again in ${retryAfter}s.` : "";
        return NextResponse.json(
          {
            error: `Rate limit exceeded.${waitTime} Reduce batch size or wait between requests. Free tier: ~5 requests/minute.`,
            status: 429,
            retryAfter: retryAfter ? parseInt(retryAfter) : null,
            ...data,
          },
          { status: 429 },
        );
      }

      return NextResponse.json(data, { status: response.status });
    }

    if (data.choices?.[0]?.message?.content) {
      const modelLower = model.toLowerCase();
      // Strip <think> tags for thinking models
      if (modelLower.includes("thinking") || modelLower.includes("minimax")) {
        let content = data.choices[0].message.content;
        content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        data.choices[0].message.content = content;
      }
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Nvidia proxy error:", error);

    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
