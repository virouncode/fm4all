import {
  documentCategorieCodes,
  documentTypeCodes,
  documentVisibiliteCodes,
  roleEntrepriseCodes,
  typeBatimentCodes,
  typeOccupationCodes,
} from "@/constants/codeTables";
import { pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["active", "inactive"]);
export const typeBatimentEnum = pgEnum("typebatiment", typeBatimentCodes);
export const gammeEnum = pgEnum("gamme", [
  "essentiel",
  "confort",
  "excellence",
]);
export const typeHygieneEnum = pgEnum("typehygiene", [
  "emp",
  "poubelleEmp",
  "savon",
  "ph",
  "desinfectant",
  "parfum",
  "balai",
  "poubelle",
]);
export const typeOccupationEnum = pgEnum("typeoccupation", typeOccupationCodes);
export const possibiliteEnum = pgEnum("possibilite", [
  "possible",
  "non",
  "obligatoire",
]);
export const typeMachineEnum = pgEnum("typemachine", [
  "cafe",
  "lait",
  "chocolat",
]);
export const typeLaitEnum = pgEnum("typelait", ["dosettes", "frais", "poudre"]);
export const typeChocolatEnum = pgEnum("typechocolat", ["sachets", "poudre"]);
export const inclusEnum = pgEnum("inclus", [
  "inclus",
  "non inclus",
  "non propose",
  "sur demande",
]);
export const typePorteEnum = pgEnum("typeporte", ["vantaux", "coulissante"]);
export const typeColonneEnum = pgEnum("typecolonne", ["statique", "dynamique"]);
export const typeEau = pgEnum("typeeau", ["EF", "EC", "EG", "ECG"]);
export const typePose = pgEnum("typepose", ["aposer", "colonne", "comptoir"]);
export const storageProviderEnum = pgEnum("storage_provider", [
  "vercel_blob",
  "s3",
]);
export const documentTypeEnum = pgEnum("document_type", documentTypeCodes);
export const documentVisibiliteEnum = pgEnum(
  "document_visibilite",
  documentVisibiliteCodes,
);
export const documentCategorieEnum = pgEnum(
  "document_categorie",
  documentCategorieCodes,
);
export const roleEntrepriseEnum = pgEnum(
  "role_entreprise",
  roleEntrepriseCodes,
);
