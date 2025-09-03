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
import {
  getSecteurSlugEn,
  getSecteurSlugFr,
} from "@/redirects/secteursSlugMappings";
import { urlFor } from "@/sanity/lib/image";
import { fetchSecteursSlugs, getSecteur } from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PortableTextBlock, PortableTextComponentProps } from "next-sanity";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-static";
export const dynamicParams = false;

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
            quality={100}
            src={urlFor(value).url()}
            alt={value.alt || "illustration du secteur"}
            fill
            className="m-0 object-contain"
            unoptimized={true}
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

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> => {
  const { slug, locale } = await params;
  const secteur = await getSecteur(slug);
  return generateAlternates(
    "secteurPresentation",
    locale,
    secteur.baliseTitle ?? "",
    secteur.baliseDescription ?? "",
    secteur.imagePrincipale ? urlFor(secteur.imagePrincipale).url() : undefined,
    {
      fr: locale === "fr" ? slug : getSecteurSlugFr(slug),
      en: locale === "en" ? slug : getSecteurSlugEn(slug),
    },
  );
};

export const generateStaticParams = async () => {
  // Récupérer tous les slugs de services depuis Sanity
  const slugsFr = await fetchSecteursSlugs();
  const slugsEn = await fetchSecteursSlugs("en");
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
  const tGlobal = await getTranslations({ locale, namespace: "Global" });
  const t = await getTranslations({ locale, namespace: "ServicesPage" });
  const tSecteurs = await getTranslations({
    locale,
    namespace: "SecteursPage",
  });

  const secteur = await getSecteur(slug);
  if (!secteur) {
    notFound();
  }

  const secteurImageUrl = secteur.imagePrincipale
    ? urlFor(secteur.imagePrincipale)
    : null; //TODO placeholder image
  const secteurImageAlt = secteur.imagePrincipale?.alt
    ? secteur.imagePrincipale.alt
    : tGlobal("illustration-du-secteur");
  const secteurImageBloc1Url = secteur.imageBloc1
    ? urlFor(secteur.imageBloc1)
    : null;
  const secteurImageBloc1Alt = secteur.imageBloc1?.alt
    ? secteur.imageBloc1.alt
    : tGlobal("illustration-du-secteur");
  const secteurImageBloc2Url = secteur.imageBloc2
    ? urlFor(secteur.imageBloc2)
    : null;
  const secteurImageBloc2Alt = secteur.imageBloc2?.alt
    ? secteur.imageBloc2.alt
    : tGlobal("illustration-du-secteur");
  const secteurImageBloc3Url = secteur.imageBloc3
    ? urlFor(secteur.imageBloc3)
    : null;
  const secteurImageBloc3Alt = secteur.imageBloc3?.alt
    ? secteur.imageBloc3.alt
    : tGlobal("illustration-du-secteur");
  const secteurImageBloc4Url = secteur.imageBloc4
    ? urlFor(secteur.imageBloc4)
    : null;
  const secteurImageBloc4Alt = secteur.imageBloc4?.alt
    ? secteur.imageBloc4.alt
    : tGlobal("illustration-du-secteur");
  const secteurImageBloc5Url = secteur.imageBloc5
    ? urlFor(secteur.imageBloc5)
    : null;
  const secteurImageBloc5Alt = secteur.imageBloc5?.alt
    ? secteur.imageBloc5.alt
    : tGlobal("illustration-du-secteur");
  const secteurImageBloc6Url = secteur.imageBloc6
    ? urlFor(secteur.imageBloc6)
    : null;
  const secteurImageBloc6Alt = secteur.imageBloc6?.alt
    ? secteur.imageBloc6.alt
    : tGlobal("illustration-du-secteur");
  const secteurImageBloc7Url = secteur.imageBloc7
    ? urlFor(secteur.imageBloc7)
    : null;
  const secteurImageBloc7Alt = secteur.imageBloc7?.alt
    ? secteur.imageBloc7.alt
    : tGlobal("illustration-du-secteur");

  const secteurImageBloc8Url = secteur.imageBloc8
    ? urlFor(secteur.imageBloc8)
    : null;
  const secteurImageBloc8Alt = secteur.imageBloc8?.alt
    ? secteur.imageBloc8.alt
    : tGlobal("illustration-du-secteur");

  const secteurImageBloc9Url = secteur.imageBloc9
    ? urlFor(secteur.imageBloc9)
    : null;
  const secteurImageBloc9Alt = secteur.imageBloc9?.alt
    ? secteur.imageBloc9.alt
    : tGlobal("illustration-du-secteur");

  const secteurImageBloc10Url = secteur.imageBloc10
    ? urlFor(secteur.imageBloc10)
    : null;
  const secteurImageBloc10Alt = secteur.imageBloc10?.alt
    ? secteur.imageBloc10.alt
    : tGlobal("illustration-du-secteur");

  const secteurBlocs = [
    {
      id: 1,
      imageUrl: secteurImageBloc1Url,
      imageAlt: secteurImageBloc1Alt,
      bloc: secteur.bloc1,
      side: "left" as const,
    },
    {
      id: 2,
      imageUrl: secteurImageBloc2Url,
      imageAlt: secteurImageBloc2Alt,
      bloc: secteur.bloc2,
      side: "right" as const,
    },
    {
      id: 3,
      imageUrl: secteurImageBloc3Url,
      imageAlt: secteurImageBloc3Alt,
      bloc: secteur.bloc3,
      side: "left" as const,
    },
    {
      id: 4,
      imageUrl: secteurImageBloc4Url,
      imageAlt: secteurImageBloc4Alt,
      bloc: secteur.bloc4,
      side: "right" as const,
    },
    {
      id: 5,
      imageUrl: secteurImageBloc5Url,
      imageAlt: secteurImageBloc5Alt,
      bloc: secteur.bloc5,
      side: "left" as const,
    },
    {
      id: 6,
      imageUrl: secteurImageBloc6Url,
      imageAlt: secteurImageBloc6Alt,
      bloc: secteur.bloc6,
      side: "right" as const,
    },
    {
      id: 7,
      imageUrl: secteurImageBloc7Url,
      imageAlt: secteurImageBloc7Alt,
      bloc: secteur.bloc7,
      side: "left" as const,
    },
    {
      id: 8,
      imageUrl: secteurImageBloc8Url,
      imageAlt: secteurImageBloc8Alt,
      bloc: secteur.bloc8,
      side: "right" as const,
    },
    {
      id: 9,
      imageUrl: secteurImageBloc9Url,
      imageAlt: secteurImageBloc9Alt,
      bloc: secteur.bloc9,
      side: "left" as const,
    },
    {
      id: 10,
      imageUrl: secteurImageBloc10Url,
      imageAlt: secteurImageBloc10Alt,
      bloc: secteur.bloc10,
      side: "right" as const,
    },
  ];

  return (
    <main className="mx-auto mb-24 max-w-7xl px-6 py-4 hyphens-auto md:px-20">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="flex flex-wrap text-sm lg:text-base">
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
                href={`/secteurs`}
                locale={locale}
                title={tSecteurs("nos-secteurs-dintervention")}
              >
                {tSecteurs("nos-secteurs-dintervention")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{secteur.titre}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {secteur.titre &&
        secteur.description &&
        secteur.tltr &&
        secteurImageUrl && (
          <TltrCard
            description={secteur.description}
            tltr={secteur.tltr}
            devisButtonTitle={tGlobal("mon-devis-en-ligne")}
            imageUrl={secteurImageUrl.url()}
            imageAlt={secteurImageAlt}
            titre={secteur.titre}
          />
        )}
      {secteurBlocs
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
    </main>
  );
};

export default page;
