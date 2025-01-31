const nbPersonnesPaliers = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150,
];

export const roundNbPersonnesCafe = (nbPersonnesCafe: number) => {
  const roundedNbPersonnesCafe = nbPersonnesPaliers
    .filter((curr) => curr >= nbPersonnesCafe) // Garde les valeurs supérieures ou égales
    .reduce((prev, curr) => Math.min(prev, curr), +Infinity); // Trouve le minimum
  return roundedNbPersonnesCafe;
};
