import Bloc from "@/components/blocs/Bloc";
import CTAContactButtons from "@/components/buttons/cta-contact-buttons";
import TltrCard from "@/components/cards/TltrCard";
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
import { generateAlternates } from "@/lib/metadata/metadata-helpers";
import { capitalize } from "@/lib/utils/capitalize";
import {
  getServicesSlugEn,
  getServicesSlugFr,
  getServicesSubSlugFr,
} from "@/redirects/servicesSlugMappings";
import { urlFor } from "@/sanity/lib/image";
import { fetchServiceVilleSlugs, getServiceVille } from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PortableTextBlock, PortableTextComponentProps } from "next-sanity";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Service } from "../../../../../../../sanity.types";
import FAQService from "../FAQService";

// Custom components for PortableText
type BlockComponentProps = PortableTextComponentProps<PortableTextBlock>;
type SanityImageValue = {
  asset?: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: {
    x?: number;
    y?: number;
    height?: number;
    width?: number;
  };
  crop?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  alt?: string;
  _type: "image";
  _key?: string;
};
const ptComponents = {
  types: {
    image: ({ value }: { value: SanityImageValue }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <div className="relative w-full h-[200px] md:h-[400px] my-6 mx-auto">
          <Image
            quality={100}
            src={urlFor(value).url()}
            alt={value.alt || "illustration du service et et de la ville"}
            fill
            className="object-contain m-0"
            unoptimized={true}
          />
        </div>
      );
    },
  },
  block: {
    essentiel: (props: BlockComponentProps) => {
      return (
        <p className="text-fm4allessential font-bold text-2xl mt-10">
          {props.children}
        </p>
      );
    },
    confort: (props: BlockComponentProps) => {
      return (
        <p className="text-fm4allcomfort font-bold text-2xl mt-10">
          {props.children}
        </p>
      );
    },
    excellence: (props: BlockComponentProps) => {
      return (
        <p className="text-fm4allexcellence font-bold text-2xl mt-10">
          {props.children}
        </p>
      );
    },
  },
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string; locale: string }>;
}): Promise<Metadata> => {
  const { slug, subSlug, locale } = await params;
  const service = await getServiceVille(slug, subSlug, locale as LocaleType);
  return generateAlternates(
    "serviceVille",
    locale,
    service.baliseTitle ?? "",
    service.baliseDescription ?? "",
    service.imagePrincipale ? urlFor(service.imagePrincipale).url() : undefined,
    {
      fr: {
        slug: locale === "fr" ? slug : getServicesSlugFr(slug),
        subSlug: locale === "fr" ? subSlug : getServicesSubSlugFr(subSlug),
      },
      en: {
        slug: locale === "en" ? slug : getServicesSlugEn(slug),
        subSlug: locale === "en" ? subSlug : getServicesSubSlugFr(subSlug),
      },
    }
  );
};

export const dynamic = "force-static";

export const generateStaticParams = async () => {
  // Récupérer tous les slugs de services depuis Sanity
  const slugsSubSlugsFr = await fetchServiceVilleSlugs();
  const slugsSubSlugsEn = await fetchServiceVilleSlugs("en");

  return [
    ...slugsSubSlugsFr.map((item) => ({
      locale: "fr",
      slug: item.slug,
      subSlug: item.subSlug,
    })),
    ...slugsSubSlugsEn.map((item) => ({
      locale: "en",
      slug: item.slug,
      subSlug: item.subSlug,
    })),
  ];
};

