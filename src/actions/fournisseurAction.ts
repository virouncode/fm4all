"use server";
import { db } from "@/db";
import { fournisseurs, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth-session";
import { sendEmailFromServer } from "@/lib/email/sendEmail";
import { actionClient } from "@/lib/safe-actions";
import { capitalize } from "@/lib/utils/capitalize";
import { generatePassword } from "@/lib/utils/generatePassword";
import { formatSIRET } from "@/lib/utils/isValidSIRET";
import {
  insertFournisseurSchema,
  InsertFournisseurType,
  updateFournisseurSchema,
  UpdateFournisseurType,
} from "@/zod-schemas/fournisseur";
import { UpdateUserType } from "@/zod-schemas/user";
import { and, eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";

export const insertFournisseurAction = actionClient
  .metadata({ actionName: "insertFournisseurAction" })
  .inputSchema(insertFournisseurSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput: fournisseurInput,
    }: {
      parsedInput: InsertFournisseurType;
    }) => {
      const locale = await getLocale();
      const currentUser = (await getSession())?.user;
      if (currentUser?.role !== "admin") {
        return {
          success: false,
          message:
            locale === "fr"
              ? "Vous n'avez pas les droits pour créer un compte fournisseur."
              : "You do not have permission to create a provider account.",
        };
      }
      const fournisseurToPost: InsertFournisseurType = {
        ...fournisseurInput,
        siret: formatSIRET(fournisseurInput.siret),
        nomFournisseur: fournisseurInput.nomFournisseur.toUpperCase(),
        prenomContact: capitalize(fournisseurInput.prenomContact),
        nomContact: capitalize(fournisseurInput.nomContact),
        emailContact: fournisseurInput.emailContact.toLowerCase(),
      };
      const existingFournisseur = await db
        .select({ id: fournisseurs.id })
        .from(fournisseurs)
        .where(
          and(eq(fournisseurs.emailContact, fournisseurToPost.emailContact)),
        )
        .limit(1);

      if (existingFournisseur.length > 0) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "Un fournisseur avec cette adresse email existe déjà."
              : "A provider with this email address already exists.",
        };
      }

      const resultFournisseur = await db
        .insert(fournisseurs)
        .values(fournisseurToPost)
        .returning({ id: fournisseurs.id });

      const tempPassword = generatePassword();
      await auth.api.signUpEmail({
        body: {
          firstName: fournisseurToPost.prenomContact,
          lastName: fournisseurToPost.nomContact,
          name: fournisseurToPost.nomFournisseur,
          email: fournisseurToPost.emailContact,
          password: tempPassword,
          role: "fournisseur",
          fournisseurId: resultFournisseur[0].id,
          clientId: null,
          phone: "+3312345678", //numéro provisoire : TODO changer
        },
      });
      await sendEmailFromServer({
        to: fournisseurToPost.emailContact,
        from: "noreply@mg.fm4all.com",
        subject: "Création de votre compte fournisseur",
        text: `<p>Votre compte fournisseur a été crée avec succès, bienvenue chez fm4all !</p><br/>
        <p>Voici votre mot de passe temporaire : ${tempPassword}</p><br/>
        <p>Nous vous conseillons de le changer dès votre première connexion dans votre espace.</p>
        <p>Pensez aussi à vérifier votre adresse email en cliquant sur le lien que nous vous avons envoyé.</p>
        `,
        nomDestinataire: fournisseurToPost.nomFournisseur,
      });

      return {
        success: true,
        message:
          locale === "fr"
            ? `Le compte du fournisseur ${fournisseurToPost.nomFournisseur} a été crée avec succès. Un email avec un lien de vérification a été envoyé à ${fournisseurToPost.emailContact}`
            : `${fournisseurToPost.nomFournisseur}'s provider account has been successfully created. A verification email has been sent to ${fournisseurToPost.emailContact}`,
        data: { fournisseurId: resultFournisseur[0]?.id },
      };
    },
  );

export const updateFournisseurAction = actionClient
  .metadata({ actionName: "updateFournisseurAction" })
  .inputSchema(updateFournisseurSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput: fournisseurInput,
    }: {
      parsedInput: UpdateFournisseurType;
    }) => {
      const locale = await getLocale();
      const currentUser = (await getSession())?.user;
      if (!currentUser) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "Vous devez être connecté pour mettre à jour vote compte fournisseur."
              : "You must be logged in to update your provider account.",
        };
      }
      if (currentUser?.fournisseurId !== fournisseurInput.id) {
        return {
          success: false,
          message:
            locale === "fr"
              ? "Vous n'avez pas les droits pour mettre à jour le compte de ce fournisseur."
              : "You do not have permission to update this provider account.",
        };
      }

      const fournisseurToUpdate: UpdateFournisseurType = {
        ...fournisseurInput,
        nomFournisseur: fournisseurInput.nomFournisseur?.toUpperCase(),
        siret: fournisseurInput.siret
          ? formatSIRET(fournisseurInput.siret)
          : "",
        prenomContact: capitalize(fournisseurInput.prenomContact),
        nomContact: capitalize(fournisseurInput.nomContact),
        emailContact: fournisseurInput.emailContact?.toLowerCase(),
      };

      const resultFournisseur = await db
        .update(fournisseurs)
        .set(fournisseurToUpdate)
        .where(eq(fournisseurs.id, fournisseurToUpdate.id ?? 0))
        .returning();

      //mettre à jour l'avatar du fournisseur
      const correspondingUser = await db
        .select()
        .from(user)
        .where(eq(user.fournisseurId, fournisseurToUpdate.id ?? 0))
        .limit(1);

      if (correspondingUser.length > 0) {
        const userToUpdate: UpdateUserType = {
          ...correspondingUser[0],
          image: fournisseurInput.logoUrl,
        };
        await db
          .update(user)
          .set(userToUpdate)
          .where(eq(user.id, correspondingUser[0].id));
      }

      return {
        success: true,
        message:
          locale === "fr"
            ? "Votre profil a bien été mis à jour."
            : "Your profile has been successfully updated.",
        data: { fournisseur: resultFournisseur[0] },
      };
    },
  );
