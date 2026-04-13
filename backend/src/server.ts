import Fastify from "fastify";
import { userRoutes } from "./routes/users";
import { projectRoutes } from "./routes/projects";
import { themeRoutes } from "./routes/themes";
import { generateRoutes } from "./routes/generate";

async function main() {
  const app = Fastify({ logger: true });

  // Manual CORS — avoids @fastify/cors which is ESM-only in v9 and
  // cannot be require()'d from a CJS bundle.
  const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:3000";
  app.addHook("onRequest", async (req, reply) => {
    reply.header("Access-Control-Allow-Origin", allowedOrigin);
    reply.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    reply.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      return reply.status(204).send();
    }
  });

  await app.register(userRoutes,    { prefix: "/api" });
  await app.register(projectRoutes, { prefix: "/api" });
  await app.register(themeRoutes,   { prefix: "/api" });
  await app.register(generateRoutes,{ prefix: "/api" });

  app.get("/health", async () => ({ status: "ok", ts: new Date().toISOString() }));

  const PORT = Number(process.env.PORT ?? 3001);

  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
}

main().catch((err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
