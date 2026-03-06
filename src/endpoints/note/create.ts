import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class CreateNote extends OpenAPIRoute {
  schema = {
    tags: ["Notes"],
    summary: "Add a new note",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              text: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Note created successfully",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              id: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: any) {
    const { text } = await c.req.json();
    const newId = Date.now().toString();

    await c.env.DB.prepare("INSERT INTO notes (id, text) VALUES (?, ?)")
      .bind(newId, text)
      .run();

    return c.json({ success: true, id: newId });
  }
}