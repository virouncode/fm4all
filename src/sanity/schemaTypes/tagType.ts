import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const tagType = defineType({
  title: "Tag",
  name: "tag",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      title: "Nom du tag",
      name: "nom",
      type: "string",
      validation: (rule) => rule.required(),
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
