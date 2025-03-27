import { BookIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const articleType = defineType({
  name: "article",
  title: "Articles",
  type: "document",
  icon: BookIcon,
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
      name: "tltr",
      type: "string",
    }),
    defineField({
      name: "image_1",
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
      name: "notre_expertise",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "liens_services",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          name: "service",
          to: [{ type: "service" }],
        }),
      ],
    }),
    defineField({
      name: "liens_secteurs",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          name: "secteur",
          to: [{ type: "secteur" }],
        }),
      ],
    }),
    defineField({
      name: "liens_articles",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          name: "article",
          to: [{ type: "article" }],
        }),
      ],
    }),
    defineField({
      name: "block",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "image_2",
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
      name: "publishedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      type: "reference",
      to: { type: "author" },
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