export default async function page({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string; locale: LocaleType }>;
}) {
  const { slug, subSlug, locale } = await params;
  setRequestLocale(locale);
  const tGlobal = await getTranslations({ locale, namespace: "Global" }); //car force-static
  const t = await getTranslations({ locale, namespace: "ServicesPage" });

  const service = await getServiceVille(slug, subSlug, locale as LocaleType);

  if (!service) {
    console.log("Service not found");
    notFound();
  }

  const serviceImageUrl = service.imagePrincipale
    ? urlFor(service.imagePrincipale)
    : null; //TODO placeholder image
  const serviceImageAlt = service.imagePrincipale?.alt
    ? service.imagePrincipale.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc1Url = service.imageBloc1
    ? urlFor(service.imageBloc1)
    : null;
  const serviceImageBloc1Alt = service.imageBloc1?.alt
    ? service.imageBloc1.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc2Url = service.imageBloc2
    ? urlFor(service.imageBloc2)
    : null;
  const serviceImageBloc2Alt = service.imageBloc2?.alt
    ? service.imageBloc2.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc3Url = service.imageBloc3
    ? urlFor(service.imageBloc3)
    : null;
  const serviceImageBloc3Alt = service.imageBloc3?.alt
    ? service.imageBloc3.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc4Url = service.imageBloc4
    ? urlFor(service.imageBloc4)
    : null;
  const serviceImageBloc4Alt = service.imageBloc4?.alt
    ? service.imageBloc4.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc5Url = service.imageBloc5
    ? urlFor(service.imageBloc5)
    : null;
  const serviceImageBloc5Alt = service.imageBloc5?.alt
    ? service.imageBloc5.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc6Url = service.imageBloc6
    ? urlFor(service.imageBloc6)
    : null;
  const serviceImageBloc6Alt = service.imageBloc6?.alt
    ? service.imageBloc6.alt
    : tGlobal("illustration-du-service");
  const serviceImageBloc7Url = service.imageBloc7
    ? urlFor(service.imageBloc7)
    : null;
  const serviceImageBloc7Alt = service.imageBloc7?.alt
    ? service.imageBloc7.alt
    : tGlobal("illustration-du-service");

  const serviceImageBloc8Url = service.imageBloc8
    ? urlFor(service.imageBloc8)
    : null;
  const serviceImageBloc8Alt = service.imageBloc8?.alt
    ? service.imageBloc8.alt
    : tGlobal("illustration-du-service");

  const serviceImageBloc9Url = service.imageBloc9
    ? urlFor(service.imageBloc9)
    : null;
  const serviceImageBloc9Alt = service.imageBloc9?.alt
    ? service.imageBloc9.alt
    : tGlobal("illustration-du-service");

  const serviceImageBloc10Url = service.imageBloc10
    ? urlFor(service.imageBloc10)
    : null;
  const serviceImageBloc10Alt = service.imageBloc10?.alt
    ? service.imageBloc10.alt
    : tGlobal("illustration-du-service");

  const serviceAssocie = service.service as Service;

  const serviceBlocs = [
    {
      id: 1,
      imageUrl: serviceImageBloc1Url,
      imageAlt: serviceImageBloc1Alt,
      bloc: service.bloc1,
      side: "left" as const,
    },
    {
      id: 2,
      imageUrl: serviceImageBloc2Url,
      imageAlt: serviceImageBloc2Alt,
      bloc: service.bloc2,
      side: "right" as const,
    },
    {
      id: 3,
      imageUrl: serviceImageBloc3Url,
      imageAlt: serviceImageBloc3Alt,
      bloc: service.bloc3,
      side: "left" as const,
    },
    {
      id: 4,
      imageUrl: serviceImageBloc4Url,
      imageAlt: serviceImageBloc4Alt,
      bloc: service.bloc4,
      side: "right" as const,
    },
    {
      id: 5,
      imageUrl: serviceImageBloc5Url,
      imageAlt: serviceImageBloc5Alt,
      bloc: service.bloc5,
      side: "left" as const,
    },
    {
      id: 6,
      imageUrl: serviceImageBloc6Url,
      imageAlt: serviceImageBloc6Alt,
      bloc: service.bloc6,
      side: "right" as const,
    },
    {
      id: 7,
      imageUrl: serviceImageBloc7Url,
      imageAlt: serviceImageBloc7Alt,
      bloc: service.bloc7,
      side: "left" as const,
    },
    {
      id: 8,
      imageUrl: serviceImageBloc8Url,
      imageAlt: serviceImageBloc8Alt,
      bloc: service.bloc8,
      side: "right" as const,
    },
    {
      id: 9,
      imageUrl: serviceImageBloc9Url,
      imageAlt: serviceImageBloc9Alt,
      bloc: service.bloc9,
      side: "left" as const,
    },
    {
      id: 10,
      imageUrl: serviceImageBloc10Url,
      imageAlt: serviceImageBloc10Alt,
      bloc: service.bloc10,
      side: "right" as const,
    },
  ];

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
              <Link
                href={`/services`}
                locale={locale}
                title={t("nos-services")}
              >
                {t("nos-services")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="flex items-center" asChild>
              <Link
                href={{ pathname: `/services/[slug]`, params: { slug: slug } }}
                locale={locale}
                title={serviceAssocie.titreCard}
              >
                {serviceAssocie.titreCard}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{capitalize(subSlug)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-4xl md:text-5xl mb-10 text-center">
        {service.titre}
      </h1>
      {service.description && service.tltr && serviceImageUrl && (
        <TltrCard
          description={service.description}
          tltr={service.tltr}
          devisButtonTitle={tGlobal("mon-devis-en-ligne")}
          imageUrl={serviceImageUrl.url()}
          imageAlt={serviceImageAlt}
        />
      )}
      {serviceBlocs
        .filter(
          (item) =>
            item.bloc && Array.isArray(item.bloc) && item.bloc.length > 0
        )
        .map(({ id, imageUrl, imageAlt, bloc, side }) => {
          if (!bloc) return null;
          return (
            <Bloc
              side={side}
              key={id}
              imageUrl={imageUrl?.url()}
              imageAlt={imageAlt}
              bloc={bloc}
              ptComponents={ptComponents}
            />
          );
        })}
      <CTAContactButtons />
      {service.faq && Array.isArray(service.faq) && service.faq.length > 0 && (
        <FAQService service={service} locale={locale} />
      )}
    </main>
  );
}
