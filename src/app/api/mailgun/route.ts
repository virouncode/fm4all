import { errorHandler } from "@/lib/errorHandler";
import formData from "form-data";
import Mailgun from "mailgun.js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ApiResponseBody } from "../types/apiResponseBody";

const emailSchema = z.object({
  from: z.email(),
  to: z.email(),
  subject: z.string().min(1, "Le sujet est obligatoire"),
  text: z.string().min(1, "Le corps du message est obligatoire"),
  html: z.string().optional(),
  attachment: z.url().optional(),
  filename: z.string().optional(),
  nomDestinataire: z.string().optional(),
  prenomDestinataire: z.string().optional(),
  useTemplate: z.boolean().optional(),
});

type EmailWithTemplateType = {
  from: string;
  to: string[];
  subject: string;
  template: string;
  "h:X-Mailgun-Variables": string;
  attachment?: { data: Buffer; filename: string };
};

type EmailWithoutTemplateType = {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html?: string;
  attachment?: { data: Buffer; filename: string };
};

export async function POST(req: NextRequest) {
  const mailgun = new Mailgun(formData);
  const apiKey = process.env.MAILGUN_API_KEY;

  if (!apiKey) {
    const responseBody: ApiResponseBody = {
      success: false,
      message: "La clé API Mailgun est manquante.",
      code: "CONFIG_ERROR",
    };
    return NextResponse.json(responseBody, { status: 500 });
  }

  const mg = mailgun.client({ username: "api", key: apiKey });

  try {
    const body = await req.json();
    const result = emailSchema.safeParse(body);
    if (!result.success) {
      return errorHandler(result.error);
    }

    const parsedBody = result.data;

    let fileBuffer: Buffer | undefined;

    if (parsedBody.attachment) {
      try {
        const responseBlob = await fetch(parsedBody.attachment);
        if (!responseBlob.ok)
          throw new Error("Impossible de récupérer la pièce jointe");
        const arrayBuffer = await responseBlob.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      } catch (error) {
        return errorHandler(error);
      }
    }

    if (parsedBody.useTemplate === false) {
      const emailOptions: EmailWithoutTemplateType = {
        from: `fm4all: Le Facility Management pour tous <${parsedBody.from}>`,
        to: [parsedBody.to, "viroun@fm4all.com"],
        subject: parsedBody.subject,
        html: parsedBody.html ? parsedBody.html : undefined,
        text: parsedBody.html ? "" : parsedBody.text,
      };

      if (fileBuffer) {
        emailOptions.attachment = {
          data: fileBuffer,
          filename: parsedBody.filename ?? "attachment",
        };
      }

      const response = await mg.messages.create("mg.fm4all.com", emailOptions);

      const responseBody: ApiResponseBody = {
        success: true,
        message: "Email envoyé avec succès",
        data: { id: response.id, message: response.message },
      };
      return NextResponse.json(responseBody, { status: 200 });
    }

    // Sinon : comportement actuel avec template
    const emailOptions: EmailWithTemplateType = {
      from: `fm4all: Le Facility Management pour tous <${parsedBody.from}>`,
      to: [parsedBody.to, "viroun@fm4all.com"],
      subject: parsedBody.subject,
      template: "general",
      "h:X-Mailgun-Variables": JSON.stringify({
        nom_destinataire: parsedBody.nomDestinataire,
        prenom_destinataire: parsedBody.prenomDestinataire,
        corps_message: parsedBody.text, // ici on est sûr que text reste raisonnable
        subject: parsedBody.subject,
      }),
    };

    if (fileBuffer) {
      emailOptions.attachment = {
        data: fileBuffer,
        filename: parsedBody.filename ?? "attachment",
      };
    }

    const response = await mg.messages.create("mg.fm4all.com", emailOptions);

    const responseBody: ApiResponseBody = {
      success: true,
      message: "Email envoyé avec succès",
      data: { id: response.id, message: response.message },
    };
    return NextResponse.json(responseBody, { status: 200 });
  } catch (err) {
    console.log(err);
    return errorHandler(err);
  }
}
