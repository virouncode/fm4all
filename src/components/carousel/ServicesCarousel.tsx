import ImgCardVertical from "@/components/cards/ImgCardVertical";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LocaleType } from "@/i18n/routing";
import { urlFor } from "@/sanity/lib/image";
import { getAllServices } from "@/sanity/queries";
import { getLocale, getTranslations } from "next-intl/server";

const ServicesCarousel = async () => {
  const t = await getTranslations("Global");
  const locale = await getLocale();
  const services = await getAllServices(locale as LocaleType);
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="py-1">
        {services.map((service) => {
          const serviceImageUrl = service.imagePrincipale
            ? urlFor(service.imagePrincipale)
            : null; //TODO placeholder image
          const serviceImageAlt =
            service.imagePrincipale?.alt ?? t("illustration du service");
          const serviceSlug = service.slug?.current;
          return serviceImageUrl && serviceSlug ? (
            <CarouselItem
              className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              key={service._id}
            >
              <ImgCardVertical
                src={serviceImageUrl.width(500).height(500).url()}
                alt={serviceImageAlt}
                href={{
                  pathname: `/services/[slug]`,
                  params: { slug: serviceSlug },
                }}
                linkText={service.linkText ?? serviceSlug}
              >
                <div className="flex h-52 flex-col gap-4 p-4">
                  <p className="text-2xl">{service.titreCard}</p>
                  <p className="line-clamp-5 w-full overflow-hidden text-sm">
                    {service.description}
                  </p>
                </div>
              </ImgCardVertical>
            </CarouselItem>
          ) : null;
        })}
      </CarouselContent>
      <CarouselPrevious className="-top-9 right-12 left-auto translate-y-0" />
      <CarouselNext className="-top-9 right-0 translate-y-0" />
    </Carousel>
  );
};

export default ServicesCarousel;
