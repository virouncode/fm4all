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
    const response = await mg.messages.create("mg.fm4all.com", {
      from: "contact@fm4all.com",
      to: [body?.to],
      subject: body?.subject,
      text: body?.text,
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
