import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class ListNotes extends OpenAPIRoute {
  schema = {
    tags: ["Notes"],
    summary: "Get all notes",
    responses: {
      "200": {
        description: "Array of notes including delete date",
        content: {
          "application/json": {
            schema: z.array(z.object({
              id: z.string(),
              text: z.string(),
              created_at: z.string(),
              deleted_at: z.string().nullable()
            }))
          }
        }
      }
    }
  };

  async handle(c: any) {
    // Lấy tất cả bao gồm cả những note đã xóa (hoặc thêm WHERE deleted_at IS NULL nếu muốn ẩn chúng)
    const result = await c.env.DB.prepare(
      "SELECT id, text, created_at, deleted_at FROM notes ORDER BY created_at DESC"
    ).all();
    
    return c.json(result.results || []);
  }
}