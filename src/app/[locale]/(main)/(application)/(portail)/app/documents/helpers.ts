import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDocumentDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy", { locale: fr });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function getMimeTypeLabel(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("video/")) return "Vidéo";
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || mimeType === "application/msword") return "Word";
  if (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || mimeType === "application/vnd.ms-excel") return "Excel";
  if (mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") return "PowerPoint";
  if (mimeType === "text/plain") return "Texte";
  if (mimeType === "text/csv") return "CSV";
  return "Fichier";
}

/** Whether a browser can display a live preview */
export function isPreviewable(mimeType: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    mimeType === "application/pdf" ||
    mimeType.startsWith("video/")
  );
}

export function getVisibiliteLabel(visibilite: "prive" | "public"): string {
  return visibilite === "public" ? "Partagé" : "Privé";
}
