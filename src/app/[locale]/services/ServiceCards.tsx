import ImgCardVertical from "@/components/cards/ImgCardVertical";
import { Link } from "@/i18n/navigation";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { SERVICES_QUERY } from "@/sanity/queries";
import { getLocale } from "next-intl/server";
import { Service } from "../../../../sanity.types";

const ServiceCards = async () => {
  // const options = { next: { revalidate: 30 } };
  const locale = await getLocale();
  const services = await client.fetch<Service[]>(
    SERVICES_QUERY,
    { language: locale }
    // options
  );

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 items-center mt-6 w-full">
      {services.map((service) => {
        const serviceImageUrl = service.imagePrincipale
          ? urlFor(service.imagePrincipale)
          : null; //TODO placeholder image
        const serviceImageAlt = service.imagePrincipale?.alt
          ? service.imagePrincipale.alt
          : "illustration du service";
        const serviceUrl = service.slug?.current ?? "";
        return serviceImageUrl ? (
          <ImgCardVertical
            key={service._id}
            src={serviceImageUrl.url()}
            alt={serviceImageAlt}
          >
            <div className="p-4 flex flex-col gap-4 h-52">
              <p className="text-2xl">{service.titre}</p>
              <p className="w-full overflow-hidden line-clamp-3">
                {service.description}
              </p>
              <div className="flex-1">
                <Link className="underline" href={`/services/${serviceUrl}`}>
                  En savoir plus
                </Link>
              </div>
            </div>
          </ImgCardVertical>
        ) : null;
      })}
    </div>
  );
};

export default ServiceCards;
