import { OkHandIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const serviceType = defineType({
  title: "Services",
  name: "service",
  type: "document",
  icon: OkHandIcon,
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
    //Notre expertise
    defineField({
      title: "Services associés",
      name: "servicesAssocies",
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
      title: "Sous Services associés",
      name: "sousServicesAssocies",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          name: "sousService",
          to: [{ type: "sousService" }],
        }),
      ],
    }),
    defineField({
      title: "Secteurs associés",
      name: "secteursAssocies",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          name: "secteur",
          to: [{ type: "secteur" }],
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
