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

export const buildFinalBlobPath = (opts: {
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
export const promoteTempBlob = async (
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

  const targetPath = buildFinalBlobPath({
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
