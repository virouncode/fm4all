import { z } from "zod";

export const createSignInSchema = (messages: {
  email: string;
  emailInvalid: string;
  password: string;
}) => {
  return z.object({
    email: z.string().min(1, messages.email).email(messages.emailInvalid),
    password: z.string().min(1, messages.password),
  });
};
export const signInSchema = createSignInSchema({
  email: "Email obligatoire",
  emailInvalid: "Email invalide",
  password: "Mot de passe obligatoire",
});

export type SignInType = z.infer<typeof signInSchema>;
