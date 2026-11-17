import { Hono } from "hono";
import { backend } from "./backend";
import indexHtml from "./index.html";


export async function app() {
  const app = new Hono();

  await backend(app);

  const port = Number(Bun.env.PORT) || 3000;
  const hostname = Bun.env.HOST || "0.0.0.0";

  console.log("Environment:", Bun.env.NODE_ENV)
  const server = Bun.serve({
    port,
    hostname,
    routes: {
      "/": indexHtml,
      "/signup": indexHtml,
      "/signin": indexHtml,
      "/chat": indexHtml,
      "/chat/*": indexHtml,
    },
    fetch: app.fetch,
  });

  return server

}

if (Bun.env.NODE_ENV !== 'test') {
  app();
}
