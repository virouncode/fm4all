import { ApiResponseBody } from "@/app/api/types/apiResponse";

// types/vercelBlob.ts (par exemple)
export type VercelBlobUploadData = {
  url: string;
  size: number;
  mimeType: string;
  filename: string; // nom "logique" que tu as passé en param
  pathname: string; // chemin réel dans le store (avec suffix si addRandomSuffix)
};

export type VercelBlobUploadResponse = ApiResponseBody<VercelBlobUploadData>;

// types/vercelBlob.ts
export type VercelBlobDeleteData = {
  url: string;
};

export type VercelBlobDeleteResponse = ApiResponseBody<VercelBlobDeleteData>;
