import { type SchemaTypeDefinition } from "sanity";

import { articleType } from "./articleType";
import { authorType } from "./authorType";
import { blockContentType } from "./blockContentType";
import { secteurType } from "./secteurType";
import { serviceType } from "./serviceType";
import { categoryType } from "./categoryType";
import { postType } from "./postType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    articleType,
    serviceType,
    secteurType,
  ],
};
