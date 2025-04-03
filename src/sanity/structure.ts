import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Blog")
    .items([
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("auteur").title("Auteurs"),
      S.documentTypeListItem("article").title("Articles"),
      S.documentTypeListItem("service").title("Services"),
      S.documentTypeListItem("sousService").title("Sous Services"),
      S.documentTypeListItem("secteur").title("Secteurs"),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          ![
            "category",
            "auteur",
            "article",
            "service",
            "sousService",
            "secteur",
          ].includes(item.getId()!)
      ),
    ]);
