"use server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth-session";
import { sendEmailFromServer } from "@/lib/email/sendEmail";
import { actionClient } from "@/lib/safe-actions";
import { generatePassword } from "@/lib/utils/generatePassword";
import {
  insertClientToDbSchema,
  onboardClientSchema,
} from "@/zod-schemas/client";
import { insertSiteToDbSchema } from "@/zod-schemas/site";
import { insertUserSchema } from "@/zod-schemas/user";
import { eq, sql } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";
import { clients, devis, sites, user } from "../db/schema";

export const onboardClientAction = actionClient
  .metadata({ actionName: "onboardClientAction" })
  .inputSchema(onboardClientSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const locale = await getLocale();
    const session = await getSession();
    const currentUser = session?.user;

    if (!currentUser) {
      throw new Error(
        locale === "fr"
          ? "Vous n'êtes pas authentifié."
          : "You are not authenticated.",
      );
    }

    if (currentUser.role !== "admin") {
      throw new Error(
        locale === "fr"
          ? "Vous n'avez pas les droits pour créer un client."
          : "You do not have permission to create a client.",
      );
    }

    const { client, sitePrincipal, userAdmin: clientUserAdmin } = parsedInput;
    const createdById = currentUser.id;
    const updatedById = currentUser.id;

    const result = await db.transaction(async (tx) => {
      // 1) Insert client
      const clientPayload = insertClientToDbSchema.parse({
        ...client,
        createdById,
        updatedById,
      });
      const [insertedClient] = await tx
        .insert(clients)
        .values(clientPayload)
        .returning();

      if (!insertedClient) {
        throw new Error(
          locale === "fr"
            ? "Échec de la création du client."
            : "Failed to create client.",
        );
      }

      // 2) Insert site principal
      const sitePayload = insertSiteToDbSchema.parse({
        ...sitePrincipal,
        clientId: insertedClient.id,
        createdById,
        updatedById,
      });
      const [insertedSite] = await tx
        .insert(sites)
        .values(sitePayload)
        .returning();

      if (!insertedSite) {
        throw new Error(
          locale === "fr"
            ? "Échec de la création du site principal."
            : "Failed to create main site.",
        );
      }
      // 3) Promotion des devis
      if (clientPayload.prospectId != null) {
        await tx
          .update(devis)
          .set({
            clientId: insertedClient.id,
            siteId: insertedSite.id,
            updatedAt: new Date(),
            updatedById: createdById,
          })
          .where(eq(devis.prospectId, clientPayload.prospectId));
      }

      // 4) Insert user admin
      const [existingUserEmail] = await tx
        .select({ id: user.id })
        .from(user)
        .where(
          eq(sql`LOWER(${user.email})`, clientUserAdmin.email.toLowerCase()),
        )
        .limit(1);
      if (existingUserEmail) {
        throw new Error(
          locale === "fr"
            ? "Cette adresse email est déjà utilisée par un autre compte utilisateur."
            : "This email address is already used by another user account.",
        );
      }
      const tempPassword = generatePassword();

      const clientUserAdminPayload = insertUserSchema.parse(clientUserAdmin);
      const insertedUser = await auth.api.signUpEmail({
        body: {
          ...clientUserAdmin,
          password: tempPassword,
        },
      });
      if (!insertedUser) {
        throw new Error(
          locale === "fr"
            ? "Échec de la création du compte utilisateur."
            : "Failed to create user account.",
        );
      }
      await sendEmailFromServer({
        to: clientUserAdminPayload.email,
        from: "noreply@mg.fm4all.com",
        subject: "Création de votre compte utilisateur",
        text: `<p>Votre compte utilisateur a été crée avec succès, bienvenue chez fm4all !</p><br/>
                    <p>Voici mot de passe temporaire : ${tempPassword}</p><br/>
                    <p>Nous vous conseillons de le changer dès votre première connexion dans votre espace.</p>
                    <p>Pensez aussi à vérifier votre adresse email en cliquant sur le lien que nous vous avons envoyé.</p>
                    `,
        nomDestinataire: clientUserAdminPayload.name,
        useTemplate: true,
      });
      return {
        client: insertedClient,
        sitePrincipal: insertedSite,
        userAdmin: insertedUser.user,
      };
    });

    return {
      success: true,
      message:
        locale === "fr"
          ? "Client, site principal et administrateur créés avec succès."
          : "Client, main site and admin user created successfully.",
      data: result,
    };
  });
