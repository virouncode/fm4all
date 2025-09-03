import { z } from "zod";

export const commentairesSchema = z.string().nullable();
export type CommentairesType = z.infer<typeof commentairesSchema>;
