"use client";

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { assist } from "@sanity/assist";
import { documentInternationalization } from "@sanity/document-internationalization";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { structure } from "./src/sanity/structure";

// Import schema types directly
import { articleType } from "./src/sanity/schemaTypes/articleType";
import { authorType } from "./src/sanity/schemaTypes/authorType";
import { blockContentType } from "./src/sanity/schemaTypes/blockContentType";
import { categoryType } from "./src/sanity/schemaTypes/categoryType";
import { postType } from "./src/sanity/schemaTypes/postType";
import { secteurType } from "./src/sanity/schemaTypes/secteurType";
import { serviceType } from "./src/sanity/schemaTypes/serviceType";

const TRANSLATABLE_TYPES = ["article", "service", "secteur"];

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: [
      blockContentType,
      categoryType,
      postType,
      authorType,
      articleType,
      serviceType,
      secteurType,
    ],
  },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    documentInternationalization({
      supportedLanguages: [
        { id: "fr", title: "Français" },
        { id: "en", title: "English" },
      ],
      schemaTypes: TRANSLATABLE_TYPES,
    }),
    assist({
      translate: {
        document: {
          languageField: "language",
          documentTypes: TRANSLATABLE_TYPES,
        },
      },
    }),
  ],
});
