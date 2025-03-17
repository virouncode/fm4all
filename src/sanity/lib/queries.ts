// src/sanity/lib/queries.ts

import { defineQuery } from "next-sanity";

export const ARTICLES_QUERY =
  defineQuery(`*[_type == "article" && defined(slug.current)][0...12]{
  _id, title, slug
}`);

// export const POST_QUERY =
//   defineQuery(`*[_type == "post" && slug.current == $slug][0]{
//   title, body, mainImage
// }`);
export const ARTICLE_TRANSLATIONS_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug]{
"_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
title,
subtitle,
publishedAt,
parentSlug,
slug,
image,
body,
language
  },
}`
);
