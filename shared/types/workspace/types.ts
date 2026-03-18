import z from "zod";
import type { workspaceSchema } from "./schema";

export type Workspace = z.infer<typeof workspaceSchema>;