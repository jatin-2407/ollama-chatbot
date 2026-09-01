import { Hono } from "hono";
import { backend } from "./backend";
import indexHtml from "./index.html";

const app = new Hono();

await backend(app);

const port = Number(Bun.env.PORT) || 3000;
const hostname = Bun.env.HOST || "0.0.0.0";

Bun.serve({
  port,
  hostname,
  routes: {
    "/": indexHtml,
  },
  fetch: app.fetch,
});
