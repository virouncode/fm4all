"use server";

import { actionClient } from "@/lib/action/safe-actions";
import { env } from "@/lib/env";
import { sendEmailDirect } from "@/server/email/brevoDirect";
import { cityOutSchema } from "@/zod-schemas/cityout.schema";
import { z } from "zod";

const sendCityOutEmailSchema = cityOutSchema.extend({
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  surface: z.string().optional(),
  effectif: z.string().optional(),
  typeBatimentLabel: z.string().optional(),
  typeOccupationLabel: z.string().optional(),
});

export const sendCityOutEmailAction = actionClient
  .metadata({ actionName: "sendCityOutEmailAction" })
  .inputSchema(sendCityOutEmailSchema)
  .action(async ({ parsedInput }) => {
    const contactEmail = env.CONTACT_EMAIL;

    if (contactEmail) {
      await sendEmailDirect({
        to: contactEmail,
        subject: "Nouveau prospect : région en cours de développement",
        text: `<p>Un nouveau prospect a laissé ses coordonnées sur la page de chiffrage automatique. La matrice de chiffrage est en cours de développement pour sa région.</p><br/>
          <p>Voici ses coordonnées :</p><br/>
          <p>Entreprise : ${parsedInput.nomEntreprise}</p>
          <p>Code postal : ${parsedInput.codePostal ?? ""}</p>
          <p>Ville : ${parsedInput.ville ?? ""}</p>
          <p>Surface des locaux : ${parsedInput.surface ?? ""}</p>
          <p>Effectif : ${parsedInput.effectif ?? ""}</p>
          <p>Type de bâtiment : ${parsedInput.typeBatimentLabel ?? ""}</p>
          <p>Type d'occupation : ${parsedInput.typeOccupationLabel ?? ""}</p>
          <p>Nom du contact : ${parsedInput.nomContact}</p>
          <p>Prénom du contact : ${parsedInput.prenomContact}</p>
          <p>Poste du contact : ${parsedInput.posteContact}</p>
          <p>Email du contact : ${parsedInput.emailContact}</p>
          <p>N°Tél du contact : ${parsedInput.phoneContact}</p>
          `,
        nomDestinataire: "FM4ALL",
        prenomDestinataire: "Équipe",
        useTemplate: true,
      });
    }

    return { success: true };
  });
