import ArticlesCarousel from "@/components/carousel/ArticlesCarousel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import { LocaleType } from "@/i18n/routing";
import { generatePageMetadata } from "@/lib/metadata/metadata-helpers";
import { generateLocaleParams } from "@/lib/utils/staticParamsHelper";
import { getAllCategories } from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ArticlesCategorieCarousel from "./ArticlesCategorieCarousel";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return generatePageMetadata(
    "blog",
    locale,
    locale === "fr" ? "Articles" : "Posts",
    locale === "fr"
      ? "Blog : nos articles sur les services aux entreprises"
      : "Blog: Our posts on business services in Paris",
  );
};

export const generateStaticParams = () => {
  return generateLocaleParams();
};

const page = async ({
  params,
}: {
  params: Promise<{ locale: LocaleType }>;
}) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("BlogPage");
  const tArticles = await getTranslations("HomePage.articles");
  const categories = await getAllCategories(locale as LocaleType);

  return (
    <main className="mx-auto mb-24 min-h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
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
            <BreadcrumbPage>{t("articles")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <section className="mt-6 flex flex-col gap-20">
        <h1 className="text-4xl">
          {t("blog-nos-articles-sur-les-services-aux-entreprises")}
        </h1>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 border-l-2 px-4 text-3xl">
            {tArticles("nos-derniers-articles")}
          </h2>
          <ArticlesCarousel />
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="mb-4 border-l-2 px-4 text-3xl">
            {t("par-categorie")}
          </h2>
          <div className="flex flex-col gap-14">
            {categories.map((categorie) =>
              categorie.slug?.current ? (
                <div key={categorie._id} className="flex flex-col gap-10">
                  <Link
                    href={{
                      pathname: "/blog/[slug]",
                      params: { slug: categorie.slug?.current },
                    }}
                    className="text-lg underline hover:opacity-80"
                  >
                    {categorie.titre}
                  </Link>
                  <ArticlesCategorieCarousel categorie={categorie} />
                </div>
              ) : null,
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
