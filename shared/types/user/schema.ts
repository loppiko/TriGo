import z from "zod";

export const userSchema = z.object({
    uid: z.string(),
    name: z.string(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});