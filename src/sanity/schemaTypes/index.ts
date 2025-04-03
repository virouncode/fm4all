import { type SchemaTypeDefinition } from "sanity";

import { articleType } from "./articleType";
import { auteurType } from "./auteurType";
import { categoryType } from "./categoryType";
import { secteurType } from "./secteurType";
import { serviceType } from "./serviceType";
import { sousServiceType } from "./sousServiceType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    categoryType,
    auteurType,
    articleType,
    serviceType,
    sousServiceType,
    secteurType,
  ],
};
