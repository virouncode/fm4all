import CTAContactButtons from "@/components/cta-contact-buttons";
import DevisButton from "@/components/devis-button";
import TagButton from "@/components/TagButton";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  getSecteurSlugEn,
  getSecteurSlugFr,
} from "@/i18n/secteursSlugMappings";
import { generateAlternates } from "@/lib/metadata-helpers";
import { urlFor } from "@/sanity/lib/image";
import { getAssociatedToSecteur, getSecteur } from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import {
  PortableText,
  PortableTextBlock,
  PortableTextComponentProps,
} from "next-sanity";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Slug } from "../../../../../../sanity.types";
import ExpertiseCarousel from "../../services/[slug]/ExpertiseCarousel";

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
        <div className="relative w-full  h-[200px] md:h-[400px] my-6 mx-auto">
          <Image
            quality={100}
            src={urlFor(value).url()}
            alt={value.alt || "illustration du secteur"}
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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const locale = await getLocale();
  const { slug } = await params;
  const secteur = await getSecteur(slug);
  return generateAlternates(
    "secteurPresentation",
    locale,
    secteur.baliseTitle ?? "",
    secteur.baliseDescription ?? "",
    secteur.imagePrincipale
      ? urlFor(secteur.imagePrincipale).url()
      : "/img/logo_full_white.webp.png",
    {
      fr: locale === "fr" ? slug : getSecteurSlugFr(slug),
      en: locale === "en" ? slug : getSecteurSlugEn(slug),
    }
  );
};

