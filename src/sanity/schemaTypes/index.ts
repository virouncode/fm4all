import { type SchemaTypeDefinition } from "sanity";

import { articleCategoryType } from "./articleCategoryType";
import { articleType } from "./articleType";
import { auteurType } from "./auteurType";
import { secteurType } from "./secteurType";
import { serviceType } from "./serviceType";
import { sousServiceType } from "./sousServiceType";
import { tagType } from "./tagType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    articleCategoryType,
    tagType,
    auteurType,
    articleType,
    serviceType,
    sousServiceType,
    secteurType,
  ],
};
