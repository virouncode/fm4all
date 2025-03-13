import { errorHandler } from "@/lib/errorHandler";
import formData from "form-data";
import Mailgun from "mailgun.js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const emailSchema = z.object({
  from: z.string().email(),
  to: z.string().email(),
  subject: z.string().min(1, "Le sujet est obligatoire"),
  text: z.string().min(1, "Le message est obligatoire"),
  attachment: z.string().url().optional(),
  filename: z.string().optional(),
});

type EmailType = {
  from: string;
  to: string[];
  subject: string;
  template: string;
  "h:X-Mailgun-Variables": string;
  attachment?: { data: Buffer; filename: string };
};

export async function POST(req: NextRequest) {
  const mailgun = new Mailgun(formData);
  const apiKey = process.env.MAILGUN_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CONFIG_ERROR",
          message: "La clé API Mailgun est manquante.",
        },
      },
      { status: 500 }
    );
  }

  const mg = mailgun.client({ username: "api", key: apiKey });

  try {
    const body = await req.json();
    const result = emailSchema.safeParse(body);
    if (!result.success) {
      return errorHandler(result.error);
    }

    const data = result.data;
    let fileBuffer;

    if (data.attachment) {
      try {
        const responseBlob = await fetch(data.attachment);
        if (!responseBlob.ok)
          throw new Error("Impossible de récupérer la pièce jointe");
        const arrayBuffer = await responseBlob.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      } catch (error) {
        return errorHandler(error);
      }
    }

    const emailOptions: EmailType = {
      from: `fm4all: Le Facility Management pour tous <${data.from}>`,
      to: [data.to, "viroun@fm4all.com"],
      subject: data.subject,
      template: "general",
      "h:X-Mailgun-Variables": JSON.stringify({
        nom_destinataire: "Buffe",
        prenom_destinataire: "Romuald",
        corps_message: data.text,
        subject: data.subject,
      }),
    };

    if (fileBuffer) {
      emailOptions.attachment = {
        data: fileBuffer,
        filename: data.filename ?? "attachment",
      };
    }

    const response = await mg.messages.create("mg.fm4all.com", emailOptions);

    return NextResponse.json(
      { success: true, data: response, message: "Email envoyé avec succès" },
      { status: 200 }
    );
  } catch (err) {
    return errorHandler(err);
  }
}
