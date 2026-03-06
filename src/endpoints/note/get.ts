import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class ListNotes extends OpenAPIRoute {
  schema = {
    tags: ["Notes"],
    summary: "Get all notes (Legacy format)",
    responses: {
      "200": {
        description: "Array of notes",
        content: {
          "application/json": {
            schema: z.array(z.object({
              id: z.string(),
              text: z.string(),
              created_at: z.string()
            }))
          }
        }
      }
    }
  };

  async handle(c: any) {
    const result = await c.env.DB.prepare(
      "SELECT id, text, created_at FROM notes ORDER BY created_at DESC"
    ).all();
    
    // Trả về trực tiếp mảng results để giống hệt KV cũ
    return c.json(result.results || []);
  }
}