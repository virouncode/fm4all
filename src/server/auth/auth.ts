import { db } from "@/db";
import {
  account,
  session,
  user,
  user as userTable,
  verification,
} from "@/db/schema";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { openAPI } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { sendEmailDirect } from "../email/mailgunDirect";

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
        await sendEmailDirect({
          to: newEmail,
          from: "noreply@mg.fm4all.com",
          subject: "Changement d'adresse email",
          text: `<p>Vous avez demandé à changer votre adresse email</p><br/>
                 <p>Veuillez cliquer sur le lien suivant pour vérifier votre nouvel email :</p><br/>
                <p>${url}</p>
                `,
          useTemplate: false,
        });
      },
    },
    additionalFields: {
      parentId: {
        type: "string",
        required: false,
        returned: true,
      },
      prenom: {
        type: "string",
        required: true,
        returned: true,
      },
      nom: {
        type: "string",
        required: true,
        returned: true,
      },
      phone: {
        type: "string",
        required: false,
        returned: true,
      },
      avatarId: {
        type: "string",
        required: false,
        returned: true,
      },
      createdById: {
        type: "string",
        required: false,
        returned: true,
      },
      updatedById: {
        type: "string",
        required: false,
        returned: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      // Distinguer activation (emailVerified = false) vs reset (emailVerified = true)
      await sendEmailDirect({
        to: user.email,
        from: "noreply@mg.fm4all.com",
        subject: user.emailVerified
          ? "Réinitialisation de votre mot de passe FM4ALL"
          : "Activez votre compte FM4ALL",
        text: user.emailVerified
          ? `
          <h2>Réinitialisation de votre mot de passe</h2>
          <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
          <p>Veuillez cliquer sur le lien suivant pour définir un nouveau mot de passe :</p>
          <a href="${url}">Réinitialiser mon mot de passe</a>
          <p><small>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</small></p>
          <p><small>Ce lien est valable 24 heures.</small></p>
        `
          : `
          <h2>Bienvenue ${user.name} chez FM4ALL !</h2>
          <p>Votre compte a été créé.</p>
          <p>Pour l'activer, veuillez définir votre mot de passe en cliquant sur le lien ci-dessous :</p>
          <a href="${url}">Définir mon mot de passe</a>
          <p><small>Ce lien est valable 24 heures.</small></p>
        `,
        nomDestinataire: user.name,
        useTemplate: true,
      });
    },
    // Hook appelé après reset password réussi
    onPasswordReset: async ({ user }) => {
      // Si l'email n'était pas vérifié (activation), le marquer comme vérifié
      if (!user.emailVerified) {
        await db
          .update(userTable)
          .set({ emailVerified: true, updatedAt: new Date() })
          .where(eq(userTable.id, user.id));
      }
    },
  },
  emailVerification: {
    sendOnSignUp: false, // Désactivé : on utilise sendResetPassword pour l'activation
    sendVerificationEmail: async ({ user, token }) => {
      // Ce hook ne sera plus appelé pour les nouveaux users
      // Garder l'implémentation pour d'autres cas potentiels
      const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.APP_URL}/auth/email-ok`;
      await sendEmailDirect({
        to: user.email,
        from: "noreply@mg.fm4all.com",
        subject: "Veuillez vérifier votre adresse email",
        text: `<p>Votre email pour la connection à FM4ALL vient d'être modifié.</p><br/>
              <p>Veuillez cliquer sur le lien suivant pour vérifier votre email :</p><br/>
              <p>${verificationUrl}</p>
              `,
        nomDestinataire: user.name,
        useTemplate: true,
      });
    },
  },
  plugins: [openAPI(), nextCookies()], //api/auth/reference
} satisfies BetterAuthOptions);

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = AuthSession["user"];
