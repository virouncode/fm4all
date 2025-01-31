const effectifs = [
  1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 180,
  190, 200, 250, 300,
];

export const roundNbPersonnesTotalCafe = (nbPersonnesTotal: number) => {
  const roundedNbPersonnesTotal = effectifs
    .filter((curr) => curr <= nbPersonnesTotal) // Garde les valeurs inférieures ou égales
    .reduce((prev, curr) => Math.max(prev, curr), -Infinity); // Trouve le maximum
  return roundedNbPersonnesTotal;
};
