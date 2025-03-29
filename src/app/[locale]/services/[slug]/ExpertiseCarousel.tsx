"use client";

import ImgCardVertical from "@/components/cards/ImgCardVertical";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { urlFor } from "@/sanity/lib/image";
import { useTranslations } from "next-intl";
import { Secteur, Service, SousService } from "../../../../../sanity.types";

type ExpertiseCarouselProps = {
  services: Service[];
  sousServices: SousService[];
  secteurs: Secteur[];
};

const ExpertiseCarousel = ({
  services,
  sousServices,
  secteurs,
}: ExpertiseCarouselProps) => {
  const t = useTranslations("Global");
  return (
    <Tabs defaultValue="services">
      <TabsList className="mb-10">
        {[...(services || []), ...(sousServices || [])].length > 0 ? (
          <TabsTrigger value="services" className="text-lg">
            Services associés
          </TabsTrigger>
        ) : null}
        {[...(secteurs || [])].length > 0 ? (
          <TabsTrigger value="secteurs" className="text-lg">
            Secteurs
          </TabsTrigger>
        ) : null}
      </TabsList>
      <TabsContent value="services">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {[...(services || []), ...(sousServices || [])].map((service) => {
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
                      <div className="flex-1 underline">
                        {t("en-savoir-plus")}
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
      </TabsContent>
      <TabsContent value="secteurs">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {[...(secteurs || [])].map((secteur) => {
              const secteurImageUrl = secteur.imagePrincipale
                ? urlFor(secteur.imagePrincipale)
                : null; //TODO placeholder image
              const secteurImageAlt =
                secteur.imagePrincipale?.alt ?? "illustration du secteur";
              const secteurUrl = secteur.slug?.current ?? "";
              return secteurImageUrl ? (
                <CarouselItem
                  className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  key={secteur._id}
                >
                  <ImgCardVertical
                    src={secteurImageUrl.url()}
                    alt={secteurImageAlt}
                    href={{
                      pathname: `/secteurs/[slug]`,
                      params: { slug: secteurUrl },
                    }}
                  >
                    <div className="p-4 flex flex-col gap-4 h-56">
                      <p className="text-2xl">{secteur.titre}</p>
                      <p className="w-full overflow-hidden line-clamp-3">
                        {secteur.description}
                      </p>
                      <div className="flex-1 underline">
                        {t("en-savoir-plus")}
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
      </TabsContent>
    </Tabs>
  );
};

export default ExpertiseCarousel;
