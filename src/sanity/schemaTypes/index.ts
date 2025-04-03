import { type SchemaTypeDefinition } from "sanity";

import { articleType } from "./articleType";
import { auteurType } from "./auteurType";
import { secteurType } from "./secteurType";
import { serviceType } from "./serviceType";
import { sousServiceType } from "./sousServiceType";
import { articleCategoryType } from "./articleCategoryType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    articleCategoryType,
    auteurType,
    articleType,
    serviceType,
    sousServiceType,
    secteurType,
  ],
};
