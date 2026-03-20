import type { documentCategorieCodes } from "@/constants/codeTables";
import {
  deleteS3ObjectAction,
  getPresignedReadUrlAction,
  getPresignedUploadUrlAction,
} from "@/server/actions/s3Actions";
import { S3AllowedContentType } from "@/server/s3/s3";

/**
 * Upload un fichier vers S3 via URL présignée
 * @returns La clé S3 et l'URL de preview du fichier uploadé
 */
export async function uploadFileToS3(params: {
  file: File;
  proprietaireEntrepriseId: string;
  categorie: (typeof documentCategorieCodes)[number];
}): Promise<{ key: string; previewUrl: string }> {
  const { file, proprietaireEntrepriseId, categorie } = params;

  // 1. Obtenir URLs présignées (upload + preview) depuis Server Action
  const result = await getPresignedUploadUrlAction({
    proprietaireEntrepriseId,
    categorie,
    contentType: file.type as S3AllowedContentType,
    originalName: file.name,
  });

  if (result?.serverError) {
    throw new Error(
      result.serverError.message ||
        "Erreur lors de la génération de l'URL présignée",
    );
  }

  if (result?.validationErrors) {
    const errors = Object.values(result.validationErrors).flat();
    throw new Error(errors[0] || "Données invalides");
  }

  if (!result?.data) {
    throw new Error("Impossible d'obtenir l'URL présignée");
  }

  const { uploadUrl, key, previewUrl, headers } = result.data;

  // Validation des données retournées
  if (!uploadUrl || !key || !previewUrl) {
    throw new Error(
      `Données incomplètes: uploadUrl=${!!uploadUrl}, key=${!!key}, previewUrl=${!!previewUrl}`,
    );
  }

  // 2. Upload direct vers S3
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: headers ?? undefined,
  });

  if (!uploadResponse.ok) {
    await uploadResponse.text();
    throw new Error(
      `Échec de l'upload S3: ${uploadResponse.status} ${uploadResponse.statusText}`,
    );
  }

  return { key, previewUrl };
}

/**
 * Obtenir une URL de lecture présignée pour prévisualiser un fichier
 */
export async function getPresignedReadUrl(params: {
  key: string;
  proprietaireEntrepriseId: string;
}): Promise<string> {
  const result = await getPresignedReadUrlAction({
    key: params.key,
    proprietaireEntrepriseId: params.proprietaireEntrepriseId,
  });

  if (result?.serverError) {
    throw new Error(
      result.serverError.message ||
        "Erreur lors de la génération de l'URL de lecture",
    );
  }

  if (result?.validationErrors) {
    const errors = Object.values(result.validationErrors).flat();
    throw new Error(errors[0] || "Données invalides");
  }

  if (!result?.data?.url) {
    throw new Error("Impossible d'obtenir l'URL de lecture");
  }

  return result.data.url;
}

/**
 * Supprimer un fichier S3
 */
export async function deleteS3Object(params: {
  key: string;
  proprietaireEntrepriseId: string;
}): Promise<void> {
  const result = await deleteS3ObjectAction({
    key: params.key,
    proprietaireEntrepriseId: params.proprietaireEntrepriseId,
  });

  if (result?.serverError) {
    throw new Error(
      result.serverError.message || "Erreur lors de la suppression du fichier",
    );
  }

  if (result?.validationErrors) {
    const errors = Object.values(result.validationErrors).flat();
    throw new Error(errors[0] || "Données invalides");
  }
}
