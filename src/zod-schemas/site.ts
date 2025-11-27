import { sites } from "@/db/schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { typeBatimentSchema, typeOccupationSchema } from "./client"; // adapte le chemin si besoin
import { codePostalSchema } from "./codePostal";

// ================== SELECT ================== //

export const selectSiteSchema = createSelectSchema(sites, {
  nomSite: (schema) => schema.min(1, "Nom du site obligatoire"),
  adresseLigne1: (schema) => schema.optional(),
  adresseLigne2: (schema) => schema.optional(),
  codePostal: codePostalSchema,
  ville: (schema) => schema.min(1, "Ville obligatoire"),
  surface: (schema) =>
    schema
      .min(1, "Surface obligatoire")
      .max(3000, "Surface maximum 3000 m²")
      .optional(),
  effectif: (schema) =>
    schema
      .min(1, "Effectif obligatoire")
      .max(300, "Effectif maximum 300 personnes")
      .optional(),
  typeBatiment: typeBatimentSchema,
  typeOccupation: typeOccupationSchema,
  commentaires: (schema) => schema.optional(),
});
export type SelectSiteType = z.infer<typeof selectSiteSchema>;

// ================== INSERT ================== //

export const createInsertSiteSchema = (messages: {
  nomSite: string;
  codePostal: string;
  ville: string;
  surface: string;
  surfaceMax: string;
  effectif: string;
  effectifMax: string;
}) =>
  createInsertSchema(sites, {
    nomSite: (schema) => schema.min(1, messages.nomSite),
    adresseLigne1: (schema) => schema.optional(),
    adresseLigne2: (schema) => schema.optional(),
    codePostal: codePostalSchema, // message dans le helper
    ville: (schema) => schema.min(1, messages.ville),
    surface: (schema) =>
      schema.min(1, messages.surface).max(3000, messages.surfaceMax),
    effectif: (schema) =>
      schema.min(1, messages.effectif).max(300, messages.effectifMax),
    typeBatiment: typeBatimentSchema,
    typeOccupation: typeOccupationSchema,
    commentaires: (schema) => schema.optional(),
    createdById: (schema) => schema.optional(),
    updatedById: (schema) => schema.optional(),
  });

export const insertSiteSchema = createInsertSiteSchema({
  nomSite: "Nom du site obligatoire",
  codePostal: "Code postal invalide, entrez 5 chiffres",
  ville: "Ville obligatoire",
  surface: "Surface obligatoire",
  surfaceMax: "Surface maximum 3000 m²",
  effectif: "Effectif obligatoire",
  effectifMax: "Effectif maximum 300 personnes",
});

export type InsertSiteType = z.infer<typeof insertSiteSchema>;

// ================== UPDATE ================== //

export const createUpdateSiteSchema = (messages: {
  nomSite: string;
  codePostal: string;
  ville: string;
  surface: string;
  surfaceMax: string;
  effectif: string;
  effectifMax: string;
}) =>
  createUpdateSchema(sites, {
    nomSite: (schema) => schema.min(1, messages.nomSite),
    adresseLigne1: (schema) => schema.optional(),
    adresseLigne2: (schema) => schema.optional(),
    codePostal: codePostalSchema,
    ville: (schema) => schema.min(1, messages.ville),
    surface: (schema) =>
      schema.min(1, messages.surface).max(3000, messages.surfaceMax),
    effectif: (schema) =>
      schema.min(1, messages.effectif).max(300, messages.effectifMax),
    typeBatiment: typeBatimentSchema,
    typeOccupation: typeOccupationSchema,
    commentaires: (schema) => schema.optional(),
  });

export const updateSiteSchema = createUpdateSiteSchema({
  nomSite: "Nom du site obligatoire",
  codePostal: "Code postal invalide, entrez 5 chiffres",
  ville: "Ville obligatoire",
  surface: "Surface minimale 1 m²",
  surfaceMax: "Surface maximum 3000 m²",
  effectif: "Effectif minimal 1 personne",
  effectifMax: "Effectif maximum 300 personnes",
});

export type UpdateSiteType = z.infer<typeof updateSiteSchema>;
