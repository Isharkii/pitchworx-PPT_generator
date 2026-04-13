import Fastify from "fastify";
import cors from "@fastify/cors";
import { userRoutes } from "./routes/users";
import { projectRoutes } from "./routes/projects";
import { themeRoutes } from "./routes/themes";
import { generateRoutes } from "./routes/generate";

const app = Fastify({ logger: true });

// ── CORS ──────────────────────────────────────────────────────────────────────
await app.register(cors, {
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
});

// ── Routes ────────────────────────────────────────────────────────────────────
await app.register(userRoutes,    { prefix: "/api" });
await app.register(projectRoutes, { prefix: "/api" });
await app.register(themeRoutes,   { prefix: "/api" });
await app.register(generateRoutes,{ prefix: "/api" });

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", async () => ({ status: "ok", ts: new Date().toISOString() }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3001);

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`[boot] listening on port ${PORT}`);
} catch (err) {
  console.error("[boot] failed to start:", err);
  process.exit(1);
}
