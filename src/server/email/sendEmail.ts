// import "server-only";

type SendEmailBody = {
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
  attachment?: string;
  filename?: string;
  nomDestinataire?: string;
  prenomDestinataire?: string;
  useTemplate?: boolean;
};

export async function sendEmailFromServer(body: SendEmailBody) {
  const baseUrl = process.env.APP_URL;
  if (!baseUrl) {
    throw new Error(
      "Missing APP_URL env var (required to call /api/mailgun from server).",
    );
  }

  const res = await fetch(`${baseUrl}/api/mailgun`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Mailgun route error: ${res.status} ${res.statusText} - ${text}`,
    );
  }

  return res.json().catch(() => undefined);
}
