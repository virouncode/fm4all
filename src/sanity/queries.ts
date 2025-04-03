export const SERVICES_QUERY = `*[_type == "service" && language == $language]|order(date asc){ _id, titre, description, slug, imagePrincipale }`;

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

export const LAST_ARTICLES_QUERY = `*[_type == "article" && language == $language]|order(date desc)[0...10]{ 
_id, titre, description, subSlug, imagePrincipale, 
categorie->{
  _id,
  titre,
  slug}
}`;

export const ARTICLES_OF_CATEGORIE_QUERY = `*[_type == "article" && language == $language && references(*[_type == "articleCategory" && slug.current == $slug]._id)]|order(date desc){ 
  _id, 
  titre, 
  description, 
  subSlug, 
  imagePrincipale 
}`;

export const CATEGORIE_QUERY = `*[_type == "articleCategory" && slug.current == $slug][0]{
  _id,
  titre,
  slug}`;

export const TOUTES_CATEGORIES_QUERY = `*[_type == "articleCategory" && (language == $language || language == null)]`;

export const ARTICLE_QUERY = `*[_type == "article" && subSlug.current == $subSlug][0]{
    ...,
    categorie->{
      _id,
      titre,
      slug
      },
    auteur->{
      _id,
      prenom,
      nom,
      image,
      },
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
        subSlug,
        imagePrincipale
      },
     secteursAssocies[]->{
        _id,
        titre,
        description,
        slug,
        imagePrincipale
      },
      articlesAssocies[]->{
        _id,
        titre,
        description,
        slug,
        subSlug,
        imagePrincipale
      },
}`;
