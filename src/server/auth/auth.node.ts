import { db } from "@/db/index.node";
import { account, session, user, verification } from "@/db/schema";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { openAPI } from "better-auth/plugins";
import { sendEmailFromServer } from "../email/sendEmail";

export const auth = betterAuth({
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 3600,
    },
    updateAge: 86400,
  },
  advanced: {
    database: {
      generateId: false, // "serial" for auto-incrementing numeric IDs
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      verification,
      account,
    },
  }),
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, url }) => {
        await sendEmailFromServer({
          to: newEmail,
          from: "noreply@mg.fm4all.com",
          subject: "Changement d'adresse email",
          text: `<p>Vous avez demandé à changer votre adresse email</p><br/>
                 <p>Veuillez cliquer sur le lien suivant pour vérifier votre nouvel email :</p><br/>
                <p>${url}</p>
                `,
        });
      },
    },
    additionalFields: {
      prenom: {
        type: "string",
        required: true,
      },
      nom: {
        type: "string",
        required: true,
      },
      phone: {
        type: "string",
        required: false,
      },
      avatarId: {
        type: "string",
        required: false,
      },
      createdById: {
        type: "string",
        required: false,
      },
      updatedById: {
        type: "string",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmailFromServer({
        to: user.email,
        from: "noreply@mg.fm4all.com",
        subject: "Réinitialisation de votre mot de passe",
        text: `<p>Vous avez demandé à réinitialiser votre mot de passe</p><br/>
                <p>Veuillez cliquer sur le lien suivant :</p><br/>
                <p>${url}</p>
                `,
      });
    },
  },
  // emailVerification: {
  //   sendOnSignUp: true,
  //   sendVerificationEmail: async ({ user, token }) => {
  //     const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.APP_URL}/auth/email-ok`;
  //     await sendEmailFromServer({
  //       to: user.email,
  //       from: "noreply@mg.fm4all.com",
  //       subject: "Veuillez vérifier votre adresse email",
  //       text: `<p>Nous venons de créer votre compte utilisateur. Bienvenue chez fm4all !</p><br/>
  //               <p>Veuillez cliquer sur le lien suivant pour vérifier votre email :</p><br/>
  //               <p>${verificationUrl}</p>
  //               `,
  //       nomDestinataire: user.name,
  //     });
  //   },
  // },
  plugins: [openAPI(), nextCookies()], //api/auth/reference
} satisfies BetterAuthOptions);

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = AuthSession["user"];
