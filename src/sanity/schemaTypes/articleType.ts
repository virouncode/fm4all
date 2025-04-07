import { BookIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const articleType = defineType({
  title: "Articles",
  name: "article",
  type: "document",
  icon: BookIcon,
  fields: [
    defineField({
      title: "Date",
      name: "date",
      type: "datetime",
    }),
    defineField({
      title: "Categorie",
      name: "categorie",
      type: "reference",
      to: { type: "articleCategory" },
      validation: (rule) => rule.required(),
    }),
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
    defineField({
      title: "SubSlug",
      name: "subSlug",
      type: "slug",
      options: { source: "titre" },
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
      validation: (rule) => rule.required(),
    }),
    //Tags
    defineField({
      title: "Tags entrants",
      name: "tagsEntrants",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          name: "tag",
          to: [{ type: "tag" }],
        }),
      ],
    }),
    defineField({
      title: "Tags sortants",
      name: "tagsSortants",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          name: "tag",
          to: [{ type: "tag" }],
        }),
      ],
    }),
    // //Notre expertise
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
    defineField({
      title: "Articles associés",
      name: "articlesAssocies",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          name: "article",
          to: [{ type: "article" }],
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
      title: "Image bloc 7",
      name: "imageBloc7",
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
      title: "Bloc 7",
      name: "bloc7",
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
      title: "Image bloc 8",
      name: "imageBloc8",
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
      title: "Bloc 8",
      name: "bloc8",
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
      title: "Image bloc 9",
      name: "imageBloc9",
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
      title: "Bloc 9",
      name: "bloc9",
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
      title: "Image bloc 10",
      name: "imageBloc10",
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
      title: "Bloc 10",
      name: "bloc10",
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
      title: "Auteur",
      name: "auteur",
      type: "reference",
      to: { type: "auteur" },
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
    }),
  ],
  preview: {
    select: {
      title: "titre",
      media: "imagePrincipale",
    },
  },
});
