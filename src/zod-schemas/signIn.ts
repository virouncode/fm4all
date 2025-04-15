import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "Email obligatoire").email("Email invalide"),
  password: z.string().min(1, "Mot de passe obligatoire"),
});

export type SignInType = z.infer<typeof signInSchema>;
