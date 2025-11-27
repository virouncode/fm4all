import {
  VercelBlobUploadData,
  VercelBlobUploadResponse,
} from "@/zod-schemas/vercelBlob";

// lib/postVercelBlob.ts
export const postVercelBlob = async ({
  file,
  filename,
  foldername,
}: {
  file: File;
  filename: string;
  foldername: string;
}): Promise<VercelBlobUploadData> => {
  const params = new URLSearchParams({
    filename,
    foldername,
  });

  const response = await fetch(`/api/vercelblob?${params.toString()}`, {
    method: "POST",
    // Très important : PAS de Content-Type manuel ici.
    // Le navigateur mettra le bon mime type du fichier.
    body: file,
  });

  let json: VercelBlobUploadResponse | undefined;

  try {
    json = (await response.json()) as VercelBlobUploadResponse;
  } catch {
    // Si le backend renvoie autre chose que du JSON
    throw new Error("Erreur lors de l'upload du fichier.");
  }

  if (!response.ok || !json) {
    throw new Error(json?.message ?? "Erreur lors de l'upload du fichier.");
  }

  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Upload du fichier échoué.");
  }

  return json.data;
};
