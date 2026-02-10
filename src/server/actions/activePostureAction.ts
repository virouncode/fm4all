"use server";

import { roleEntrepriseCodes } from "@/constants/codeTables";
import { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";
import { cookies } from "next/headers";

export async function setActivePostureAction(posture: RoleEntrepriseType) {
  // safety: n’accepte que les valeurs connues
  if (!roleEntrepriseCodes.includes(posture)) return;

  const cookieStore = await cookies();
  cookieStore.set("fm4all:postureActive", posture, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // 180 jours
    maxAge: 60 * 60 * 24 * 180,
  });
}
