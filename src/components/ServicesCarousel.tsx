import ImgCardVertical from "@/components/cards/ImgCardVertical";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { urlFor } from "@/sanity/lib/image";
import { getAllServices } from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";

const ServicesCarousel = async () => {
  const t = await getTranslations("Global");
  // const options = { next: { revalidate: 30 } };
  const locale = await getLocale();
  const services = await getAllServices(locale as "fr" | "en");
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
            service.imagePrincipale?.alt ?? t("illustration du service");
          const serviceUrl = service.slug?.current ?? "";
          return serviceImageUrl ? (
            <CarouselItem
              className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              key={service._id}
            >
              <ImgCardVertical
                src={serviceImageUrl.width(800).url()}
                alt={serviceImageAlt}
                href={{
                  pathname: `/services/[slug]`,
                  params: { slug: serviceUrl },
                }}
              >
                <div className="p-4 flex flex-col gap-4 h-56">
                  <p className="text-2xl">{service.titre}</p>
                  <p className="w-full overflow-hidden line-clamp-3">
                    {service.description}
                  </p>
                  <div className="flex-1 underline">{t("en-savoir-plus")}</div>
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
