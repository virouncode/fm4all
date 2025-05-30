const nbPersonnesPaliers = [
  1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 250,
  300,
];

export const roundNbPersonnesCafeConso = (nbPersonnesTotal: number) => {
  if (nbPersonnesTotal <= 1) return 1;
  const roundedNbPersonnesTotal = nbPersonnesPaliers
    .filter((curr) => curr <= nbPersonnesTotal) // Garde les valeurs inférieures ou égales
    .reduce((prev, curr) => Math.max(prev, curr), -Infinity); // Trouve le maximum
  return roundedNbPersonnesTotal;
};
