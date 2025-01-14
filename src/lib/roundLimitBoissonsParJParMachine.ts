const limitesBoissonsParJParMachine = [20, 50, 80, 120];

export const toLimiteBoissonsParJParMachine = (
  nbBoissonsParJParMachine: number
) => {
  return (
    limitesBoissonsParJParMachine.find(
      (limite) => nbBoissonsParJParMachine <= limite
    ) ?? nbBoissonsParJParMachine
  );
};
