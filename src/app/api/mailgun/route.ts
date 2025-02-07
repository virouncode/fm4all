import { errorHandler } from "@/lib/errorHandler";
import formData from "form-data";
import Mailgun from "mailgun.js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY!,
  });

  try {
    const body = await req.json();
    const responseBlob = await fetch(body?.attachment);
    const arrayBuffer = await responseBlob.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    console.log("body from", body.from, "bodyto", body.to);

    const response = await mg.messages.create("mg.fm4all.com", {
      from: `fm4all: Le Facility Management pour tous <${body.from}>`,
      to: [body.to],
      subject: body.subject,
      template: "general",
      "h:X-Mailgun-Variables": JSON.stringify({
        nom_destinataire: "Buffe",
        prenom_destinataire: "Romuald",
        corps_message: body.text,
        subject: body.subject,
      }),
      attachment: fileBuffer ?? undefined,
    });
    return NextResponse.json(
      {
        success: true,
        data: response,
        message: "Email envoyé avec succès",
      },
      { status: 200 }
    );
  } catch (err) {
    return errorHandler(err);
  }
}
