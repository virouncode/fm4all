import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LocaleType } from "@/i18n/routing";
import { getTagSlugEn, getTagSlugFr } from "@/i18n/tagsSlugMappings";
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { capitalize } from "@/lib/utils/capitalize";
import {
  fetchTagsSlugs,
  getTagNom,
  getTagRelatedArticles,
  getTagRelatedSecteurs,
  getTagRelatedServices,
} from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import ExpertiseCarousel from "../../services/[slug]/ExpertiseCarousel";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) => {
  const { slug, locale } = await params;
  return generateAlternates(
    "tag",
    locale,
    locale === "fr"
      ? `Page des articles, services et secteurs associés au tag : ${capitalize(slug)}`
      : `Tag page for articles, services and sectors associated with: ${capitalize(slug)}`,
    locale === "fr"
      ? `Découvrez nos articles, services et secteurs associés au tag "${slug}"`
      : `Discover our articles, services and sectors associated with the tag "${slug}"`,
    undefined,
    {
      fr: locale === "fr" ? slug : getTagSlugFr(slug),
      en: locale === "en" ? slug : getTagSlugEn(slug),
    }
  );
};

export const dynamic = "force-static";

export const generateStaticParams = async () => {
  // Récupérer tous les slugs de services depuis Sanity
  const slugsFr = await fetchTagsSlugs();
  const slugsEn = await fetchTagsSlugs("en");

  return [
    ...slugsFr.map((slug) => ({ slug, locale: "fr" })),
    ...slugsEn.map((slug) => ({ slug, locale: "en" })),
  ];
};

const page = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: LocaleType }>;
}) => {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const query = Promise.all([
    getTagRelatedServices(locale, slug),
    getTagRelatedArticles(locale, slug),
    getTagRelatedSecteurs(locale, slug),
  ]);
  const [services, articles, secteurs] = await query;
  const tag = await getTagNom(slug);

  if (!tag) {
    notFound();
  }

  const nom = tag.nom;

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20 hyphens-auto">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="text-sm lg:text-base flex flex-wrap">
          <BreadcrumbLink className="flex items-center" href={`/`}>
            <HomeIcon size={14} />
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{nom}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-4xl mb-10">Tag &quot;{nom}&quot;</h1>
      <section className="flex flex-row gap-10 mb-16">
        <div className="flex flex-col flex-1 justify-start gap-10 w-full">
          <ExpertiseCarousel
            services={services}
            articles={articles}
            secteurs={secteurs}
          />
        </div>
      </section>
    </main>
  );
};

export default page;
