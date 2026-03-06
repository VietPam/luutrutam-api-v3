import { Hono } from "hono";
import { fromHono } from "chanfana";
import { ListNotes } from "./get";
import { HandleNoteAction } from "./post";

export const notesRouter = fromHono(new Hono());

// Map đúng các phương thức mà Client cũ đang dùng
notesRouter.get("/", ListNotes);
notesRouter.post("/", HandleNoteAction);