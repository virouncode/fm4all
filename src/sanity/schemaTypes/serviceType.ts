import { OkHandIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const serviceType = defineType({
  name: "service",
  title: "Services",
  type: "document",
  icon: OkHandIcon,
  fields: [
    defineField({
      name: "titre",
      type: "string",
      validation: (rule) => rule.required(),
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
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Text alternatif",
        }),
      ],
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
