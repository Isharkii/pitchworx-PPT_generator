import { NextRequest, NextResponse } from "next/server";

export interface GammaTheme {
  id: string;
  name: string;
  type: string;
  colorKeywords: string[];
  toneKeywords: string[];
}

export interface ThemesResponse {
  data: GammaTheme[];
  hasMore: boolean;
  nextCursor?: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") ?? "50";
  const after = searchParams.get("after") ?? undefined;

  try {
    // ── Backend mode ────────────────────────────────────────────────────────────
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      const params = new URLSearchParams({ limit });
      if (after) params.set("after", after);
      const res = await fetch(`${backendUrl}/api/themes/gamma?${params}`);
      const data = await res.json();
      if (!res.ok) return NextResponse.json(data, { status: res.status });
      return NextResponse.json(data);
    }

    // ── Direct Gamma mode ────────────────────────────────────────────────────────
    const apiKey = process.env.GAMMA_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GAMMA_API_KEY is not set" }, { status: 500 });

    const params = new URLSearchParams({ limit });
    if (after) params.set("after", after);

    const res = await fetch(`https://public-api.gamma.app/v1.0/themes?${params}`, {
      headers: { "X-API-KEY": apiKey },
    });

    const data: ThemesResponse = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch themes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
