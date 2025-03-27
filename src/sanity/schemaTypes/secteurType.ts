import { ActivityIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const secteurType = defineType({
  title: "Secteurs",
  name: "secteur",
  type: "document",
  icon: ActivityIcon,
  fields: [
    defineField({
      title: "Date",
      name: "date",
      type: "datetime",
    }),
    defineField({
      title: "Slug",
      name: "slug",
      type: "slug",
      options: { source: "titre" },
      validation: (rule) => rule.required(),
    }),
    //H1
    defineField({
      title: "Titre",
      name: "titre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    //<title>
    defineField({
      title: "Balise titre",
      name: "baliseTitle",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    //Description
    defineField({
      title: "Description",
      name: "description",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    //<description>
    defineField({
      title: "Balise description",
      name: "baliseDescription",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    //too long to read
    defineField({
      title: "Too long to read",
      name: "tltr",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Essentiel", value: "essentiel" },
            { title: "Confort", value: "confort" },
            { title: "Excellence", value: "excellence" },
          ],
        },
      ],
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

    //Corps de l'article
    defineField({
      title: "Image bloc 1",
      name: "imageBloc1",
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
      title: "Bloc 1",
      name: "bloc1",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Essentiel", value: "essentiel" },
            { title: "Confort", value: "confort" },
            { title: "Excellence", value: "excellence" },
          ],
        },
        {
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
        },
      ],
    }),
    defineField({
      title: "Image bloc 2",
      name: "imageBloc2",
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
      title: "Bloc 2",
      name: "bloc2",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Essentiel", value: "essentiel" },
            { title: "Confort", value: "confort" },
            { title: "Excellence", value: "excellence" },
          ],
        },
        {
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
        },
      ],
    }),
    defineField({
      title: "Image bloc 3",
      name: "imageBloc3",
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
      title: "Bloc 3",
      name: "bloc3",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Essentiel", value: "essentiel" },
            { title: "Confort", value: "confort" },
            { title: "Excellence", value: "excellence" },
          ],
        },
        {
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
        },
      ],
    }),
    defineField({
      title: "Image bloc 4",
      name: "imageBloc4",
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
      title: "Bloc 4",
      name: "bloc4",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Essentiel", value: "essentiel" },
            { title: "Confort", value: "confort" },
            { title: "Excellence", value: "excellence" },
          ],
        },
        {
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
        },
      ],
    }),
    defineField({
      title: "Image bloc 5",
      name: "imageBloc5",
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
      title: "Bloc 5",
      name: "bloc5",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Essentiel", value: "essentiel" },
            { title: "Confort", value: "confort" },
            { title: "Excellence", value: "excellence" },
          ],
        },
        {
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
        },
      ],
    }),
    defineField({
      title: "Image bloc 6",
      name: "imageBloc6",
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
      title: "Bloc 6",
      name: "bloc6",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Essentiel", value: "essentiel" },
            { title: "Confort", value: "confort" },
            { title: "Excellence", value: "excellence" },
          ],
        },
        {
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
        },
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
    }),
  ],
});
