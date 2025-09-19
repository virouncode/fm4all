import ImgCardVertical from "@/components/cards/ImgCardVertical";
import { LocaleType } from "@/i18n/routing";
import { urlFor } from "@/sanity/lib/image";
import { getAllServices } from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";

const ServicesCards = async () => {
  // const options = { next: { revalidate: 30 } };
  const locale = await getLocale();
  const services = await getAllServices(locale as LocaleType);
  const t = await getTranslations("Global");

  return (
    <div className="mt-6 grid w-full grid-cols-[repeat(auto-fit,minmax(250px,1fr))] items-center gap-6">
      {services.map((service, index) => {
        const serviceImageUrl = service.imagePrincipale
          ? urlFor(service.imagePrincipale)
          : null; //TODO placeholder image
        const serviceImageAlt = service.imagePrincipale?.alt
          ? service.imagePrincipale.alt
          : t("illustration-du-service");
        const serviceUrl = service.slug?.current ?? "";
        return serviceImageUrl ? (
          <ImgCardVertical
            key={service._id}
            src={serviceImageUrl.width(500).height(500).url()}
            alt={serviceImageAlt}
            href={{
              pathname: `/services/[slug]`,
              params: { slug: serviceUrl },
            }}
            linkText={service.linkText ?? serviceUrl}
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : "auto"}
          >
            <div className="flex h-52 flex-col gap-4 p-4">
              <p className="text-2xl">{service.titreCard}</p>
              <p className="line-clamp-5 w-full overflow-hidden text-sm">
                {service.description}
              </p>
            </div>
          </ImgCardVertical>
        ) : null;
      })}
    </div>
  );
};

export default ServicesCards;
