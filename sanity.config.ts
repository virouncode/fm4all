"use client";

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { assist } from "@sanity/assist";
import { documentInternationalization } from "@sanity/document-internationalization";
import { visionTool } from "@sanity/vision";
import { Config } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { structure } from "./src/sanity/structure";

// Import schema types directly with relative paths
import { articleCategoryType } from "./src/sanity/schemaTypes/articleCategoryType";
import { articleType } from "./src/sanity/schemaTypes/articleType";
import { auteurType } from "./src/sanity/schemaTypes/auteurType";
import { secteurType } from "./src/sanity/schemaTypes/secteurType";
import { serviceType } from "./src/sanity/schemaTypes/serviceType";
import { sousServiceType } from "./src/sanity/schemaTypes/sousServiceType";
import { tagType } from "./src/sanity/schemaTypes/tagType";

const TRANSLATABLE_TYPES = ["article", "service", "sousService", "secteur"];

// Create configuration object
const config = {
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: [
      tagType,
      articleCategoryType,
      auteurType,
      articleType,
      serviceType,
      sousServiceType,
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
};

// Use type assertion to bypass type checking
export default config as Config;
