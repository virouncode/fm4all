import { type SchemaTypeDefinition } from "sanity";

import { articleCategoryType } from "./articleCategoryType";
import { articleType } from "./articleType";
import { auteurType } from "./auteurType";
import { secteurType } from "./secteurType";
import { serviceType } from "./serviceType";
import { tagType } from "./tagType";
import { serviceVilleType } from "./serviceVilleType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    articleCategoryType,
    tagType,
    auteurType,
    articleType,
    serviceType,
    serviceVilleType,
    secteurType,
  ],
};
