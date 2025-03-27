import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Blog")
    .items([
      S.documentTypeListItem("post").title("Posts"),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("author").title("Authors"),
      S.documentTypeListItem("article").title("Articles"),
      S.documentTypeListItem("service").title("Services"),
      S.documentTypeListItem("sousService").title("Sous Services"),
      S.documentTypeListItem("secteur").title("Secteurs"),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          ![
            "post",
            "category",
            "author",
            "article",
            "service",
            "sousService",
            "secteur",
          ].includes(item.getId()!)
      ),
    ]);
