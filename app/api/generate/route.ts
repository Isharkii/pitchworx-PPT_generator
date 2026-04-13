import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/app/lib/backend";

// ─── Gamma API constants ──────────────────────────────────────────────────────
const GAMMA_BASE_URL = "https://public-api.gamma.app/v1.0";
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120_000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface GammaCreateResponse {
  generationId: string;
}

interface GammaPollResponse {
  generationId: string;
  status: "pending" | "processing" | "completed" | "failed";
  gammaUrl?: string;
  exportUrl?: string;
  credits?: { deducted: number; remaining: number };
  error?: string;
}

export interface Slide {
  slideNumber: number;
  title: string;
  bullets: string[];
  font: "Calibri";
}

export interface GenerateResponse {
  generationId: string;
  gammaUrl: string;
  exportUrl: string | null;
  slides: Slide[];
  credits?: { deducted: number; remaining: number };
}

// ─── Slide outline builder ────────────────────────────────────────────────────

function buildSlideOutline(prompt: string, numCards: number): Slide[] {
  const rawTitle = prompt.trim().split(/[.!?\n]/)[0].trim().slice(0, 60) || "Presentation";

  const sections = [
    { title: "Executive Summary",  bullets: ["Key takeaways", "Overview", "Goals"] },
    { title: "Problem Statement",  bullets: ["Current challenges", "Pain points", "Opportunity"] },
    { title: "Our Solution",       bullets: ["Core approach", "Key features", "Differentiation"] },
    { title: "Market Opportunity", bullets: ["Target audience", "Market size", "Growth potential"] },
    { title: "Strategy & Roadmap", bullets: ["Phases", "Timeline", "Milestones"] },
    { title: "Key Metrics",        bullets: ["Performance indicators", "Success criteria", "Benchmarks"] },
    { title: "Team & Execution",   bullets: ["Core team", "Capabilities", "Resources"] },
    { title: "Next Steps",         bullets: ["Action items", "Timeline", "Call to action"] },
  ];

  const slides: Slide[] = [
    { slideNumber: 1, title: rawTitle, bullets: ["Introduction", "Agenda", "Overview"], font: "Calibri" },
  ];

  const extras = Math.min(numCards - 1, sections.length);
  for (let i = 0; i < extras; i++) {
    slides.push({ slideNumber: i + 2, ...sections[i], font: "Calibri" });
  }

  return slides;
}

// ─── Gamma API helpers ────────────────────────────────────────────────────────

async function createGeneration(apiKey: string, prompt: string, numCards: number): Promise<string> {
  const res = await fetch(`${GAMMA_BASE_URL}/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
    body: JSON.stringify({
      inputText: prompt,
      textMode: "generate",
      format: "presentation",
      numCards,
      exportAs: "pptx",
    }),
  });

  if (!res.ok) throw new Error(`Gamma create failed (${res.status}): ${await res.text()}`);
  const data: GammaCreateResponse = await res.json();
  return data.generationId;
}

async function pollGeneration(apiKey: string, generationId: string): Promise<GammaPollResponse> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const res = await fetch(`${GAMMA_BASE_URL}/generations/${generationId}`, {
      headers: { "X-API-KEY": apiKey },
    });

    if (!res.ok) throw new Error(`Gamma poll failed (${res.status}): ${await res.text()}`);

    const data: GammaPollResponse = await res.json();
    if (data.status === "completed") return data;
    if (data.status === "failed") throw new Error(`Gamma generation failed: ${data.error ?? "unknown"}`);
  }

  throw new Error("Gamma generation timed out after 2 minutes");
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt: string = body?.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const numCards = Math.min(Math.max(Number(body?.numCards) || 8, 3), 20);

    // ── Backend mode — proxy to Fastify if BACKEND_URL is set ─────────────────
    const backendUrl = getBackendUrl();
    if (backendUrl) {
      const res = await fetch(`${backendUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: body?.userId ?? "anonymous",
          prompt,
          numCards,
          themeId: body?.themeId,
        }),
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json(data, { status: res.status });

      return NextResponse.json({
        generationId: data.presentationId,
        gammaUrl: data.gammaUrl,
        exportUrl: data.fileUrl,
        slides: (data.slides ?? []).map(
          (s: { content: { title: string; bullets: string[]; font: string } }, i: number) => ({
            slideNumber: i + 1,
            title: s.content?.title ?? "",
            bullets: s.content?.bullets ?? [],
            font: s.content?.font ?? "Calibri",
          })
        ),
        credits: data.credits,
      } satisfies GenerateResponse);
    }

    // ── Direct Gamma mode ──────────────────────────────────────────────────────
    const apiKey = process.env.GAMMA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GAMMA_API_KEY is not configured" }, { status: 500 });
    }

    const generationId = await createGeneration(apiKey, prompt, numCards);
    const result = await pollGeneration(apiKey, generationId);

    return NextResponse.json({
      generationId: result.generationId,
      gammaUrl: result.gammaUrl!,
      exportUrl: result.exportUrl ?? null,
      slides: buildSlideOutline(prompt, numCards),
      credits: result.credits,
    } satisfies GenerateResponse);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("[/api/generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
