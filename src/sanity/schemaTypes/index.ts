import { type SchemaTypeDefinition } from "sanity";

import { articleType } from "./articleType";
import { authorType } from "./authorType";
import { blockContentType } from "./blockContentType";
import { categoryType } from "./categoryType";
import { postType } from "./postType";
import { secteurType } from "./secteurType";
import { serviceType } from "./serviceType";
import { sousServiceType } from "./sousServiceType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    articleType,
    serviceType,
    sousServiceType,
    secteurType,
  ],
};
