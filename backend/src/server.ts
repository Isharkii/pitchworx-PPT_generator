import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
});

app.get("/health", async () => ({ status: "ok", ts: new Date().toISOString() }));

// ── Load routes dynamically so a single import failure is logged, not fatal ───
const routeModules = [
  { name: "users",    path: "./routes/users",    prefix: "/api" },
  { name: "projects", path: "./routes/projects", prefix: "/api" },
  { name: "themes",   path: "./routes/themes",   prefix: "/api" },
  { name: "generate", path: "./routes/generate", prefix: "/api" },
];

for (const { name, path, prefix } of routeModules) {
  try {
    const mod = await import(path);
    const routeFn = Object.values(mod)[0] as (app: unknown) => Promise<void>;
    await app.register(routeFn, { prefix });
    console.log(`[boot] loaded route: ${name}`);
  } catch (err) {
    console.error(`[boot] FAILED to load route "${name}":`, err);
  }
}

const PORT = Number(process.env.PORT ?? 3001);

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`[boot] listening on port ${PORT}`);
} catch (err) {
  console.error("[boot] failed to start:", err);
  process.exit(1);
}
