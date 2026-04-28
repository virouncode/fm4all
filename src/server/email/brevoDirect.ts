import { env } from "@/lib/env";
import type { Brevo } from "@getbrevo/brevo";
import { BrevoClient } from "@getbrevo/brevo";
import "server-only";

type AttachmentType = {
  data: Buffer;
  filename: string;
  contentType: string;
};

type SendEmailDirectParamsType = {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html?: string;
  nomDestinataire?: string;
  prenomDestinataire?: string;
  useTemplate?: boolean;
  attachment?: AttachmentType;
};

const SENDER_NAME = "fm4all";
const DEFAULT_SENDER_EMAIL = "noreply@mail.fm4all.com";

export async function sendEmailDirect(params: SendEmailDirectParamsType) {
  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "BREVO_API_KEY manquant dans les variables d'environnement.",
    );
  }

  const {
    to,
    from = DEFAULT_SENDER_EMAIL,
    subject,
    text,
    html,
    nomDestinataire,
    prenomDestinataire,
    useTemplate = true,
    attachment,
  } = params;

  const bccEmail = env.BREVO_BCC_EMAIL;

  const request: Brevo.SendTransacEmailRequest = {
    sender: { email: from, name: SENDER_NAME },
    to: [{ email: to }],
    subject,
    replyTo: { email: from, name: SENDER_NAME },
    ...(bccEmail ? { bcc: [{ email: bccEmail }] } : {}),
    ...(attachment
      ? {
          attachment: [
            {
              content: attachment.data.toString("base64"),
              name: attachment.filename,
            },
          ],
        }
      : {}),
  };

  if (useTemplate) {
    const templateIdRaw = env.BREVO_TEMPLATE_GENERAL_ID;
    if (!templateIdRaw) {
      throw new Error(
        "BREVO_TEMPLATE_GENERAL_ID manquant dans les variables d'environnement.",
      );
    }
    const templateId = Number(templateIdRaw);
    if (!Number.isInteger(templateId) || templateId <= 0) {
      throw new Error(
        `BREVO_TEMPLATE_GENERAL_ID invalide : "${templateIdRaw}" (doit être un entier positif).`,
      );
    }
    request.templateId = templateId;
    request.params = {
      nom_destinataire: nomDestinataire,
      prenom_destinataire: prenomDestinataire,
      corps_message: text,
      subject,
    };
  } else if (html) {
    request.htmlContent = html;
  } else {
    request.textContent = text;
  }

  const brevo = new BrevoClient({ apiKey });
  const response = await brevo.transactionalEmails.sendTransacEmail(request);

  return {
    id: response.messageId ?? "",
    message: "Queued. Thank you.",
  };
}
