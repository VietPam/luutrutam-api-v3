import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class DeleteNote extends OpenAPIRoute {
  schema = {
    tags: ["Notes"],
    summary: "Delete a note by ID",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      "200": {
        description: "Note deleted successfully",
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
    const id = c.req.param("id");

    await c.env.DB.prepare("DELETE FROM notes WHERE id = ?")
      .bind(id)
      .run();

    return c.json({ success: true });
  }
}