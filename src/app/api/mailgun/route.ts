export const runtime = "nodejs";

import formData from "form-data";
import Mailgun from "mailgun.js";
import { NextRequest } from "next/server";
import { z } from "zod";

import { parseJson } from "@/app/api/(helpers)/parseJson";
import { errorResponse, successResponse } from "@/app/api/(helpers)/responses";
import { getSession } from "@/server/auth/get-session";

import { getDocumentById } from "@/server/queries/documents.query";
import { getS3ObjectAsBuffer, validateKeyAllowed } from "@/server/s3/s3";

const emailSchema = z.object({
  from: z.email().optional(), // utilisé en Reply-To uniquement
  to: z.email(),
  subject: z.string().min(1, "Le sujet est obligatoire"),
  text: z.string().min(1, "Le corps du message est obligatoire"),
  html: z.string().optional(),

  attachmentDocumentId: z.uuid().optional(),

  nomDestinataire: z.string().optional(),
  prenomDestinataire: z.string().optional(),
  useTemplate: z.boolean().optional(),
});

type MailgunAttachment = { data: Buffer; filename: string };

type EmailWithTemplate = {
  from: string;
  to: string[];
  bcc?: string[];
  subject: string;
  template: string;
  "h:X-Mailgun-Variables": string;
  "h:Reply-To"?: string;
  attachment?: MailgunAttachment[];
};

type EmailWithoutTemplate = {
  from: string;
  to: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
  "h:Reply-To"?: string;
  attachment?: MailgunAttachment[];
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10MB (ajuste)

export async function POST(req: NextRequest) {
  const session = await getSession();
  const userId = session?.user?.id;
  console.log("Mailgun route called by userId:", userId); // Debug log to check authentication

  if (!userId) {
    return errorResponse("UNAUTHORIZED", "Authentication required", {
      status: 401,
    });
  }

  const apiKey = process.env.MAILGUN_API_KEY;
  if (!apiKey) {
    return errorResponse("CONFIG", "La clé API Mailgun est manquante.", {
      status: 500,
    });
  }

  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({ username: "api", key: apiKey });

  try {
    const body = await parseJson(req, emailSchema);

    const replyTo =
      body.from && body.from.toLowerCase() !== "noreply@mg.fm4all.com"
        ? body.from
        : undefined;

    // 1) Si attachmentDocumentId: on récupère le doc en DB
    let attachment: MailgunAttachment[] | undefined;

    if (body.attachmentDocumentId) {
      const doc = await getDocumentById(body.attachmentDocumentId);

      if (!doc) {
        return errorResponse("NOT_FOUND", "Document introuvable.", {
          status: 404,
        });
      }

      // 2) Ownership: doc.proprietaireEntrepriseId est la vérité
      // TODO: vérifie que userId a accès à doc.proprietaireEntrepriseId
      // if (!(await userHasEntrepriseAccess(userId, doc.proprietaireEntrepriseId))) {
      //   return errorResponse("FORBIDDEN", "Access denied.", { status: 403 });
      // }

      // 3) Vérifs storage
      if (doc.storageProvider !== "s3") {
        return errorResponse("DEPENDENCY", "Document non stocké sur S3.", {
          status: 502,
          details: { storageProvider: doc.storageProvider },
        });
      }

      if (doc.sizeBytes > MAX_ATTACHMENT_BYTES) {
        return errorResponse("VALIDATION", "Pièce jointe trop volumineuse.", {
          status: 422,
          details: { sizeBytes: doc.sizeBytes, maxBytes: MAX_ATTACHMENT_BYTES },
        });
      }

      const v = validateKeyAllowed({
        key: doc.storageKey,
        proprietaireEntrepriseId: doc.proprietaireEntrepriseId,
      });
      if (!v.ok)
        return errorResponse(
          v.status === 400 ? "VALIDATION" : "FORBIDDEN",
          v.message,
          { status: v.status, details: v.details },
        );

      const fileBuffer = await getS3ObjectAsBuffer(doc.storageKey);

      attachment = [
        {
          data: fileBuffer,
          filename: doc.filename,
        },
      ];
    }

    const base = {
      from: `fm4all: Le Facility Management pour tous <noreply@mg.fm4all.com>`,
      to: [body.to],
      bcc: [process.env.MAILGUN_BCC_EMAIL!], // BCC => invisible côté destinataire
      subject: body.subject,
      ...(replyTo ? { "h:Reply-To": replyTo } : {}),
      ...(attachment ? { attachment } : {}),
    };

    // Sans template
    if (body.useTemplate === false) {
      const emailOptions: EmailWithoutTemplate = {
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
    const emailOptions: EmailWithTemplate = {
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
