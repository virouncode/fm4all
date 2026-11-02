import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AlternateSlugs } from "@/context/AlternateSlugsContext";
import { Link, permanentRedirect } from "@/i18n/navigation";
import { localeParams, LocaleType } from "@/i18n/routing";
import { categorieSlugsParLocale } from "@/lib/i18n/articleAlternates";
import { generatePageMetadata } from "@/lib/metadata/metadata-helpers";
import { urlFor } from "@/sanity/lib/image";
import {
  fetchArticleCategories,
  findCategorieJumelle,
  getArticlesOfCategorie,
  getCategorie,
} from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import ArticlesCards from "./ArticlesCards";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> => {
  const { slug, locale } = await localeParams(params);
  const categorie = await getCategorie(slug, locale);

  return generatePageMetadata(
    "blogCategorie",
    locale,
    categorie?.baliseTitle ?? "",
    categorie?.baliseDescription ?? "",
    categorie?.imagePrincipale
      ? urlFor(categorie.imagePrincipale).url()
      : undefined,
    categorieSlugsParLocale(locale, slug, categorie?.jumelle),
  );
};

export const generateStaticParams = async () => {
  // Récupérer tous les slugs de services depuis Sanity
  const slugsFr = await fetchArticleCategories();
  const slugsEn = await fetchArticleCategories("en");

  return [
    ...slugsFr.map((slug) => ({ slug, locale: "fr" })),
    ...slugsEn.map((slug) => ({ slug, locale: "en" })),
  ];
};

const page = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) => {
  const { slug, locale } = await localeParams(params);
  setRequestLocale(locale);
  const t = await getTranslations("BlogPage");
  const tGlobal = await getTranslations({ locale, namespace: "Global" });
  const categorie = await getCategorie(slug, locale);
  if (!categorie) {
    // Slug de l'autre langue sous cette locale : vers la catégorie jumelle.
    const jumelle = await findCategorieJumelle(slug, locale);
    if (jumelle) {
      permanentRedirect({
        href: { pathname: "/blog/[slug]", params: { slug: jumelle } },
        locale,
      });
    }
    notFound();
  }
  const articles = await getArticlesOfCategorie(
    locale as LocaleType,
    categorie.slug?.current ?? "",
  );
  const alternates = categorieSlugsParLocale(locale, slug, categorie.jumelle);

  return (
    <main className="mx-auto mb-24 max-w-7xl px-6 py-4 hyphens-auto md:px-20">
      <AlternateSlugs
        value={{
          fr: { slug: alternates.fr },
          en: { slug: alternates.en },
        }}
      />
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="flex flex-wrap text-sm lg:text-base">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                className="flex items-center"
                href={`/`}
                title={t("accueil")}
              >
                <HomeIcon size={14} />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="flex items-center" asChild>
              <Link href={"/blog"}>{tGlobal("articles")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{categorie.titre}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="mb-10 text-4xl">
        {tGlobal("nos-articles-sur-and-quot")}
        &quot;{categorie.titre}&quot;
      </h1>
      <ArticlesCards categorie={categorie} articles={articles} />
    </main>
  );
};

export default page;
