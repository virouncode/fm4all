const surfaces = [
  50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 800, 900,
  1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2500, 3000,
];

export const roundSurface = (surface: number) => {
  const roundedSurface = surfaces
    .filter((curr) => curr <= surface) // Garde les valeurs inférieures ou égales
    .reduce((prev, curr) => Math.max(prev, curr), -Infinity); // Trouve le maximum
  return roundedSurface;
};
