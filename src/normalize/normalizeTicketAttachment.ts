import { InsertTicketAttachmentType } from "@/zod-schemas/ticket";
import { emptyToNull } from "./normalize";

/*eslint-disable @typescript-eslint/no-explicit-any */

export function normalizeTicketAttachmentForDb<
  T extends InsertTicketAttachmentType,
>(input: T): T {
  const a: any = { ...input };
  if (a.uploadedById) {
    a.uploadedById = a.uploadedById.trim();
  }

  if (a.url) {
    a.url = a.url.trim();
  }

  if (a.filename) {
    a.filename = a.filename.trim();
  }

  if (a.mimeType) {
    a.mimeType = a.mimeType.trim().toLowerCase();
  }

  a.description = emptyToNull(a.description);

  return a as T;
}
