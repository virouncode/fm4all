"use server";

import { batiments } from "@/constants/batiments";
import { occupation } from "@/constants/occupation";
import { db } from "@/db";
import {
  devisTemporaires,
  documents,
  documentsLinks,
  prospects,
} from "@/db/schema";
import { actionClient } from "@/lib/action/safe-actions";
import { env } from "@/lib/env";
import { sendEmailDirect } from "@/server/email/brevoDirect";
import { s3, S3_BUCKET } from "@/server/s3/s3";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import { saveProgressSchema } from "@/zod-schemas/devisComparateur.schema";
import { finaliserDevisSchema } from "@/zod-schemas/finaliserDevis.schema";
import { SelectProspectType } from "@/zod-schemas/prospect.schema";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { and, desc, eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { flattenValidationErrors } from "next-safe-action";

function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const saveProgressAction = actionClient
  .metadata({ actionName: "saveProgressAction" })
  .inputSchema(saveProgressSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput }) => {
    const locale = await getLocale();
    const { prospect, texte } = parsedInput;
    const normalizedProspect = normalizeForSubmit(prospect, {
      optionalStrings: ["emailSignataire", "siret"] as const,
    });

    const result = await db.transaction(async (tx) => {
      // 1) Upsert prospect
      const [existingProspect] = await tx
        .select({ id: prospects.id })
        .from(prospects)
        .where(
          and(
            eq(prospects.emailContact, normalizedProspect.emailContact),
            eq(prospects.nomContact, normalizedProspect.nomContact),
          ),
        );

      let upsertedProspect: SelectProspectType;

      if (existingProspect) {
        const [updated] = await tx
          .update(prospects)
          .set(normalizedProspect)
          .where(eq(prospects.id, existingProspect.id))
          .returning();

        if (!updated) {
          throw new Error("Erreur lors de la mise à jour du prospect");
        }

        upsertedProspect = updated;
      } else {
        const [inserted] = await tx
          .insert(prospects)
          .values(normalizedProspect)
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

    const { prospect: upsertedProspect, devisTemporaire: insertedDevisTemp } =
      result;

    const contactEmail = env.CONTACT_EMAIL;

    if (contactEmail) {
      try {
        await sendEmailDirect({
          to: contactEmail,
          subject: "Un prospect a sauvegardé sa progression",
          text: `<p>Un prospect a sauvegardé sa progression dans le funnel.</p><br/>
              <p>Voici ses coordonnées :</p><br/>
              <p>Entreprise : ${escapeHtml(upsertedProspect.nomEntreprise)}</p>
              <p>Code postal : ${escapeHtml(upsertedProspect.codePostal)}</p>
              <p>Ville : ${escapeHtml(upsertedProspect.ville)}</p>
              <p>Surface des locaux : ${upsertedProspect.surface}</p>
              <p>Effectif : ${upsertedProspect.effectif}</p>
              <p>Type de bâtiment : ${escapeHtml(
                batiments.find(({ id }) => id === upsertedProspect.typeBatiment)
                  ?.description,
              )}</p>
              <p>Type d'occupation : ${escapeHtml(
                occupation.find(
                  ({ id }) => id === upsertedProspect.typeOccupation,
                )?.description,
              )}</p><br/>
              <p>Nom du contact : ${escapeHtml(upsertedProspect.nomContact)}</p>
              <p>Prénom du contact : ${escapeHtml(upsertedProspect.prenomContact)}</p>
              <p>Poste du contact : ${escapeHtml(upsertedProspect.posteContact)}</p>
              <p>Email du contact : ${escapeHtml(upsertedProspect.emailContact)}</p>
              <p>N°Tél du contact : ${escapeHtml(upsertedProspect.phoneContact)}</p><br/>
              <p>Voici ses informations de chiffrage (avant personnalisation) :</p><br/>
              <pre>${escapeHtml(insertedDevisTemp.texte)}</pre>
              `,
          nomDestinataire: "FM4ALL",
          prenomDestinataire: "Équipe",
          useTemplate: true,
        });
      } catch (err) {
        void err;
      }
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
    const {
      prospect,
      devisS3Key,
      commentaires,
      pdfFilename,
      pdfSizeBytes,
      texte,
    } = parsedInput;

    if (!prospect.id) {
      throw new Error("Prospect ID manquant pour la finalisation du devis.");
    }

    // 1) Update prospect
    const { id: prospectId, ...prospectDataRaw } = prospect;
    const prospectData = normalizeForSubmit(prospectDataRaw, {
      optionalStrings: ["emailSignataire", "siret"] as const,
    });
    const [updatedProspect] = await db
      .update(prospects)
      .set(prospectData)
      .where(eq(prospects.id, prospectId))
      .returning();

    if (!updatedProspect) {
      throw new Error("Erreur lors de la mise à jour du prospect.");
    }

    // 2) Récupérer le devis temporaire le plus récent pour ce prospect
    const [devisTemp] = await db
      .select({ id: devisTemporaires.id })
      .from(devisTemporaires)
      .where(eq(devisTemporaires.prospectId, prospectId))
      .orderBy(desc(devisTemporaires.createdAt))
      .limit(1);

    // 3) Télécharger le PDF depuis S3 pour l'envoi en pièce jointe
    let pdfBuffer: Buffer | null = null;
    try {
      const getCmd = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: devisS3Key,
      });
      const s3Response = await s3.send(getCmd);
      if (s3Response.Body) {
        const chunks: Uint8Array[] = [];
        for await (const chunk of s3Response.Body as AsyncIterable<Uint8Array>) {
          chunks.push(chunk);
        }
        pdfBuffer = Buffer.concat(chunks);
      }
    } catch {
      // Si le téléchargement échoue, on continue sans pièce jointe
    }

    // 4) Persister le PDF dans documents + documentsLinks (dans une transaction)
    if (devisTemp && pdfBuffer) {
      try {
        await db.transaction(async (tx) => {
          const [insertedDoc] = await tx
            .insert(documents)
            .values({
              proprietaireEntrepriseId: env.FM4ALL_ENTREPRISE_ID,
              categorie: "devis_temporaire",
              storageProvider: "s3",
              storageKey: devisS3Key,
              filename: pdfFilename,
              mimeType: "application/pdf",
              sizeBytes: pdfSizeBytes,
            })
            .returning({ id: documents.id });

          if (!insertedDoc) return;

          await tx
            .update(devisTemporaires)
            .set({ documentId: insertedDoc.id, texte })
            .where(eq(devisTemporaires.id, devisTemp.id));

          await tx.insert(documentsLinks).values({
            documentId: insertedDoc.id,
            proprietaireEntrepriseId: env.FM4ALL_ENTREPRISE_ID,
            devisTemporaireId: devisTemp.id,
          });
        });
      } catch {
        // Non bloquant — le devis est déjà sur S3
      }
    }

    // 5) Email admin avec le PDF en pièce jointe
    const contactEmail = env.CONTACT_EMAIL;

    if (contactEmail) {
      try {
        await sendEmailDirect({
          to: contactEmail,
          subject: "Un client a finalisé son devis",
          text: `
<p>Un client a finalisé son devis.</p><br/>
<p>Voici ses coordonnées :</p><br/>
<p>Entreprise : ${escapeHtml(updatedProspect.nomEntreprise)}</p>
<p>Siret : ${escapeHtml(updatedProspect.siret)}</p>
<p>Adresse ligne 1 : ${escapeHtml(updatedProspect.adresseLigne1)}</p>
<p>Adresse ligne 2 : ${escapeHtml(updatedProspect.adresseLigne2)}</p>
<p>Code postal : ${escapeHtml(updatedProspect.codePostal)}</p>
<p>Ville : ${escapeHtml(updatedProspect.ville)}</p>
<p>Surface des locaux : ${updatedProspect.surface}</p>
<p>Effectif : ${updatedProspect.effectif}</p>
<p>Type de bâtiment : ${escapeHtml(
            batiments.find(({ id }) => id === updatedProspect.typeBatiment)
              ?.description,
          )}</p>
<p>Type d'occupation : ${escapeHtml(
            occupation.find(({ id }) => id === updatedProspect.typeOccupation)
              ?.description,
          )}</p>
<p>Nom du contact : ${escapeHtml(updatedProspect.nomContact)}</p>
<p>Prénom du contact : ${escapeHtml(updatedProspect.prenomContact)}</p>
<p>Poste du contact : ${escapeHtml(updatedProspect.posteContact)}</p>
<p>Email du contact : ${escapeHtml(updatedProspect.emailContact)}</p>
<p>N°Tél du contact : ${escapeHtml(updatedProspect.phoneContact)}</p>
<p>Nom du signataire : ${escapeHtml(updatedProspect.nomSignataire)}</p>
<p>Prénom du signataire : ${escapeHtml(updatedProspect.prenomSignataire)}</p>
<p>Poste du signataire : ${escapeHtml(updatedProspect.posteSignataire)}</p>
<p>Email du signataire : ${escapeHtml(updatedProspect.emailSignataire)}</p>
<p>Date de démarrage : ${
            updatedProspect.dateDeDemarrage
              ? format(
                  new Date(updatedProspect.dateDeDemarrage),
                  "dd/MM/yyyy",
                  {
                    locale: fr,
                  },
                )
              : ""
          }</p>
<br/>
<p>Commentaires du client : ${escapeHtml(commentaires)}</p>
`,
          nomDestinataire: "FM4ALL",
          prenomDestinataire: "Équipe",
          useTemplate: true,
          ...(pdfBuffer
            ? {
                attachment: {
                  data: pdfBuffer,
                  filename: pdfFilename,
                  contentType: "application/pdf",
                },
              }
            : {}),
        });
      } catch {
        // Non bloquant
      }
    }

    return {
      success: true,
      message:
        locale === "fr"
          ? "Votre devis a bien été généré, merci !"
          : "Your quote has been generated, thank you!",
      data: {
        prospect: updatedProspect,
      },
    };
  });
