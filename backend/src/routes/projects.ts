import { FastifyInstance } from "fastify";
import { db } from "../lib/db";
import { cacheDel, cacheGet, cacheSet } from "../lib/redis";

export async function projectRoutes(app: FastifyInstance) {
  // GET /projects?userId=xxx — list user's projects
  app.get("/projects", async (req, reply) => {
    const { userId } = req.query as { userId?: string };
    if (!userId) return reply.status(400).send({ error: "userId is required" });

    const cacheKey = `projects:user:${userId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const projects = await db.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        theme: { select: { id: true, name: true, previewImage: true } },
        _count: { select: { presentations: true } },
      },
    });

    await cacheSet(cacheKey, projects, 60);
    return projects;
  });

  // GET /projects/:id — single project with latest presentation
  app.get("/projects/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    const project = await db.project.findUnique({
      where: { id },
      include: {
        theme: true,
        presentations: {
          orderBy: { version: "desc" },
          take: 1,
          include: { slides: { orderBy: { slideIndex: "asc" } } },
        },
        generationJobs: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!project) return reply.status(404).send({ error: "Project not found" });
    return project;
  });

  // POST /projects — create a project
  app.post("/projects", async (req, reply) => {
    const { userId, title, themeId } = req.body as {
      userId: string;
      title: string;
      themeId?: string;
    };

    if (!userId || !title)
      return reply.status(400).send({ error: "userId and title are required" });

    const project = await db.project.create({
      data: { userId, title, themeId, status: "draft" },
    });

    await cacheDel(`projects:user:${userId}`);
    return reply.status(201).send(project);
  });

  // PATCH /projects/:id — update title, theme, or status
  app.patch("/projects/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const { title, themeId, status } = req.body as {
      title?: string;
      themeId?: string;
      status?: string;
    };

    const project = await db.project.update({
      where: { id },
      data: { title, themeId, status },
    });

    await cacheDel(`projects:user:${project.userId}`);
    return project;
  });

  // DELETE /projects/:id
  app.delete("/projects/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    const project = await db.project.delete({ where: { id } });
    await cacheDel(`projects:user:${project.userId}`);
    return reply.status(204).send();
  });
}
