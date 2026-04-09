import { NextRequest, NextResponse } from "next/server";

// ─── Mock mode ────────────────────────────────────────────────────────────────
// Set MOCK_MODE=true in .env.local to bypass Gamma and use fake data.
// To disable: set MOCK_MODE=false or remove the line entirely. No code changes needed.

const MOCK_MODE = process.env.MOCK_MODE === "true";

function mockResponse(prompt: string): GenerateResponse {
  const title = prompt.trim().slice(0, 55) || "Sample Presentation";
  return {
    generationId: "mock-id-123",
    gammaUrl: "https://gamma.app/docs/mock-preview",
    exportUrl: "/test.pptx",
    slides: [
      { slideNumber: 1, title, bullets: ["Introduction", "Agenda", "What to expect"], font: "Calibri" },
      { slideNumber: 2, title: "Executive Summary", bullets: ["Key takeaways", "Core opportunity", "Our approach"], font: "Calibri" },
      { slideNumber: 3, title: "Problem Statement", bullets: ["Current challenges", "Pain points", "Why now"], font: "Calibri" },
      { slideNumber: 4, title: "Our Solution", bullets: ["Core approach", "Key features", "Differentiation"], font: "Calibri" },
      { slideNumber: 5, title: "Market Opportunity", bullets: ["Target audience", "Market size", "Growth potential"], font: "Calibri" },
      { slideNumber: 6, title: "Strategy & Roadmap", bullets: ["Phase 1: Foundation", "Phase 2: Scale", "Phase 3: Expand"], font: "Calibri" },
      { slideNumber: 7, title: "Key Metrics", bullets: ["Success KPIs", "Performance benchmarks", "Goals"], font: "Calibri" },
      { slideNumber: 8, title: "Next Steps", bullets: ["Immediate actions", "Timeline", "Call to action"], font: "Calibri" },
    ],
    credits: { deducted: 0, remaining: 999 },
  };
}

// ─── Gamma API constants (from MCP get_gamma_docs) ───────────────────────────
const GAMMA_BASE_URL = "https://public-api.gamma.app/v1.0";
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120_000; // 2 minutes max

// ─── Types ────────────────────────────────────────────────────────────────────

interface GammaCreateResponse {
  generationId: string;
}

interface GammaPollResponse {
  generationId: string;
  status: "pending" | "processing" | "completed" | "failed";
  gammaUrl?: string;
  exportUrl?: string;
  credits?: {
    deducted: number;
    remaining: number;
  };
  error?: string;
}

export interface Slide {
  slideNumber: number;
  title: string;
  bullets: string[];
  font: "Calibri"; // Brand requirement — Calibri for slide content
}

export interface GenerateResponse {
  generationId: string;
  gammaUrl: string;
  exportUrl: string | null;
  slides: Slide[];
  credits?: { deducted: number; remaining: number };
}

// ─── Slide outline generator ──────────────────────────────────────────────────
// Generates a preview outline from the user prompt for the card UI.
// Gamma does not return per-slide JSON — this provides the card display structure.

function buildSlideOutline(prompt: string, numCards: number): Slide[] {
  const trimmed = prompt.trim();

  // Derive title from prompt — first sentence or first 60 chars
  const rawTitle =
    trimmed.split(/[.!?\n]/)[0].trim().slice(0, 60) || "Presentation";

  const sectionTemplates = [
    { title: "Executive Summary", bullets: ["Key takeaways", "Overview", "Goals"] },
    { title: "Problem Statement", bullets: ["Current challenges", "Pain points", "Opportunity"] },
    { title: "Our Solution", bullets: ["Core approach", "Key features", "Differentiation"] },
    { title: "Market Opportunity", bullets: ["Target audience", "Market size", "Growth potential"] },
    { title: "Strategy & Roadmap", bullets: ["Phases", "Timeline", "Milestones"] },
    { title: "Key Metrics", bullets: ["Performance indicators", "Success criteria", "Benchmarks"] },
    { title: "Team & Execution", bullets: ["Core team", "Capabilities", "Resources"] },
    { title: "Next Steps", bullets: ["Action items", "Timeline", "Call to action"] },
  ];

  const slides: Slide[] = [
    {
      slideNumber: 1,
      title: rawTitle,
      bullets: ["Introduction", "Agenda", "Overview"],
      font: "Calibri",
    },
  ];

  const extras = Math.min(numCards - 1, sectionTemplates.length);
  for (let i = 0; i < extras; i++) {
    slides.push({
      slideNumber: i + 2,
      title: sectionTemplates[i].title,
      bullets: sectionTemplates[i].bullets,
      font: "Calibri",
    });
  }

  return slides;
}

// ─── Gamma API helpers ────────────────────────────────────────────────────────

async function createGeneration(
  apiKey: string,
  prompt: string,
  numCards: number
): Promise<string> {
  const res = await fetch(`${GAMMA_BASE_URL}/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({
      inputText: prompt,
      textMode: "generate",      // Gamma generates content from the topic
      format: "presentation",
      numCards,
      exportAs: "pptx",          // Get PPTX download link
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gamma create failed (${res.status}): ${body}`);
  }

  const data: GammaCreateResponse = await res.json();
  return data.generationId;
}

async function pollGeneration(
  apiKey: string,
  generationId: string
): Promise<GammaPollResponse> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const res = await fetch(`${GAMMA_BASE_URL}/generations/${generationId}`, {
      headers: { "X-API-KEY": apiKey },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gamma poll failed (${res.status}): ${body}`);
    }

    const data: GammaPollResponse = await res.json();

    if (data.status === "completed") return data;
    if (data.status === "failed") {
      throw new Error(`Gamma generation failed: ${data.error ?? "unknown error"}`);
    }
    // status is "pending" or "processing" — keep polling
  }

  throw new Error("Gamma generation timed out after 2 minutes");
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt: string = body?.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    const numCards = Math.min(Math.max(Number(body?.numCards) || 8, 3), 20);

    // ── Mock mode shortcut — remove MOCK_MODE from .env.local to use real Gamma ──
    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, 2000)); // simulate network delay
      return NextResponse.json(mockResponse(prompt));
    }

    // API key only required for real Gamma calls
    const apiKey = process.env.GAMMA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GAMMA_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Step 1 — Create generation (POST /generations)
    const generationId = await createGeneration(apiKey, prompt, numCards);

    // Step 2 — Poll until completed (GET /generations/{id})
    const result = await pollGeneration(apiKey, generationId);

    // Step 3 — Build response
    const response: GenerateResponse = {
      generationId: result.generationId,
      gammaUrl: result.gammaUrl!,
      exportUrl: result.exportUrl ?? null,
      slides: buildSlideOutline(prompt, numCards),
      credits: result.credits,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("[/api/generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
