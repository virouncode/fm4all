import { z } from "zod";

export const cafeSchema = z.object({
  currentMachineId: z.number().nullable(),
  cafeFournisseurId: z.number().nullable(),
  machines: z.array(
    z.object({
      machineId: z.number(),
      typeBoissons: z.enum(["cafe", "lait", "chocolat"]),
      dureeLocation: z.enum([
        "pa12M",
        "pa24M",
        "pa36M",
        "pa48M",
        "pa60M",
        "oneShot",
      ]),
      nbPersonnes: z.number(),
      nbMachines: z.number(),
      propositionId: z.number().nullable(),
    })
  ),
});

export const cafeMachineSchema = z.object({
  ...cafeSchema.shape.machines.element.shape, // Use `.shape` to spread properties
});

export const cafeMachineFormSchema = z.object({
  machineId: z.number(),
  typeBoissons: z.enum(["cafe", "lait", "chocolat"]),
  dureeLocation: z.enum([
    "pa12M",
    "pa24M",
    "pa36M",
    "pa48M",
    "pa60M",
    "oneShot",
  ]),
  nbPersonnes: z
    .string()
    .regex(
      /^(0|[1-9]\d*)$/,
      "Nombre de personnes invalide : entrez un chiffre entier positif"
    ),
  nbMachines: z.number(),
});

export type CafeType = z.infer<typeof cafeSchema>;
export type CafeMachineType = z.infer<typeof cafeMachineSchema>;
export type CafeMachineFormType = z.infer<typeof cafeMachineFormSchema>;
