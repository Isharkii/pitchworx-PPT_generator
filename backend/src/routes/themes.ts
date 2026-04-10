import { FastifyInstance } from "fastify";
import { db } from "../lib/db";
import { cacheGet, cacheSet } from "../lib/redis";

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
