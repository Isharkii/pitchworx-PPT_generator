// ── Minimal boot — confirms port binding works before loading routes ───────────
console.log("[boot] process starting, PORT =", process.env.PORT);

import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok", ts: new Date().toISOString() }));

const PORT = Number(process.env.PORT ?? 3001);

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log("[boot] listening on port", PORT);
} catch (err) {
  console.error("[boot] failed to start:", err);
  process.exit(1);
}
