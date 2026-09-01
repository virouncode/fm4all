import { toast } from "sonner";

/**
 * Copie un texte dans le presse-papier.
 * Utilise l'API Clipboard quand elle est disponible, sinon retombe sur
 * `document.execCommand("copy")` (Safari / contextes non sécurisés).
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // on tente le fallback ci-dessous
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
};

/**
 * Ouvre le client email de l'utilisateur (mailto:).
 *
 * Si aucun client email n'est configuré, rien ne se passe côté navigateur :
 * la page ne perd ni le focus ni la visibilité. Dans ce cas on copie l'adresse
 * dans le presse-papier et on affiche un toast de succès.
 *
 * ⚠️ À appeler directement depuis un event handler (clic) : l'écriture dans le
 * presse-papier nécessite une activation utilisateur récente.
 */
export const openMailtoWithFallback = (email: string, locale: string) => {
  if (typeof window === "undefined") return;

  let mailClientOpened = false;
  const markOpened = () => {
    mailClientOpened = true;
  };

  window.addEventListener("blur", markOpened);
  document.addEventListener("visibilitychange", markOpened);
  window.addEventListener("pagehide", markOpened);

  window.location.href = `mailto:${email}`;

  window.setTimeout(async () => {
    window.removeEventListener("blur", markOpened);
    document.removeEventListener("visibilitychange", markOpened);
    window.removeEventListener("pagehide", markOpened);

    if (mailClientOpened || document.hidden || !document.hasFocus()) return;

    const copied = await copyToClipboard(email);

    if (copied) {
      toast.success(
        locale === "fr"
          ? `Adresse copiée : ${email}`
          : `Address copied: ${email}`,
        {
          description:
            locale === "fr"
              ? "Collez-la dans votre messagerie pour nous écrire."
              : "Paste it into your email app to write to us.",
        },
      );
    } else {
      toast.info(
        locale === "fr" ? `Écrivez-nous à ${email}` : `Write to us at ${email}`,
      );
    }
  }, 1000);
};
