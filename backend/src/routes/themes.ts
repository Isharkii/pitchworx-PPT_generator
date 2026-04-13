import { FastifyInstance } from "fastify";
import { db } from "../lib/db";
import { cacheGet, cacheSet } from "../lib/redis";
import { fetchGammaThemes, type GammaTheme } from "../lib/gamma";

export async function themeRoutes(app: FastifyInstance) {
  // GET /themes — list all themes (cached 5 min)
  app.get("/themes", async (_req, reply) => {
    const cached = await cacheGet<unknown[]>("themes:all");
    if (cached) return cached;

    const themes = await db.theme.findMany({ orderBy: { name: "asc" } });
    await cacheSet("themes:all", themes);
    return themes;
  });

  // GET /themes/:id
  app.get("/themes/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const theme = await db.theme.findUnique({ where: { id } });
    if (!theme) return reply.status(404).send({ error: "Theme not found" });
    return theme;
  });

  // GET /themes/gamma — fetch themes directly from Gamma API (cached 1 hour)
  app.get("/themes/gamma", async (req, reply) => {
    const { limit = "50", after } = req.query as { limit?: string; after?: string };

    const cacheKey = `themes:gamma:${limit}:${after ?? "start"}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;

    try {
      const result = await fetchGammaThemes(Number(limit), after);
      await cacheSet(cacheKey, result, 60 * 60); // cache 1 hour
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch Gamma themes";
      return reply.status(502).send({ error: message });
    }
  });

  // POST /themes — create a theme
  app.post("/themes", async (req, reply) => {
    const { name, config, previewImage } = req.body as {
      name: string;
      config: object;
      previewImage?: string;
    };

    if (!name || !config)
      return reply.status(400).send({ error: "name and config are required" });

    const theme = await db.theme.create({
      data: { name, config, previewImage },
    });

    await cacheSet("themes:all", null, 1); // bust cache
    return reply.status(201).send(theme);
  });
}
