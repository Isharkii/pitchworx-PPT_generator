import { FastifyInstance } from "fastify";
import { db } from "../lib/db";

export async function userRoutes(app: FastifyInstance) {
  // POST /users — create a user (called after auth)
  app.post("/users", async (req, reply) => {
    const { email, name } = req.body as { email: string; name?: string };

    if (!email) return reply.status(400).send({ error: "email is required" });

    const user = await db.user.upsert({
      where: { email },
      update: { name: name ?? undefined },
      create: { email, name },
    });

    return reply.status(201).send(user);
  });

  // GET /users/:id — get user + project count
  app.get("/users/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    const user = await db.user.findUnique({
      where: { id },
      include: { _count: { select: { projects: true } } },
    });

    if (!user) return reply.status(404).send({ error: "User not found" });
    return user;
  });
}
