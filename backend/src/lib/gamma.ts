// ── Gamma API integration ─────────────────────────────────────────────────────
// Docs: https://developers.gamma.app/llms-full.txt
// Auth: X-API-KEY header (NOT Authorization: Bearer)
// Base: https://public-api.gamma.app/v1.0

const GAMMA_BASE_URL = "https://public-api.gamma.app/v1.0";
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120_000;

export interface GammaResult {
  generationId: string;
  gammaUrl: string;
  exportUrl: string | null;
  credits?: { deducted: number; remaining: number };
}

async function fetchGamma(path: string, options: RequestInit = {}) {
  const apiKey = process.env.GAMMA_API_KEY;
  if (!apiKey) throw new Error("GAMMA_API_KEY is not set");

  const res = await fetch(`${GAMMA_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gamma ${options.method ?? "GET"} ${path} failed (${res.status}): ${body}`);
  }

  return res.json();
}

async function createGeneration(prompt: string, numCards: number): Promise<string> {
  const data = await fetchGamma("/generations", {
    method: "POST",
    body: JSON.stringify({
      inputText: prompt,
      textMode: "generate",
      format: "presentation",
      numCards,
      exportAs: "pptx",
    }),
  });
  return data.generationId as string;
}

async function pollGeneration(generationId: string): Promise<GammaResult> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const data = await fetchGamma(`/generations/${generationId}`);

    if (data.status === "completed") {
      return {
        generationId: data.generationId,
        gammaUrl: data.gammaUrl,
        exportUrl: data.exportUrl ?? null,
        credits: data.credits,
      };
    }

    if (data.status === "failed") {
      throw new Error(`Gamma generation failed: ${data.error ?? "unknown"}`);
    }
  }

  throw new Error("Gamma generation timed out after 2 minutes");
}

export async function generatePresentation(
  prompt: string,
  numCards = 8
): Promise<GammaResult> {
  const generationId = await createGeneration(prompt, numCards);
  return pollGeneration(generationId);
}
