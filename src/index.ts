import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { notesRouter } from "./endpoints/note/router";
import { ContentfulStatusCode } from "hono/utils/http-status";

export interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'], // QUAN TRỌNG: Phải có x-api-key ở đây
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
}));

app.onError((err, c) => {
  if (err instanceof ApiException) {
    return c.json(
      { success: false, errors: err.buildResponse() },
      err.status as ContentfulStatusCode,
    );
  }
  console.error(err);
  return c.json(
    { success: false, errors: [{ code: 7000, message: "Internal Server Error" }], },
    500,
  );
});
const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    info: {
      title: "Notes API",
      version: "1.0.0",
    },
  },
});

// Đăng ký router đã tách
openapi.route("/", notesRouter);

export default app;