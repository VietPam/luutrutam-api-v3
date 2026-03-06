import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class ListNotes extends OpenAPIRoute {
  schema = {
    tags: ["Notes"],
    summary: "Get all notes (including soft-deleted)",
    responses: {
      "200": {
        description: "Array of notes including delete date, ordered by newest",
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
    // Lấy toàn bộ bản ghi, sắp xếp theo thời gian tạo giảm dần
    const result = await c.env.DB.prepare(
      "SELECT id, text, created_at, deleted_at FROM notes ORDER BY created_at DESC"
    ).all();
    
    return c.json(result.results || []);
  }
}