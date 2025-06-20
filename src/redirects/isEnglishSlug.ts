export const isEnglishSlug = (
  slug: string,
  mapping: Record<string, string>
): boolean => {
  // Utiliser votre mapping de slugs pour vérifier
  // Retourne true si c'est un slug anglais, false sinon
  const frenchSlugs = Object.keys(mapping);
  const englishSlugs = Object.values(mapping);
  return englishSlugs.includes(slug) && !frenchSlugs.includes(slug);
};

export const isEnglishSubSlug = (
  subSlug: string,
  mapping: Record<string, string>
): boolean => {
  // Utiliser votre mapping de slugs pour vérifier
  // Retourne true si c'est un slug anglais, false sinon
  const frenchSubSlugs = Object.keys(mapping);
  const englishSubSlugs = Object.values(mapping);
  return englishSubSlugs.includes(subSlug) && !frenchSubSlugs.includes(subSlug);
};
