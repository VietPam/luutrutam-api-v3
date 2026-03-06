import { Hono } from "hono";
import { fromHono } from "chanfana";
import { ListNotes } from "./get";
import { CreateNote } from "./create";
import { SoftDeleteNote } from "./softdelete";

export const notesRouter = fromHono(new Hono());

notesRouter.get("/", ListNotes);
notesRouter.post("/create", CreateNote);
notesRouter.post("/delete", SoftDeleteNote);