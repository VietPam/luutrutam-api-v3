import { ApiException, fromHono, OpenAPIRoute } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";

// export interface Env {
//   DB: D1Database;
// }

// --- Notes Endpoint Classes ---

class ListNotes extends OpenAPIRoute {
  schema = {
    tags: ["Notes"],
    summary: "Get all stored notes",
    responses: {
      "200": {
        description: "Returns an array of notes",
        content: {
          "application/json": {
            schema: z.array(
              z.object({
                id: z.string(),
                text: z.string(),
                created_at: z.string(),
              })
            ),
          },
        },
      },
    },
  };

  async handle(c: any) {
    const result = await c.env.DB.prepare(
      "SELECT * FROM notes ORDER BY created_at DESC"
    ).all();
    return c.json(result.results || []);
  }
}

class HandleNoteAction extends OpenAPIRoute {
  schema = {
    tags: ["Notes"],
    summary: "Add or Delete notes using legacy action pattern",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              action: z.enum(["add", "delete"]),
              text: z.string().optional(),
              id: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Action performed successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              id: z.string().optional(),
            }),
          },
        },
      },
    },
  };

  async handle(c: any) {
    const body = await c.req.json();
    const { action, text, id } = body;

    if (action === "add") {
      const newId = Date.now().toString();
      await c.env.DB.prepare("INSERT INTO notes (id, text) VALUES (?, ?)")
        .bind(newId, text || "")
        .run();
      return c.json({ success: true, id: newId });
    } 
    
    if (action === "delete") {
      if (!id) return c.json({ success: false, error: "Missing ID for delete" }, 400);
      
      await c.env.DB.prepare("DELETE FROM notes WHERE id = ?")
        .bind(id)
        .run();
      return c.json({ success: true });
    }

    return c.json({ success: false, error: "Invalid action" }, 400);
  }
}

// --- App Initialization ---

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  maxAge: 600,
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

// Register Routes
openapi.get("/notes", ListNotes);
openapi.post("/notes", HandleNoteAction);

export default app;