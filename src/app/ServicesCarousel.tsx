import ImgCardVertical from "@/components/cards/ImgCardVertical";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "@/i18n/navigation";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { SERVICES_QUERY } from "@/sanity/queries";
import { getLocale } from "next-intl/server";
import { Service } from "../../sanity.types";

const ServicesCarousel = async () => {
  // const options = { next: { revalidate: 30 } };
  const locale = await getLocale();
  const services = await client.fetch<Service[]>(
    SERVICES_QUERY,
    { language: locale }
    // options
  );
  console.log("services", services);

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {services.map((service) => {
          const serviceImageUrl = service.imagePrincipale
            ? urlFor(service.imagePrincipale)
            : null; //TODO placeholder image
          const serviceImageAlt =
            service.imagePrincipale?.alt ?? "illustration du service";
          const serviceUrl = service.slug?.current ?? "";
          return serviceImageUrl ? (
            <CarouselItem
              className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              key={service._id}
            >
              <ImgCardVertical
                src={serviceImageUrl.width(800).url()}
                alt={serviceImageAlt}
              >
                <div className="p-4 flex flex-col gap-4 h-56">
                  <p className="text-2xl">{service.titre}</p>
                  <p className="w-full overflow-hidden line-clamp-3">
                    {service.description}
                  </p>
                  <div className="flex-1">
                    <Link
                      className="underline"
                      href={`/services/${serviceUrl}`}
                    >
                      En savoir plus
                    </Link>
                  </div>
                </div>
              </ImgCardVertical>
            </CarouselItem>
          ) : null;
        })}
      </CarouselContent>
      <CarouselPrevious className="right-12 -top-9 translate-y-0 left-auto" />
      <CarouselNext className="right-0 -top-9 translate-y-0" />
    </Carousel>
  );
};

export default ServicesCarousel;
