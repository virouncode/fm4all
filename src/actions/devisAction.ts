"use server";

import { batiments } from "@/constants/batiments";
import { occupation } from "@/constants/occupation";
import { db } from "@/db";
import { devis, devisTemporaires, prospects } from "@/db/schema";
import { actionClient } from "@/lib/action/safe-actions";
import { sendEmailFromServer } from "@/lib/email/sendEmail";
import { insertDevisSchema, saveProgressSchema } from "@/zod-schemas/devis";
import { finaliserDevisSchema } from "@/zod-schemas/finaliserDevis";
import { SelectProspectType } from "@/zod-schemas/prospect";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { and, eq } from "drizzle-orm";
import { DateTime } from "luxon";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";

export const saveProgressAction = actionClient
  .metadata({ actionName: "saveProgressAction" })
  .inputSchema(saveProgressSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const locale = await getLocale();
    const { prospect, texte } = parsedInput;

    const result = await db.transaction(async (tx) => {
      // 1) Upsert prospect
      const [existingProspect] = await tx
        .select({ id: prospects.id })
        .from(prospects)
        .where(
          and(
            eq(prospects.emailContact, prospect.emailContact),
            eq(prospects.nomContact, prospect.nomContact),
          ),
        );

      let upsertedProspect: SelectProspectType;

      if (existingProspect) {
        const [updated] = await tx
          .update(prospects)
          .set(prospect)
          .where(eq(prospects.id, existingProspect.id))
          .returning();

        if (!updated) {
          throw new Error("Erreur lors de la mise à jour du prospect");
        }

        upsertedProspect = updated;
      } else {
        const [inserted] = await tx
          .insert(prospects)
          .values(prospect)
          .returning();

        if (!inserted) {
          throw new Error("Erreur lors de la création du prospect");
        }

        upsertedProspect = inserted;
      }

      // 2) Insert devis temporaire
      const [insertedDevisTemp] = await tx
        .insert(devisTemporaires)
        .values({
          prospectId: upsertedProspect.id,
          texte,
        })
        .returning();

      if (!insertedDevisTemp) {
        throw new Error("Erreur lors de la création du devis temporaire");
      }
      return {
        prospect: upsertedProspect,
        devisTemporaire: insertedDevisTemp,
      };
    });

    // Ici TS sait exactement ce qu'il y a dans result
    const { prospect: upsertedProspect, devisTemporaire: insertedDevisTemp } =
      result;

    try {
      await sendEmailFromServer({
        to: "contact@fm4all.com",
        from: "contact@fm4all.com",
        subject: "Un prospect a sauvegardé sa progression",
        text: "placeholder",
        html: `<p>Un prospect a sauvegardé sa progression dans le funnel.</p><br/>
              <p>Voici ses coordonnées :</p><br/>
              <p>Entreprise : ${upsertedProspect.nomEntreprise}</p>
              <p>Code postal : ${upsertedProspect.codePostal}</p>
              <p>Ville : ${upsertedProspect.ville}</p>
              <p>Surface des locaux : ${upsertedProspect.surface}</p>
              <p>Effectif : ${upsertedProspect.effectif}</p>
              <p>Type de bâtiment : ${
                batiments.find(({ id }) => id === upsertedProspect.typeBatiment)
                  ?.description
              }</p>
              <p>Type d'occupation : ${
                occupation.find(
                  ({ id }) => id === upsertedProspect.typeOccupation,
                )?.description
              }</p><br/>
              <p>Nom du contact : ${upsertedProspect.nomContact}</p>
              <p>Prénom du contact : ${upsertedProspect.prenomContact}</p>
              <p>Poste du contact : ${upsertedProspect.posteContact}</p>
              <p>Email du contact : ${upsertedProspect.emailContact}</p>
              <p>N°Tél du contact : ${upsertedProspect.phoneContact}</p><br/>
              <p>Voici ses informations de chiffrage (avant personnalisation) :</p><br/>
              <pre>${insertedDevisTemp.texte}</pre>
              `,
        useTemplate: false,
      });
    } catch (err) {
      console.log("Erreur envoi email", err);
    }

    return {
      success: true,
      message:
        locale === "fr"
          ? "Votre progression a bien été enregistrée, merci !"
          : "Your progress has been saved, thank you!",
      data: result,
    };
  });

