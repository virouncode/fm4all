import CTAContactButtons from "@/components/cta-contact-buttons";
import DevisButton from "@/components/devis-button";
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { SERVICE_QUERY } from "@/sanity/queries";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import {
  PortableText,
  PortableTextBlock,
  PortableTextComponentProps,
} from "next-sanity";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Secteur, Service, SousService } from "../../../../sanity.types";
import ExpertiseCarousel from "./ExpertiseCarousel";

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
            alt={value.alt || "illustration du service"}
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

// export const generateStaticParams = async () => {
//   const services = await client
//     .withConfig({ useCdn: false })
//     .fetch<Service[]>(SERVICES_QUERY, { language: "fr" });
//   return services.map((service) => ({ slug: service.slug?.current }));
// };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const service = await client.fetch<Service>(SERVICE_QUERY, await params);
  return {
    title: service.baliseTitle,
    description: service.baliseDescription,
  };
};

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  // const options = { next: { revalidate: 30 } };
  const service = await client.fetch<
    Service & {
      servicesAssocies: Service[];
      sousServicesAssocies: SousService[];
      secteursAssocies: Secteur[];
    }
  >(
    SERVICE_QUERY,
    await params
    // options
  );

  if (!service) {
    notFound();
  }

  const serviceImageUrl = service.imagePrincipale
    ? urlFor(service.imagePrincipale)
    : null; //TODO placeholder image
  const serviceImageAlt = service.imagePrincipale?.alt
    ? service.imagePrincipale.alt
    : "illustration du service";
  const serviceImageBloc1Url = service.imageBloc1
    ? urlFor(service.imageBloc1)
    : null;
  const serviceImageBloc1Alt = service.imageBloc1?.alt
    ? service.imageBloc1.alt
    : "illustration du service";
  const serviceImageBloc2Url = service.imageBloc2
    ? urlFor(service.imageBloc2)
    : null;
  const serviceImageBloc2Alt = service.imageBloc2?.alt
    ? service.imageBloc2.alt
    : "illustration du service";
  const serviceImageBloc3Url = service.imageBloc3
    ? urlFor(service.imageBloc3)
    : null;
  const serviceImageBloc3Alt = service.imageBloc3?.alt
    ? service.imageBloc3.alt
    : "illustration du service";
  const serviceImageBloc4Url = service.imageBloc4
    ? urlFor(service.imageBloc4)
    : null;
  const serviceImageBloc4Alt = service.imageBloc4?.alt
    ? service.imageBloc4.alt
    : "illustration du service";
  const serviceImageBloc5Url = service.imageBloc5
    ? urlFor(service.imageBloc5)
    : null;
  const serviceImageBloc5Alt = service.imageBloc5?.alt
    ? service.imageBloc5.alt
    : "illustration du service";
  const serviceImageBloc6Url = service.imageBloc6
    ? urlFor(service.imageBloc6)
    : null;
  const serviceImageBloc6Alt = service.imageBloc6?.alt
    ? service.imageBloc6.alt
    : "illustration du service";

  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20 hyphens-auto">
      <Breadcrumb className="mb-10">
        <BreadcrumbList className="text-sm lg:text-base">
          <BreadcrumbLink className="flex items-center" href={`/`}>
            <HomeIcon size={14} />
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href={`/services`} className="flex items-center">
            Nos services
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{service.titre}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      <section className="flex flex-row gap-10 mb-16">
        <div className="flex flex-col flex-1 justify-start text-lg gap-10">
          <h1 className="text-5xl">{service.titre}</h1>
          <div
            className="flex flex-col gap-4 prose-lg 
          prose-h2:border-l-2 prose-h2:px-4 prose-h2:text-4xl 
          prose-h3:font-bold prose-h3:text-xl
          prose-p:text-pretty prose-p:hyphens-auto prose-p:m-0
          prose-li:list-check prose-li:m-0
          prose-a:underline"
          >
            <p className="font-bold">{service.description}</p>
            {Array.isArray(service.tltr) && (
              <PortableText value={service.tltr} />
            )}
          </div>
          <div className="flex justify-center">
            <DevisButton
              title="Mon devis en ligne"
              text="Mon devis en ligne"
              size="lg"
            />
          </div>
        </div>
        {serviceImageUrl ? (
          <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
            <Image
              src={serviceImageUrl.url()}
              alt={serviceImageAlt}
              quality={100}
              className="object-cover object-center"
              fill={true}
              unoptimized={true}
            />
          </div>
        ) : null}
      </section>
      {(service.secteursAssocies ||
        service.servicesAssocies ||
        service.sousServicesAssocies) && (
        <section className="flex flex-row gap-10 mb-16">
          <div className="w-full">
            <h2 className="border-l-2 px-4 text-4xl mb-10">Notre expertise</h2>
            <ExpertiseCarousel
              services={service.servicesAssocies}
              sousServices={service.sousServicesAssocies}
              secteurs={service.secteursAssocies}
            />
          </div>
        </section>
      )}

      <section className="flex flex-row gap-10 mb-16">
        {serviceImageBloc1Url ? (
          <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
            <Image
              src={serviceImageBloc1Url.url()}
              alt={serviceImageBloc1Alt}
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
          {Array.isArray(service.bloc1) && (
            <PortableText value={service.bloc1} components={ptComponents} />
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
          {Array.isArray(service.bloc2) && (
            <PortableText value={service.bloc2} components={ptComponents} />
          )}
        </div>
        {serviceImageBloc2Url ? (
          <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
            <Image
              src={serviceImageBloc2Url.url()}
              alt={serviceImageBloc2Alt}
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
        ) : null}
      </section>

      {/* Bloc 3 */}
      {Array.isArray(service.bloc3) && service.bloc3.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {serviceImageBloc3Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={serviceImageBloc3Url.url()}
                alt={serviceImageBloc3Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
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
            <PortableText value={service.bloc3} components={ptComponents} />
          </div>
        </section>
      )}

      {/* Bloc 4 */}
      {Array.isArray(service.bloc4) && service.bloc4.length > 0 && (
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
            <PortableText value={service.bloc4} components={ptComponents} />
          </div>
          {serviceImageBloc4Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={serviceImageBloc4Url.url()}
                alt={serviceImageBloc4Alt}
                quality={100}
                className="object-cover object-center"
                fill={true}
                unoptimized={true}
              />
            </div>
          ) : null}
        </section>
      )}

      {/* Bloc 5 */}
      {Array.isArray(service.bloc5) && service.bloc5.length > 0 && (
        <section className="flex flex-row gap-10 mb-16">
          {serviceImageBloc5Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={serviceImageBloc5Url.url()}
                alt={serviceImageBloc5Alt}
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
            <PortableText value={service.bloc5} components={ptComponents} />
          </div>
        </section>
      )}
      {/* Bloc 6 */}
      {Array.isArray(service.bloc6) && service.bloc6.length > 0 && (
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
            <PortableText value={service.bloc6} components={ptComponents} />
          </div>
          {serviceImageBloc6Url ? (
            <div className="flex-1 rounded-lg relative overflow-hidden mx-auto min-h-[400px] hidden md:block">
              <Image
                src={serviceImageBloc6Url.url()}
                alt={serviceImageBloc6Alt}
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
