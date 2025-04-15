import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "admin",
        input: true,
      },
      fournisseurId: {
        type: "number",
        required: false,
        defaultValue: null,
      },
      clientId: {
        type: "number",
        required: false,
        defaultValue: null,
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendResetPassword(data, request) {
      await fetch(`${process.env.BASE_URL}/api/mailgun`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: data.user.email,
          from: "noreply@fm4all.com",
          subject: "Réinitialisation de votre mot de passe",
          text: `<p>Bonjour, vous avez demandé à réinitialiser votre mot de passe</p><br/>
                <p>Veuillez cliquer sur le lien suivant :</p><br/>
                <p>${data.url}</p>
                <p>Bien cordialement,</p>
                <p>L'équipe FM4ALL</p>
                `,
        }),
      });
      // Send an email to the user with a link to reset their password
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await fetch(`${process.env.BASE_URL}/api/mailgun`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: user.email,
          from: "noreply@fm4all.com",
          subject: "Veuillez vérifier votre adresse email",
          text: `<p>Nous venons de créer votre compte utilisateur. Bienvenue chez fm4all !</p><br/>
                <p>Veuillez cliquer sur le lien suivant pour vérifier votre email :</p><br/>
                <p>${url}</p>
                `,
          nomDestinataire: user.name,
        }),
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  plugins: [nextCookies()],
});
