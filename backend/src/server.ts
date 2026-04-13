import Fastify from "fastify";
import cors from "@fastify/cors";
import { userRoutes } from "./routes/users";
import { projectRoutes } from "./routes/projects";
import { themeRoutes } from "./routes/themes";
import { generateRoutes } from "./routes/generate";

console.log("[startup] NODE_ENV:", process.env.NODE_ENV);
console.log("[startup] PORT:", process.env.PORT);
console.log("[startup] DATABASE_URL set:", !!process.env.DATABASE_URL);
console.log("[startup] REDIS_URL set:", !!process.env.REDIS_URL);
console.log("[startup] GAMMA_API_KEY set:", !!process.env.GAMMA_API_KEY);

const app = Fastify({
  logger: {
    transport:
      process.env.NODE_ENV === "development"
        ? { target: "pino-pretty" }
        : undefined,
  },
});

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
const HOST = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port: PORT, host: HOST });
  console.log(`Backend running on http://${HOST}:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
