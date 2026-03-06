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
    return c.json({
      success: true,
      data: result.results || []
    });
  }
}