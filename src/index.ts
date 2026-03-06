import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { ListNotes, HandleNoteAction } from "./endpoints/note/get";

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
    origin: '*', // Bạn có thể thay '*' bằng 'https://3000-cs-33038045240-default.cs-asia-southeast1-seal.cloudshell.dev' để bảo mật hơn
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
      description: "Standalone D1 worker for managing notes",
    },
  },
});

openapi.get("/notes", ListNotes);
openapi.post("/notes", HandleNoteAction);

export default app;