export const sendEmailFromClient = async (body: {
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
}) => {
  const res = await fetch("/api/mailgun", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Mailgun route error: ${res.status} ${res.statusText} - ${text}`,
    );
  }

  return res.json().catch(() => undefined);
};

export const sendEmailFromServer = async (body: {
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
}) => {
  const res = await fetch(`${process.env.APP_URL}/api/mailgun`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Mailgun route error: ${res.status} ${res.statusText} - ${text}`,
    );
  }

  return res.json().catch(() => undefined);
};
