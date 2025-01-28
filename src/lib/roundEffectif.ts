const effectifs = [
  1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 100, 110, 120,
  130, 140, 150, 160, 170, 180, 190, 200, 250, 300,
];

export const roundEffectif = (effectif: number) => {
  const roundedEffectif = effectifs
    .filter((curr) => curr <= effectif) // Garde les valeurs inférieures ou égales
    .reduce((prev, curr) => Math.max(prev, curr), -Infinity); // Trouve le maximum
  return roundedEffectif;
};
