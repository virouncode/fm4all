const exutoiresPaliers = [1, 10, 29, 60];

export const roundNbExutoires = (nbExutoires: number) => {
  const roundedNbExutoires = exutoiresPaliers
    .filter((curr) => curr <= nbExutoires) // Garde les valeurs inférieures ou égales
    .reduce((prev, curr) => Math.max(prev, curr), -Infinity); // Trouve le maximum
  return roundedNbExutoires;
};
