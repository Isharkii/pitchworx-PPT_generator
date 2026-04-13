import { FastifyInstance } from "fastify";
import { db } from "../lib/db";
import { cacheSet } from "../lib/redis";
import { generatePresentation } from "../lib/gamma";
import { fetchBuffer, uploadPptx } from "../lib/storage";

// ── Slide outline builder ─────────────────────────────────────────────────────
// Gamma doesn't return per-slide JSON — we build a structured preview
// from the prompt to populate the slides table for future editing.

function buildSlideOutline(prompt: string, numCards: number) {
  const title = prompt.trim().slice(0, 60) || "Presentation";
  const sections = [
    { title: "Executive Summary",  bullets: ["Key takeaways", "Core opportunity", "Our approach"] },
    { title: "Problem Statement",  bullets: ["Current challenges", "Pain points", "Why now"] },
    { title: "Our Solution",       bullets: ["Core approach", "Key features", "Differentiation"] },
    { title: "Market Opportunity", bullets: ["Target audience", "Market size", "Growth potential"] },
    { title: "Strategy & Roadmap", bullets: ["Phase 1: Foundation", "Phase 2: Scale", "Phase 3: Expand"] },
    { title: "Key Metrics",        bullets: ["Success KPIs", "Benchmarks", "Goals"] },
    { title: "Team",               bullets: ["Core team", "Capabilities", "Resources"] },
    { title: "Next Steps",         bullets: ["Immediate actions", "Timeline", "Call to action"] },
  ];

  const slides = [
    { slideIndex: 0, content: { title, bullets: ["Introduction", "Agenda", "Overview"], font: "Calibri" } },
  ];

  const extras = Math.min(numCards - 1, sections.length);
  for (let i = 0; i < extras; i++) {
    slides.push({
      slideIndex: i + 1,
      content: { ...sections[i], font: "Calibri" },
    });
  }

  return slides;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function generateRoutes(app: FastifyInstance) {
  /**
   * POST /generate
   * Body: { projectId, userId, prompt, numCards?, themeId? }
   *
   * Flow:
   *  1. Create/update project
   *  2. Create GenerationJob (queued)
   *  3. Call Gamma API
   *  4. Store Presentation + Slides
   *  5. Optionally upload PPTX to S3
   *  6. Mark job done
   */
  app.post("/generate", async (req, reply) => {
    const { projectId, userId, prompt, numCards = 8, themeId } = req.body as {
      projectId?: string;
      userId: string;
      prompt: string;
      numCards?: number;
      themeId?: string;
    };

    if (!userId || !prompt) {
      return reply.status(400).send({ error: "userId and prompt are required" });
    }

    const clampedCards = Math.min(Math.max(numCards, 3), 20);

    // ── Step 1: Resolve or create project ──────────────────────────────────
    let project;
    if (projectId) {
      project = await db.project.findUnique({ where: { id: projectId } });
      if (!project) return reply.status(404).send({ error: "Project not found" });
    } else {
      project = await db.project.create({
        data: {
          userId,
          title: prompt.slice(0, 60),
          themeId,
          status: "generating",
        },
      });
    }

    // ── Step 2: Create GenerationJob ───────────────────────────────────────
    const job = await db.generationJob.create({
      data: {
        projectId: project.id,
        status: "running",
        inputPrompt: prompt,
        numCards: clampedCards,
      },
    });

    await db.project.update({
      where: { id: project.id },
      data: { status: "generating" },
    });

    try {
      // ── Step 3: Call Gamma API ───────────────────────────────────────────
      const gammaResult = await generatePresentation(prompt, clampedCards, themeId);

      // ── Step 4: Get next version number ─────────────────────────────────
      const prevCount = await db.presentation.count({
        where: { projectId: project.id },
      });

      // ── Step 5: Upload PPTX to S3 (if exportUrl exists) ─────────────────
      let s3FileUrl: string | null = null;
      if (gammaResult.exportUrl) {
        try {
          const buffer = await fetchBuffer(gammaResult.exportUrl);
          const s3Key = `presentations/${project.id}/v${prevCount + 1}.pptx`;
          s3FileUrl = await uploadPptx(s3Key, buffer);
        } catch (err) {
          // S3 upload failure is non-fatal — we still have the Gamma URL
          app.log.warn({ err }, "S3 upload failed — skipping");
        }
      }

      // ── Step 6: Store Presentation ───────────────────────────────────────
      const slideData = buildSlideOutline(prompt, clampedCards);
      const presentation = await db.presentation.create({
        data: {
          projectId: project.id,
          gammaResponse: gammaResult as object,
          gammaUrl: gammaResult.gammaUrl,
          fileUrl: s3FileUrl ?? gammaResult.exportUrl,
          version: prevCount + 1,
          slides: {
            create: slideData,
          },
        },
        include: { slides: { orderBy: { slideIndex: "asc" } } },
      });

      // ── Step 7: Finalise ─────────────────────────────────────────────────
      await Promise.all([
        db.generationJob.update({
          where: { id: job.id },
          data: { status: "done" },
        }),
        db.project.update({
          where: { id: project.id },
          data: { status: "completed" },
        }),
      ]);

      // Cache presentation for quick frontend re-fetch
      await cacheSet(`presentation:${presentation.id}`, presentation, 300);

      return reply.status(201).send({
        projectId: project.id,
        presentationId: presentation.id,
        gammaUrl: gammaResult.gammaUrl,
        fileUrl: presentation.fileUrl,
        slides: presentation.slides,
        credits: gammaResult.credits,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";

      // Mark job and project as failed
      await Promise.all([
        db.generationJob.update({
          where: { id: job.id },
          data: { status: "failed", error: message },
        }),
        db.project.update({
          where: { id: project.id },
          data: { status: "failed" },
        }),
      ]);

      app.log.error({ err }, "Generation failed");
      return reply.status(500).send({ error: message });
    }
  });

  // GET /generate/job/:jobId — poll a single job status
  app.get("/generate/job/:jobId", async (req, reply) => {
    const { jobId } = req.params as { jobId: string };
    const job = await db.generationJob.findUnique({ where: { id: jobId } });
    if (!job) return reply.status(404).send({ error: "Job not found" });
    return job;
  });
}
