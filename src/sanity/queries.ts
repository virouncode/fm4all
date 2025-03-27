export const SERVICES_QUERY = `*[_type == "service"]|order(date asc)[0...20]{ _id, titre, description, slug, imagePrincipale }`;

export const SERVICE_QUERY = `*[_type == "service" && slug.current == $slug][0]`;
