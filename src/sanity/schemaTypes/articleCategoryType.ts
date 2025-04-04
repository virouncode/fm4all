import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const articleCategoryType = defineType({
  title: "Categories Articles",
  name: "articleCategory",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      title: "Titre",
      name: "titre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: "Balise Titre",
      name: "baliseTitle",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: "Balise Description",
      name: "baliseDescription",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: "Slug",
      name: "slug",
      type: "slug",
      options: {
        source: "titre",
      },
      validation: (rule) => rule.required(),
    }),
    //Image principale
    defineField({
      title: "Image principale",
      name: "imagePrincipale",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Texte alternatif",
        }),
      ],
    }),
    defineField({
      name: "language",
      type: "string",
      options: {
        list: [
          { title: "English", value: "en" },
          { title: "Français", value: "fr" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
});
