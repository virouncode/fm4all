const nbPersonnesPaliers = [30, 60, 90, 110];

export const roundNbPersonnesFontaine = (nbPersonnesFontaine: number) => {
  const roundedNbPersonnesFontaine = nbPersonnesPaliers
    .filter((curr) => curr >= nbPersonnesFontaine) // Garde les valeurs supérieures ou égales
    .reduce((prev, curr) => Math.min(prev, curr), +Infinity); // Trouve le minimum
  return roundedNbPersonnesFontaine;
};
