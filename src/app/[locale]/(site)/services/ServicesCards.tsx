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
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 items-center mt-6 w-full">
      {services.map((service) => {
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
          >
            <div className="p-4 flex flex-col gap-4 h-52">
              <p className="text-2xl">{service.titre}</p>
              <p className="w-full overflow-hidden line-clamp-5">
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
