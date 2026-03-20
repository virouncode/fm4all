type SendEmailFromClientParamsType = {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html?: string;
  nomDestinataire?: string;
  prenomDestinataire?: string;
  useTemplate?: boolean;
};

/**
 * Envoie un email depuis le client en appelant la route API /api/mailgun.
 * À utiliser uniquement dans des composants "use client".
 */
export async function sendEmailFromClient(
  params: SendEmailFromClientParamsType,
): Promise<void> {
  const response = await fetch("/api/mailgun", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de l'envoi de l'email: ${response.status}`);
  }
}
