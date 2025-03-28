export const SERVICES_QUERY = `*[_type == "service" && language==$language]|order(date asc)[0...20]{ _id, titre, description, slug, imagePrincipale }`;

export const SERVICE_QUERY = `*[_type == "service" && slug.current == $slug][0]{
...,
servicesAssocies[]->{
    _id,
    titre,
    description,
    slug,
    imagePrincipale
  },
sousServicesAssocies[]->{
    _id,
    titre,
    description,
    slug,
    imagePrincipale
  },
 secteursAssocies[]->{
    _id,
    titre,
    description,
    slug,
    imagePrincipale
    },
  }`;
