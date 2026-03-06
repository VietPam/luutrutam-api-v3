import { Hono } from "hono";
import { fromHono } from "chanfana";
import { ListNotes } from "./get";
import { CreateNote } from "./create";
import { DeleteNote } from "./delete";

export const notesRouter = fromHono(new Hono());

notesRouter.get("/", ListNotes);
notesRouter.post("/", CreateNote);
notesRouter.delete("/:id", DeleteNote);