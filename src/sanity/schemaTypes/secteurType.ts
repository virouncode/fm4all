import { ActivityIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const secteurType = defineType({
  name: "secteur",
  title: "Secteurs",
  type: "document",
  icon: ActivityIcon,
  fields: [
    defineField({
      name: "titre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      type: "datetime",
    }),
    defineField({
      name: "url",
      type: "slug",
      options: { source: "titre" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "string",
    }),
    defineField({
      name: "image",
      type: "image",
    }),
    defineField({
      name: "bloc",
      type: "array",
      of: [{ type: "block" }],
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