const page = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: "fr" | "en" }>;
}) => {
  const tGlobal = await getTranslations("Global");
  const t = await getTranslations("ServicesPage");
  // const options = { next: { revalidate: 30 } };
  const { slug, locale } = await params;
  const secteur = await getSecteur(slug);
  if (!secteur) {
    notFound();
  }
  const tagsSortants = secteur.tagsSortants as {
    _id: string;
    nom: string;
    slug: Slug;
  }[];

  const associated = await getAssociatedToSecteur(
    locale,
    tagsSortants.map((tag) => tag._id),
    secteur._id
  );

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

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20 hyphens-auto">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="text-sm lg:text-base">
          <BreadcrumbLink className="flex items-center" href={`/`}>
            <HomeIcon size={14} />
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href={`/secteurs`} className="flex items-center">
            Nos secteurs d&apos;activité
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{secteur.titre}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      <section className="flex flex-row gap-10 mb-16">
        <div className="flex flex-col flex-1 justify-start text-lg gap-8">
          <h1 className="text-5xl">{secteur.titre}</h1>
          <div className="flex flex-row gap-2 flex-wrap">
            {tagsSortants.map((tag) => (
              <TagButton tag={tag} key={tag._id} />
            ))}
          </div>
          <div
            className="flex flex-col gap-4 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-p:text-pretty prose-p:hyphens-auto prose-p:m-0
          prose-li:list-check prose-li:m-0
          prose-a:underline"
          >
            <p className="font-bold">{secteur.description}</p>
            {Array.isArray(secteur.tltr) && (
              <PortableText value={secteur.tltr} />
            )}
          </div>
          <div className="flex justify-center">
            <DevisButton
              title={tGlobal("mon-devis-en-ligne")}
              text={tGlobal("mon-devis-en-ligne")}
              size="lg"
            />
          </div>
        </div>
        {secteurImageUrl ? (
          <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
            <Image
              src={secteurImageUrl.url()}
              alt={secteurImageAlt}
              quality={100}
              className="object-cover object-center"
              fill={true}
              unoptimized={true}
            />
          </div>
        ) : null}
      </section>
      {(associated.articles || associated.services || associated.secteurs) && (
        <section className="flex flex-row gap-10 mb-16">
          <div className="w-full">
            <h2 className="border-l-2 px-4 text-4xl mb-10">
              {t("notre-expertise")}
            </h2>
            <ExpertiseCarousel
              services={associated.services}
              // sousServices={service.sousServicesAssocies}
              secteurs={associated.secteurs}
              articles={associated.articles}
            />
          </div>
        </section>
      )}
      <section className="flex flex-row gap-10 mb-16">
        {secteurImageBloc1Url ? (
          <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
            <Image
              src={secteurImageBloc1Url.url()}
              alt={secteurImageBloc1Alt}
              quality={100}
              className="object-cover object-center"
              fill={true}
              unoptimized={true}
            />
          </div>
        ) : null}
        <div
          className="flex-1 prose-lg 
        prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
        prose-h3:font-bold prose-h3:text-xl
        prose-h4:text-center prose-h4:mx-auto prose-h4:my-8
        prose-p:text-pretty prose-p:hyphens-auto
        prose-li:list-check prose-li:m-0
        prose-a:underline
        "
        >
          {Array.isArray(secteur.bloc1) && (
            <PortableText value={secteur.bloc1} components={ptComponents} />
          )}
        </div>
      </section>
      <section className="flex flex-row gap-10 mb-16">
        <div
          className="flex-1 prose-lg 
        prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
        prose-h3:font-bold prose-h3:text-xl
        prose-p:text-pretty prose-p:hyphens-auto
        prose-li:list-check prose-li:m-0
        prose-a:underline
        "
        >
          {Array.isArray(secteur.bloc2) && (
            <PortableText value={secteur.bloc2} components={ptComponents} />
          )}
        </div>
        {secteurImageBloc2Url ? (
          <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
            <Image
              src={secteurImageBloc2Url.url()}
              alt={secteurImageBloc2Alt}
              quality={100}
              className="object-cover object-center"
              fill={true}
              unoptimized={true}
            />
          </div>
        ) : null}
      </section>

      {/* Bloc 3 */}
      {Array.isArray(secteur.bloc3) && secteur.bloc3.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {secteurImageBloc3Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={secteurImageBloc3Url.url()}
                alt={secteurImageBloc3Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-h4:text-center prose-h4:mx-auto prose-h4:my-8
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-check prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={secteur.bloc3} components={ptComponents} />
          </div>
        </section>
      )}

      {/* Bloc 4 */}
      {Array.isArray(secteur.bloc4) && secteur.bloc4.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-check prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={secteur.bloc4} components={ptComponents} />
          </div>
          {secteurImageBloc4Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={secteurImageBloc4Url.url()}
                alt={secteurImageBloc4Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
        </section>
      )}

      {/* Bloc 6 */}
      {Array.isArray(secteur.bloc5) && secteur.bloc5.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {secteurImageBloc5Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={secteurImageBloc5Url.url()}
                alt={secteurImageBloc5Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-h4:text-center prose-h4:mx-auto prose-h4:my-8
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-check prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={secteur.bloc5} components={ptComponents} />
          </div>
        </section>
      )}
      {/* Bloc 6 */}
      {Array.isArray(secteur.bloc6) && secteur.bloc6.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-check prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={secteur.bloc6} components={ptComponents} />
          </div>
          {secteurImageBloc6Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={secteurImageBloc6Url.url()}
                alt={secteurImageBloc6Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
        </section>
      )}
      {/* Bloc 7 */}
      {Array.isArray(secteur.bloc7) && secteur.bloc7.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {secteurImageBloc7Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={secteurImageBloc7Url.url()}
                alt={secteurImageBloc7Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-h4:text-center prose-h4:mx-auto prose-h4:my-8
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-check prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={secteur.bloc7} components={ptComponents} />
          </div>
        </section>
      )}
      {/* Bloc 8 */}
      {Array.isArray(secteur.bloc8) && secteur.bloc8.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-check prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={secteur.bloc8} components={ptComponents} />
          </div>
          {secteurImageBloc8Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={secteurImageBloc8Url.url()}
                alt={secteurImageBloc8Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
        </section>
      )}
      {/* Bloc 9 */}
      {Array.isArray(secteur.bloc9) && secteur.bloc9.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {secteurImageBloc9Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={secteurImageBloc9Url.url()}
                alt={secteurImageBloc9Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-h4:text-center prose-h4:mx-auto prose-h4:my-8
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-check prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={secteur.bloc9} components={ptComponents} />
          </div>
        </section>
      )}
      {/* Bloc 10 */}
      {Array.isArray(secteur.bloc10) && secteur.bloc10.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          <div
            className="flex-1 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-p:text-pretty prose-p:hyphens-auto
          prose-li:list-check prose-li:m-0
          prose-a:underline
          "
          >
            <PortableText value={secteur.bloc10} components={ptComponents} />
          </div>
          {secteurImageBloc10Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={secteurImageBloc10Url.url()}
                alt={secteurImageBloc10Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
        </section>
      )}
      <CTAContactButtons />
    </main>
  );
};

export default page;