export const finaliserDevisAction = actionClient
  .metadata({ actionName: "finaliserDevisAction" })
  .inputSchema(finaliserDevisSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const locale = await getLocale();
    const { prospect, devisUrl, commentaires, devisMontants } = parsedInput;

    if (!prospect.id) {
      throw new Error("Prospect ID manquant pour la finalisation du devis.");
    }

    // 1) Update prospect
    const [updatedProspect] = await db
      .update(prospects)
      .set(prospect)
      .where(eq(prospects.id, prospect.id))
      .returning();

    if (!updatedProspect) {
      throw new Error("Erreur lors de la mise à jour du prospect.");
    }

    const finalDevisUrl = devisUrl;

    const payload = insertDevisSchema.parse({
      titre: "Devis en ligne fm4all",
      description: "Devis généré via le comparateur en ligne fm4all",
      typePrix: "forfait",
      margeCoefficient: devisMontants.margeCoefficient,
      status: "emis",
      devisUrl: finalDevisUrl,
      prospectId: updatedProspect.id,
      fournisseurId: 16, // FM4ALL ID
      totalMensuelHt: devisMontants.totalMensuelHt /*10000*/,
      totalInstallationHt: devisMontants.totalInstallationHt ?? null /*10000*/,
      dateDemarrage: updatedProspect.dateDeDemarrage
        ? new Date(updatedProspect.dateDeDemarrage)
        : null,
      dateValidite: DateTime.now().startOf("day").plus({ days: 15 }).toJSDate(),
    });

    // 2) Transaction : insert devis
    const result = await db.transaction(async (tx) => {
      const [insertedDevis] = await tx
        .insert(devis)
        .values(payload)
        .returning();

      if (!insertedDevis) {
        throw new Error("Erreur lors de l'enregistrement du devis.");
      }

      return { devis: insertedDevis, prospect: updatedProspect };
    });

    // 3) Email admin (hors transaction)
    try {
      await sendEmailFromServer({
        to: "contact@fm4all.com",
        from: "devis@fm4all.com",
        subject: "Un client a finalisé son devis",
        text: `
<p>Un client a finalisé son devis.</p><br/>
<p>Voici ses coordonnées :</p><br/>
<p>Entreprise : ${updatedProspect.nomEntreprise}</p>
<p>Siret : ${updatedProspect.siret ?? ""}</p>
<p>Adresse ligne 1 : ${updatedProspect.adresseLigne1 ?? ""}</p>
<p>Adresse ligne 2 : ${updatedProspect.adresseLigne2 ?? ""}</p>
<p>Code postal : ${updatedProspect.codePostal}</p>
<p>Ville : ${updatedProspect.ville}</p>
<p>Surface des locaux : ${updatedProspect.surface}</p>
<p>Effectif : ${updatedProspect.effectif}</p>
<p>Type de bâtiment : ${
          batiments.find(({ id }) => id === updatedProspect.typeBatiment)
            ?.description ?? ""
        }</p>
<p>Type d'occupation : ${
          occupation.find(({ id }) => id === updatedProspect.typeOccupation)
            ?.description ?? ""
        }</p>
<p>Nom du contact : ${updatedProspect.nomContact}</p>
<p>Prénom du contact : ${updatedProspect.prenomContact}</p>
<p>Poste du contact : ${updatedProspect.posteContact}</p>
<p>Email du contact : ${updatedProspect.emailContact}</p>
<p>N°Tél du contact : ${updatedProspect.phoneContact}</p>
<p>Nom du signataire : ${updatedProspect.nomSignataire ?? ""}</p>
<p>Prénom du signataire : ${updatedProspect.prenomSignataire ?? ""}</p>
<p>Poste du signataire : ${updatedProspect.posteSignataire ?? ""}</p>
<p>Email du signataire : ${updatedProspect.emailSignataire ?? ""}</p>
<p>Date de démarrage : ${
          updatedProspect.dateDeDemarrage
            ? format(new Date(updatedProspect.dateDeDemarrage), "dd/MM/yyyy", {
                locale: fr,
              })
            : ""
        }</p>
<br/>
<p>Commentaires du client : ${commentaires ?? ""}</p><br/>
<p>Lien vers le devis : <a href="${finalDevisUrl}">${finalDevisUrl}</a></p>
`,
        attachment: finalDevisUrl,
        filename: `Devis_fm4all_${updatedProspect.nomEntreprise}.pdf`,
        useTemplate: true,
      });
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'e-mail de devis", err);
    }

    return {
      success: true,
      message:
        locale === "fr"
          ? "Votre devis a bien été généré, merci !"
          : "Your quote has been generated, thank you!",
      data: {
        devisUrl: finalDevisUrl,
        prospect: result.prospect,
        devis: result.devis,
      },
    };
  });
