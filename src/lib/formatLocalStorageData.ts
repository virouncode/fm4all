type LocalStorageData = Record<string, unknown>;

// Une fonction pour récupérer et formater les données du localStorage
export const formatLocalStorageData = (): string => {
  const formattedData: LocalStorageData = {};
  const excludedKeys = [
    "monDevis",
    "ally-supports-cache",
    "devisProgress",
    "services",
    "foodBeverage",
    "management",
    "personnalisation",
  ];
  const predefinedOrder = [
    "client",
    "nettoyage",
    "totalNettoyage",
    "hygiene",
    "totalHygiene",
    "maintenance",
    "totalMaintenance",
    "incendie",
    "totalIncendie",
    "cafe",
    "totalCafe",
    "the",
    "totalThe",
    "snacksFruits",
    "totalSnacksFruits",
    "fontaines",
    "totalFontaines",
    "officeManager",
    "totalOfficeManager",
    "servicesFm4All",
    "totalServicesFm4All",
  ];

  // Parcourir chaque clé du localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i); // Récupérer la clé
    if (key && !excludedKeys.includes(key)) {
      // Vérifier que la clé est définie (TypeScript safety)
      const value = localStorage.getItem(key);
      try {
        // Essayer de parser les données en JSON
        formattedData[key] = value ? JSON.parse(value) : null;
      } catch (err) {
        // Si ce n'est pas du JSON, utiliser la valeur brute
        formattedData[key] = value;
      }
    }
  }
  const orderedData: Record<string, unknown> = {};
  const sortedKeys = [
    ...predefinedOrder.filter((key) => key in formattedData), // Ajouter les clés dans l'ordre défini
    ...Object.keys(formattedData)
      .filter((key) => !predefinedOrder.includes(key))
      .sort(), // Ajouter les clés restantes triées alphabétiquement
  ];
  sortedKeys.forEach((key) => {
    orderedData[key] = formattedData[key];
  });
  return JSON.stringify(orderedData, null, 2);
};
