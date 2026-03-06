import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class ListNotes extends OpenAPIRoute {
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

export class HandleNoteAction extends OpenAPIRoute {
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