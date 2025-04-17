import { z } from "zod";

export const createCityOutSchema = (messages: {
  nomEntreprise: string;
  prenomContact: string;
  nomContact: string;
  emailContact: string;
  emailContactInvalide: string;
  phoneContact: string;
  posteContact: string;
}) => {
  return z.object({
    nomEntreprise: z.string().min(1, messages.nomEntreprise),
    prenomContact: z.string().min(1, messages.prenomContact),
    nomContact: z.string().min(1, messages.nomContact),
    posteContact: z.string().min(1, messages.posteContact),
    emailContact: z
      .string()
      .min(1, messages.emailContact)
      .email(messages.emailContactInvalide),
    phoneContact: z
      .string()
      .regex(
        /^(?:\+|00)?\d{1,4}[-.\s]?(?:\(?\d{1,4}\)?[-.\s]?)?\d{2,4}([-.\s]?\d{2,4}){2,3}$/,
        messages.phoneContact
      ),
  });
};

export const cityOutSchema = createCityOutSchema({
  nomEntreprise: "Nom de l'entreprise obligatoire",
  prenomContact: "Prénom du contact obligatoire",
  nomContact: "Nom du contact obligatoire",
  posteContact: "Poste du contact obligatoire",
  emailContact: "Email du contact obligatoire",
  emailContactInvalide: "Email du contact invalide",
  phoneContact: "Numéro de téléphone obligatoire",
});

export type CityOutType = z.infer<typeof cityOutSchema>;
