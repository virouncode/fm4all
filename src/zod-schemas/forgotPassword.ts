import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email obligatoire").email("Email invalide"),
});
export type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;
