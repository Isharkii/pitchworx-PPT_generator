import Fastify from "fastify";
import cors from "@fastify/cors";
import { userRoutes } from "./routes/users";
import { projectRoutes } from "./routes/projects";
import { themeRoutes } from "./routes/themes";
import { generateRoutes } from "./routes/generate";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
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
