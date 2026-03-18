import { z } from "zod";

export const workspaceSchema = z.object({
    id: z.string(),
    uid: z.string(),
    name: z.string(),
    description: z.string(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});