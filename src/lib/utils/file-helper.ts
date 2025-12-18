// src/lib/files/promoteBlob.ts

import { del, put } from "@vercel/blob";

export type TempAttachmentInput = {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
};

export type PromotedAttachment = TempAttachmentInput & {
  url: string;
};

export const isTempBlob = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.pathname.includes("/temp/");
  } catch {
    return false;
  }
};

const slugifyBaseName = (name: string) => {
  return name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
};

const splitName = (filename: string) => {
  const safe = slugifyBaseName(filename);
  const ext = safe.includes(".") ? safe.split(".").pop()! : "bin";
  const base = safe.replace(/\.[^.]+$/, "");
  return { base, ext };
};

export const buildFinalTicketAttachmentBlobPath = (opts: {
  clientId: number | string;
  ticketId: number | string;
  filename: string;
  tableName: string;
}) => {
  const { clientId, ticketId, filename, tableName } = opts;
  const { base, ext } = splitName(filename);
  // timestamp pour éviter les collisions
  return `${tableName}/${clientId}/${ticketId}/${base}_${Date.now()}.${ext}`;
};

/**
 * Promeut un fichier temp -> chemin définitif et supprime l’ancien.
 * Si le fichier n’est pas dans /temp/, il est renvoyé tel quel.
 */
export const promoteTempTicketAttachment = async (
  attachment: TempAttachmentInput,
  {
    clientId,
    ticketId,
    tableName,
  }: {
    clientId: number | string;
    ticketId: number | string;
    tableName: string;
  },
): Promise<PromotedAttachment> => {
  const { url, filename, mimeType } = attachment;

  // Si ce n’est pas un fichier temp, on ne fait rien
  if (!isTempBlob(url)) {
    return attachment;
  }

  const targetPath = buildFinalTicketAttachmentBlobPath({
    clientId,
    ticketId,
    filename,
    tableName,
  });

  // On lit le blob public existant
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error("Impossible de lire le fichier temporaire pour promotion.");
  }

  // On ré-upload dans le chemin définitif
  const newBlob = await put(targetPath, res.body, {
    access: "public",
    contentType: mimeType,
  });

  // On supprime l’ancien dans /temp
  await del(url); // del accepte url ou pathname

  return {
    ...attachment,
    url: newBlob.url,
    // size et mimeType peuvent rester ceux d’origine (ils ne changent pas)
  };
};

const buildFinalAvatarBlobPath = (avatarUrl: string, userRole: string) => {
  const parsed = new URL(avatarUrl);
  const filenameFromUrl = parsed.pathname.split("/").pop() || "avatar.bin";

  const { base, ext } = splitName(filenameFromUrl);

  // On ajoute un timestamp pour éviter les collisions
  return `avatars/${userRole}/${base}_${Date.now()}.${ext}`;
};

export const promoteTempAvatarUrl = async (
  avatarUrl: string | null | undefined,
  userRole: string,
): Promise<string | null | undefined> => {
  // Si ce n'est pas un fichier temp, on ne fait rien
  if (!avatarUrl) {
    return avatarUrl;
  }
  if (!isTempBlob(avatarUrl)) {
    return avatarUrl;
  }

  const targetPath = buildFinalAvatarBlobPath(avatarUrl, userRole);

  // On lit le blob public existant
  const res = await fetch(avatarUrl);
  if (!res.ok || !res.body) {
    throw new Error("Impossible de lire l'avatar temporaire pour promotion.");
  }

  const contentType = res.headers.get("content-type") ?? undefined;

  // On ré-upload dans le chemin définitif
  const newBlob = await put(targetPath, res.body, {
    access: "public",
    contentType,
  });

  // On supprime l'ancien dans /temp
  await del(avatarUrl); // del accepte une URL complète

  return newBlob.url;
};

// ======================= LOGO FOURNISSEUR ==========================//

const buildFinalLogoBlobPath = (logoUrl: string, folderName: string) => {
  const parsed = new URL(logoUrl);
  const filenameFromUrl = parsed.pathname.split("/").pop() || "logo.bin";

  const { base, ext } = splitName(filenameFromUrl);

  // On ajoute un timestamp pour éviter les collisions
  return `${folderName}/${base}_${Date.now()}.${ext}`;
};

export const promoteTempLogoUrl = async (
  logoUrl: string | null | undefined,
  folderName: string = "fournisseurs-logos",
): Promise<string | null | undefined> => {
  // Si ce n'est pas un fichier temp, on ne fait rien
  if (!logoUrl) {
    return logoUrl;
  }
  if (!isTempBlob(logoUrl)) {
    return logoUrl;
  }

  const targetPath = buildFinalLogoBlobPath(logoUrl, folderName);

  // On lit le blob public existant
  const res = await fetch(logoUrl);
  if (!res.ok || !res.body) {
    throw new Error("Impossible de lire le logo temporaire pour promotion.");
  }

  const contentType = res.headers.get("content-type") ?? undefined;

  // On ré-upload dans le chemin définitif
  const newBlob = await put(targetPath, res.body, {
    access: "public",
    contentType,
  });

  // On supprime l'ancien dans /temp
  await del(logoUrl); // del accepte une URL complète

  return newBlob.url;
};
