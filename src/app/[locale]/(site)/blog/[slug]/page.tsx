import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  getArticlesSlugEn,
  getArticlesSlugFr,
} from "@/i18n/articlesSlugMappings";
import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { urlFor } from "@/sanity/lib/image";
import {
  fetchArticleCategories,
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
  const { slug, locale } = await params;
  const categorie = await getCategorie(slug);

  return generateAlternates(
    "blogCategorie",
    locale,
    categorie.baliseTitle ?? "",
    categorie.baliseDescription ?? "",
    categorie.imagePrincipale
      ? urlFor(categorie.imagePrincipale).url()
      : undefined,
    {
      fr: locale === "fr" ? slug : getArticlesSlugFr(slug),
      en: locale === "en" ? slug : getArticlesSlugEn(slug),
    }
  );
};

export const dynamic = "force-static";

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
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("BlogPage");
  const tGlobal = await getTranslations({ locale, namespace: "Global" });
  const categorie = await getCategorie(slug);
  const articles = await getArticlesOfCategorie(
    locale as LocaleType,
    categorie.slug?.current ?? ""
  );

  if (!categorie) {
    console.log("Categorie non trouvée");
    notFound();
  }

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20 hyphens-auto">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="text-sm lg:text-base flex flex-wrap">
          <BreadcrumbItem>
            <BreadcrumbLink
              className="flex items-center"
              href={`/`}
              title={t("accueil")}
            >
              <HomeIcon size={14} />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="flex items-center" asChild>
              <Link href={"/blog"} locale={locale}>
                {tGlobal("articles")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{categorie.titre}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-4xl mb-10">
        {tGlobal("nos-articles-sur-and-quot")}
        &quot;{categorie.titre}&quot;
      </h1>
      <ArticlesCards
        categorie={categorie}
        articles={articles}
        locale={locale as LocaleType}
      />
    </main>
  );
};

export default page;
