import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class SoftDeleteNote extends OpenAPIRoute {
  schema = {
    tags: ["Notes"],
    summary: "Soft delete a note",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              id: z.string(),
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
    const data = await this.getValidatedData<typeof this.schema>();
    const { id } = data.body;
    const now = new Date().toISOString();

    await c.env.DB.prepare("UPDATE notes SET deleted_at = ? WHERE id = ?")
      .bind(now, id)
      .run();

    return c.json({ success: true });
  }
}