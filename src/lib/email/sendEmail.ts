export const sendEmailFromClient = async (body: {
  to: string;
  from: string;
  subject: string;
  text: string;
  attachment?: string;
  filename?: string;
  nomDestinataire?: string;
  prenomDestinataire?: string;
}) => {
  await fetch("/api/mailgun", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};
export const sendEmailFromServer = async (body: {
  to: string;
  from: string;
  subject: string;
  text: string;
  attachment?: string;
  filename?: string;
  nomDestinataire?: string;
  prenomDestinataire?: string;
}) => {
  await fetch(`${process.env.APP_URL}/api/mailgun`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};
