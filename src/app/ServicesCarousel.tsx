import ImgCardVertical from "@/components/cards/ImgCardVertical";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { SERVICES_QUERY } from "@/sanity/queries";
import Link from "next/link";
import { Service } from "../../sanity.types";

const ServicesCarousel = async () => {
  const options = { next: { revalidate: 5 } };
  const services = await client.fetch<Service[]>(SERVICES_QUERY, {}, options);
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
                src={serviceImageUrl.url()}
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
