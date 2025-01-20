import { GammeType } from "@/zod-schemas/gamme";

export const getFm4AllColor = (gamme: GammeType | null) => {
  if (!gamme) return "";
  return gamme === "essentiel"
    ? "fm4allessential"
    : gamme === "confort"
    ? "fm4allcomfort"
    : "fm4allexcellence";
};
