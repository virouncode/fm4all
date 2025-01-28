const alarmes = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export const roundNbAlarmes = (nbAlarmes: number) => {
  const roundedNbAlarmes = alarmes
    .filter((curr) => curr <= nbAlarmes) // Garde les valeurs inférieures ou égales
    .reduce((prev, curr) => Math.max(prev, curr), -Infinity); // Trouve le maximum
  return roundedNbAlarmes;
};
