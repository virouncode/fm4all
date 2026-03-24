import { env } from "@/lib/env";
import formData from "form-data";
import Mailgun from "mailgun.js";
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

export async function sendEmailDirect(params: SendEmailDirectParamsType) {
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({ username: "api", key: env.MAILGUN_API_KEY });

  const {
    to,
    from,
    subject,
    text,
    html,
    nomDestinataire,
    prenomDestinataire,
    useTemplate = true,
    attachment,
  } = params;

  const replyTo =
    from && from.toLowerCase() !== "noreply@mg.fm4all.com" ? from : undefined;

  const bccEmail = env.MAILGUN_BCC_EMAIL;

  const base = {
    from: `fm4all: Le Facility Management pour tous <noreply@mg.fm4all.com>`,
    to: [to],
    ...(bccEmail ? { bcc: [bccEmail] } : {}),
    subject,
    ...(replyTo ? { "h:Reply-To": replyTo } : {}),
  };

  // Sans template
  if (useTemplate === false) {
    const emailOptions = {
      ...base,
      html: html ? html : undefined,
      text: html ? "" : text,
      ...(attachment
        ? {
            attachment: [
              {
                data: attachment.data,
                filename: attachment.filename,
                contentType: attachment.contentType,
              },
            ],
          }
        : {}),
    };

    const response = await mg.messages.create("mg.fm4all.com", emailOptions);
    return { id: response.id, message: response.message };
  }

  // Avec template
  const emailOptions = {
    ...base,
    template: "general",
    "h:X-Mailgun-Variables": JSON.stringify({
      nom_destinataire: nomDestinataire,
      prenom_destinataire: prenomDestinataire,
      corps_message: text,
      subject: subject,
    }),
    ...(attachment
      ? {
          attachment: [
            {
              data: attachment.data,
              filename: attachment.filename,
              contentType: attachment.contentType,
            },
          ],
        }
      : {}),
  };

  const response = await mg.messages.create("mg.fm4all.com", emailOptions);
  return { id: response.id, message: response.message };
}
