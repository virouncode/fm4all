export const typesPose = [
  {
    id: "aposer",
    description: "A poser",
  },
  { id: "colonne", description: "En colonne" },
  { id: "comptoir", description: "Sous comptoir" },
];

export const typesPoseArray = typesPose.map((type) => type.id);
export type TypesPoseType = "aposer" | "colonne" | "comptoir";
