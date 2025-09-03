import { UserIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const auteurType = defineType({
  title: "Auteur",
  name: "auteur",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      title: "Prenom",
      name: "prenom",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: "Nom",
      name: "nom",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "name",
      },
    }),
    defineField({
      title: "Image",
      name: "image",
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
      name: "bio",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "prenom",
      media: "image",
    },
  },
});
