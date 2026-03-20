export const runtime = "nodejs";

import formData from "form-data";
import Mailgun from "mailgun.js";
import { NextRequest } from "next/server";
import { z } from "zod";

import { parseJson } from "@/app/api/(helpers)/parseJson";
import { errorResponse, successResponse } from "@/app/api/(helpers)/responses";
import { env } from "@/lib/env";

const emailSchema = z.object({
  from: z.email().optional(), // utilisé en Reply-To uniquement
  to: z.email(),
  subject: z.string().min(1, "Le sujet est obligatoire"),
  text: z.string().min(1, "Le corps du message est obligatoire"),
  html: z.string().optional(),

  nomDestinataire: z.string().optional(),
  prenomDestinataire: z.string().optional(),
  useTemplate: z.boolean().optional(),
});

type EmailWithTemplateType = {
  from: string;
  to: string[];
  bcc?: string[];
  subject: string;
  template: string;
  "h:X-Mailgun-Variables": string;
  "h:Reply-To"?: string;
};

type EmailWithoutTemplateType = {
  from: string;
  to: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
  "h:Reply-To"?: string;
};

export async function POST(req: NextRequest) {
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({ username: "api", key: env.MAILGUN_API_KEY });

  try {
    const body = await parseJson(req, emailSchema);

    const replyTo =
      body.from && body.from.toLowerCase() !== "noreply@mg.fm4all.com"
        ? body.from
        : undefined;

    const base = {
      from: `fm4all: Le Facility Management pour tous <noreply@mg.fm4all.com>`,
      to: [body.to],
      ...(env.MAILGUN_BCC_EMAIL ? { bcc: [env.MAILGUN_BCC_EMAIL] } : {}),
      subject: body.subject,
      ...(replyTo ? { "h:Reply-To": replyTo } : {}),
    };

    // Sans template
    if (body.useTemplate === false) {
      const emailOptions: EmailWithoutTemplateType = {
        ...base,
        html: body.html ? body.html : undefined,
        text: body.html ? "" : body.text,
      };

      const response = await mg.messages.create("mg.fm4all.com", emailOptions);

      return successResponse(
        { id: response.id, message: response.message },
        { status: 200, message: "Email envoyé avec succès" },
      );
    }

    // Avec template
    const emailOptions: EmailWithTemplateType = {
      ...base,
      template: "general",
      "h:X-Mailgun-Variables": JSON.stringify({
        nom_destinataire: body.nomDestinataire,
        prenom_destinataire: body.prenomDestinataire,
        corps_message: body.text,
        subject: body.subject,
      }),
    };

    const response = await mg.messages.create("mg.fm4all.com", emailOptions);

    return successResponse(
      { id: response.id, message: response.message },
      { status: 200, message: "Email envoyé avec succès" },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponse("VALIDATION", "Données invalides.", {
        status: 422,
        details: err.flatten(),
      });
    }

    console.error("mailgun route error:", err);
    return errorResponse("INTERNAL", "Une erreur interne est survenue.", {
      status: 500,
    });
  }
}
