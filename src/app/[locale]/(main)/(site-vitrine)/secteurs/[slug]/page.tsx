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
            alt={value.alt || "illustration du secteur"}
            fill
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

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: LocaleType }>;
}): Promise<Metadata> => {
  const { slug, locale } = await params;
  const secteur = await getSecteur(slug);
  return generateAlternates(
    "secteurPresentation",
    locale,
    secteur?.baliseTitle ?? "",
    secteur?.baliseDescription ?? "",
    secteur?.imagePrincipale
      ? urlFor(secteur.imagePrincipale).url()
      : undefined,
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
  const secteurBlocs = [
    { image: secteur.imageBloc1, bloc: secteur.bloc1 },
    { image: secteur.imageBloc2, bloc: secteur.bloc2 },
    { image: secteur.imageBloc3, bloc: secteur.bloc3 },
    { image: secteur.imageBloc4, bloc: secteur.bloc4 },
    { image: secteur.imageBloc5, bloc: secteur.bloc5 },
    { image: secteur.imageBloc6, bloc: secteur.bloc6 },
    { image: secteur.imageBloc7, bloc: secteur.bloc7 },
    { image: secteur.imageBloc8, bloc: secteur.bloc8 },
    { image: secteur.imageBloc9, bloc: secteur.bloc9 },
    { image: secteur.imageBloc10, bloc: secteur.bloc10 },
  ].map(({ image, bloc }, index) => ({
    id: index + 1,
    imageUrl: image ? urlFor(image) : null,
    imageAlt: image?.alt ?? tGlobal("illustration-du-secteur"),
    bloc,
    side: (index % 2 === 0 ? "left" : "right") as "left" | "right",
  }));

  return (
    <main className="mx-auto mb-24 max-w-7xl px-6 py-4 hyphens-auto md:px-20">
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
              <Link
                href={`/secteurs`}
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
