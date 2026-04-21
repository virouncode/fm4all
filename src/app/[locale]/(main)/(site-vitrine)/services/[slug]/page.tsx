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
import { generatePageMetadata } from "@/lib/metadata/metadata-helpers";
import {
  extractFaqItemsFromPortableText,
  FaqJsonLd,
  portableTextBlocksToPlainText,
} from "@/lib/seo/faq-jsonld";
import {
  getServicesSlugEn,
  getServicesSlugFr,
} from "@/redirects/servicesSlugMappings";
import { urlFor } from "@/sanity/lib/image";
import { fetchServiceSlugs, getService } from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PortableTextBlock, PortableTextComponentProps } from "next-sanity";
import Image from "next/image";
import { notFound } from "next/navigation";
import FAQService from "./FAQService";

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
        <div className="relative mx-auto my-6 mb-20 h-[200px] w-full md:h-[400px]">
          <Image
            src={urlFor(value).url()}
            alt={value.alt || "illustration du service"}
            fill
            className="m-0 object-contain"
            sizes="(min-width:768px) 100vw, 100vw"
          />
        </div>
      );
    },
  },
  block: {
    essentiel: (props: BlockComponentProps) => {
      return (
        <p className="text-fm4allessential mt-10 text-2xl font-bold">
          {props.children}
        </p>
      );
    },
    confort: (props: BlockComponentProps) => {
      return (
        <p className="text-fm4allcomfort mt-10 text-2xl font-bold">
          {props.children}
        </p>
      );
    },
    excellence: (props: BlockComponentProps) => {
      return (
        <p className="text-fm4allexcellence mt-10 text-2xl font-bold">
          {props.children}
        </p>
      );
    },
  },
};

export const generateStaticParams = async () => {
  // Récupérer tous les slugs de services depuis Sanity
  const slugsFr = await fetchServiceSlugs();
  const slugsEn = await fetchServiceSlugs("en");

  return [
    ...slugsFr.map((slug) => ({ slug, locale: "fr" })),
    ...slugsEn.map((slug) => ({ slug, locale: "en" })),
  ];
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: LocaleType }>;
}): Promise<Metadata> => {
  const { slug, locale } = await params;
  const service = await getService(slug);
  return generatePageMetadata(
    "servicePresentation",
    locale,
    service?.baliseTitle ?? "",
    service?.baliseDescription ?? "",
    service?.imagePrincipale
      ? urlFor(service.imagePrincipale).url()
      : undefined,
    {
      fr: locale === "fr" ? slug : getServicesSlugFr(slug),
      en: locale === "en" ? slug : getServicesSlugEn(slug),
    },
  );
};

export default async function page({
  params,
}: {
  params: Promise<{ slug: string; locale: LocaleType }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const tGlobal = await getTranslations({ locale, namespace: "Global" });
  const t = await getTranslations({ locale, namespace: "ServicesPage" });

  const service = await getService(slug);

  if (!service) {
    notFound();
  }

  const faqJsonLdItems =
    service.faq && Array.isArray(service.faq) && service.faq.length > 0
      ? extractFaqItemsFromPortableText(service.faq).map((item) => ({
          question: item.question,
          answer: portableTextBlocksToPlainText(item.answerBlocks),
        }))
      : [];

  const serviceImageUrl = service.imagePrincipale
    ? urlFor(service.imagePrincipale)
    : null; //TODO placeholder image
  const serviceImageAlt = service.imagePrincipale?.alt
    ? service.imagePrincipale.alt
    : tGlobal("illustration-du-service");
  const serviceBlocs = [
    { image: service.imageBloc1, bloc: service.bloc1 },
    { image: service.imageBloc2, bloc: service.bloc2 },
    { image: service.imageBloc3, bloc: service.bloc3 },
    { image: service.imageBloc4, bloc: service.bloc4 },
    { image: service.imageBloc5, bloc: service.bloc5 },
    { image: service.imageBloc6, bloc: service.bloc6 },
    { image: service.imageBloc7, bloc: service.bloc7 },
    { image: service.imageBloc8, bloc: service.bloc8 },
    { image: service.imageBloc9, bloc: service.bloc9 },
    { image: service.imageBloc10, bloc: service.bloc10 },
  ].map(({ image, bloc }, index) => ({
    id: index + 1,
    imageUrl: image ? urlFor(image) : null,
    imageAlt: image?.alt ?? tGlobal("illustration-du-service"),
    bloc,
    side: (index % 2 === 0 ? "left" : "right") as "left" | "right",
  }));

  return (
    <main className="mx-auto mb-24 max-w-7xl px-6 py-4 hyphens-auto md:px-20">
      <FaqJsonLd items={faqJsonLdItems} />
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="flex flex-wrap text-sm lg:text-base">
          <BreadcrumbItem>
            <BreadcrumbLink className="flex items-center" asChild>
              <Link href={`/`} title={t("accueil")}>
                <HomeIcon size={14} />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="flex items-center" asChild>
              <Link href={`/services`} title={t("nos-services")}>
                {t("nos-services")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{service.titreCard}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {service.titre &&
        service.description &&
        service.tltr &&
        serviceImageUrl && (
          <TltrCard
            description={service.description}
            tltr={service.tltr}
            devisButtonTitle={tGlobal("mon-devis-en-ligne")}
            imageUrl={serviceImageUrl.url()}
            imageAlt={serviceImageAlt}
            titre={service.titre}
          />
        )}
      {serviceBlocs
        .filter(
          (item) =>
            item.bloc && Array.isArray(item.bloc) && item.bloc.length > 0,
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
        <FAQService service={service} />
      )}
    </main>
  );
}
