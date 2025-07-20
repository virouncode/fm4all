export const isEnglishSlug = (
  slug: string,
  mapping: Record<string, string>,
): boolean => {
  // Utiliser votre mapping de slugs pour vérifier
  // Retourne true si c'est un slug anglais, false sinon
  const englishSlugs = Object.values(mapping);
  return englishSlugs.includes(slug);
};

export const isFrenchSlug = (
  slug: string,
  mapping: Record<string, string>,
): boolean => {
  // Utiliser votre mapping de slugs pour vérifier
  // Retourne true si c'est un slug français, false sinon
  const frenchSlugs = Object.keys(mapping);
  return frenchSlugs.includes(slug);
};

export const isEnglishSubSlug = (
  subSlug: string,
  mapping: Record<string, string>,
): boolean => {
  // Utiliser votre mapping de slugs pour vérifier
  // Retourne true si c'est un slug anglais, false sinon
  const englishSubSlugs = Object.values(mapping);
  return englishSubSlugs.includes(subSlug);
};

export const isFrenchSubSlug = (
  subSlug: string,
  mapping: Record<string, string>,
): boolean => {
  // Utiliser votre mapping de slugs pour vérifier
  // Retourne true si c'est un slug français, false sinon
  const frenchSubSlugs = Object.keys(mapping);
  return frenchSubSlugs.includes(subSlug);
};
