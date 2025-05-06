import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  getArticlesSlugEn,
  getArticlesSlugFr,
} from "@/i18n/articlesSlugMappings";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { urlFor } from "@/sanity/lib/image";
import { getCategorie } from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import ArticlesCards from "./ArticlesCards";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const locale = await getLocale();
  const { slug } = await params;
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

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const tGlobal = await getTranslations("Global");
  const { slug } = await params;
  const categorie = await getCategorie(slug);

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20 hyphens-auto">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="text-sm lg:text-base">
          <BreadcrumbLink className="flex items-center" href={`/`}>
            <HomeIcon size={14} />
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href={"/blog"} className="flex items-center">
            {tGlobal("articles")}
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{categorie.titre}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-4xl mb-10">
        {tGlobal("nos-articles-sur-and-quot")}
        &quot;{categorie.titre}&quot;
      </h1>
      <ArticlesCards categorie={categorie} />
    </main>
  );
};

export default page;
