import {
  VercelBlobDeleteData,
  VercelBlobDeleteResponse,
} from "@/zod-schemas/vercelBlob";

export const deleteVercelBlob = async ({
  url,
}: {
  url: string;
}): Promise<VercelBlobDeleteData> => {
  const params = new URLSearchParams({ url });

  const response = await fetch(`/api/vercelblob?${params.toString()}`, {
    method: "DELETE",
    // Pas de Content-Type, il n'y a pas de body
  });

  let json: VercelBlobDeleteResponse | undefined;

  try {
    json = (await response.json()) as VercelBlobDeleteResponse;
  } catch {
    throw new Error("Erreur lors de la suppression du fichier.");
  }

  if (!response.ok || !json) {
    throw new Error(
      json?.message ?? "Erreur lors de la suppression du fichier.",
    );
  }

  if (!json.success) {
    throw new Error(json.message ?? "Suppression du fichier échouée.");
  }

  return json.data!;
};
