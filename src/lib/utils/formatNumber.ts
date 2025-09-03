export const formatNumber = (number: number) => {
  const formatter = new Intl.NumberFormat("fr-FR", {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  return formatter.format(number);
};
