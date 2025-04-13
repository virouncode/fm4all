import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getTagSlugEn, getTagSlugFr } from "@/i18n/tagsSlugMappings";
import { capitalize } from "@/lib/capitalize";
import { generateAlternates } from "@/lib/metadata-helpers";
import {
  getTagNom,
  getTagRelatedArticles,
  getTagRelatedSecteurs,
  getTagRelatedServices,
} from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { getLocale } from "next-intl/server";
import ExpertiseCarousel from "../../services/[slug]/ExpertiseCarousel";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ tag: string }>;
}) => {
  const { tag } = await params;
  const locale = await getLocale();
  return generateAlternates(
    "tag",
    locale,
    locale === "fr"
      ? `Page des articles, services et secteurs associés au tag : ${capitalize(tag)}`
      : `Tag page for articles, services and sectors associated with: ${capitalize(tag)}`,
    locale === "fr"
      ? `Découvrez nos articles, services et secteurs associés au tag "${tag}"`
      : `Discover our articles, services and sectors associated with the tag "${tag}"`,
    "/img/logo_full_white.webp.png",
    {
      fr: locale === "fr" ? tag : getTagSlugFr(tag),
      en: locale === "en" ? tag : getTagSlugEn(tag),
    }
  );
};

const page = async ({
  params,
}: {
  params: Promise<{ tag: string; locale: "fr" | "en" }>;
}) => {
  const { tag, locale } = await params;
  const query = Promise.all([
    getTagRelatedServices(locale, tag),
    getTagRelatedArticles(locale, tag),
    getTagRelatedSecteurs(locale, tag),
  ]);
  const [services, articles, secteurs] = await query;
  const nom = (await getTagNom(tag)).nom;

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20 hyphens-auto">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="text-sm lg:text-base">
          <BreadcrumbLink className="flex items-center" href={`/`}>
            <HomeIcon size={14} />
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{nom}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      <section className="flex flex-row gap-10 mb-16">
        <div className="flex flex-col flex-1 justify-start gap-10">
          <h1 className="text-5xl">Tag &quot;{nom}&quot;</h1>
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
