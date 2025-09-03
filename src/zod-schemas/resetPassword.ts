import { z } from "zod";

export const resetPasswordSchema = z.object({
  password: z.string().min(1, "Mot de passe obligatoire"),
  passwordConfirmation: z
    .string()
    .min(1, "Confirmation mot de passe obligatoire"),
});
export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;
