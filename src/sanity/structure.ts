import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Blog")
    .items([
      S.documentTypeListItem("tag").title("Tags"),
      S.documentTypeListItem("articleCategory").title("Categories Articles"),
      S.documentTypeListItem("auteur").title("Auteurs"),
      S.documentTypeListItem("article").title("Articles"),
      S.documentTypeListItem("service").title("Services"),
      S.documentTypeListItem("serviceVille").title("Services Ville"),
      S.documentTypeListItem("secteur").title("Secteurs"),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          ![
            "tag",
            "articleCategory",
            "auteur",
            "article",
            "service",
            "serviceVille",
            "secteur",
          ].includes(item.getId()!),
      ),
    ]);
