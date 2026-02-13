"use server";

import { errors } from "@/lib/action/errors";
import { actionClient } from "@/lib/action/safe-actions";
import { getDocumentById } from "@/server/queries/documents.query";
import { z } from "zod";

export const getDocumentAction = actionClient
  .metadata({ actionName: "getDocumentAction" })
  .inputSchema(
    z.object({
      documentId: z.uuid("ID document invalide"),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { documentId } = parsedInput;

    const document = await getDocumentById(documentId);

    if (!document) {
      throw errors.notFound("Document");
    }

    return { document };
  });
