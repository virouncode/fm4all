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
    }),
    defineField({
      title: "Slug",
      name: "slug",
      type: "slug",
      options: {
        source: "titre",
      },
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
    }),
  ],
});
