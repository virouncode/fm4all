import { NextRequest } from "next/server";
import { z } from "zod";

export async function parseJson<TSchema extends z.ZodTypeAny>(
  req: NextRequest,
  schema: TSchema,
) {
  const json = await req.json();
  return schema.parse(json);
}
