import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class HandleNoteAction extends OpenAPIRoute {
  schema = {
    tags: ["Notes"],
    summary: "Handle Add/Delete actions from legacy client",
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
        description: "Success",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
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
      return c.json({ success: true });
    }

    if (action === "delete") {
      await c.env.DB.prepare("DELETE FROM notes WHERE id = ?")
        .bind(id)
        .run();
      return c.json({ success: true });
    }

    return c.json({ success: false, message: "Invalid action" }, 400);
  }
}