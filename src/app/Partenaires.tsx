"use client";

import Autoscroll from "embla-carousel-auto-scroll";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

const Partenaires = () => {
  return (
    <section className="max-w-7xl w-full mx-auto flex flex-col gap-10 p-6">
      <h2 className="text-2xl md:text-3xl border-l-2 px-4">Nos partenaires</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoscroll({
            direction: "forward",
            speed: 2,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_ecoclean-GcLp7UKcLxSjk5uXd89gFhBEgpSGhO.webp"
                alt="logo-ecoclean-services"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_ems-fOA0ZFomRFMHCrXIHWkxH7kvk5Ua4N.webp"
                alt="logo-ems"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_esp-FL4EgEgoIATCnMPaCWez3vvGhrAhyP.webp"
                alt="logo-esp"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_epch-Iy9QGTogt8KMcKbWGFrKzjQ6jqlEHS.webp"
                alt="logo-epch"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_braam-37bGV4MHB3FLkLNyzpGYGQFQHQX9Zx.webp"
                alt="logo-braam"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_quartier_frais-UTwuFwqppB3Q87qUaLAPVEEOAX1WRU.webp"
                alt="logo-quartier-frais"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_delicorner-e4PkYmfzNuzANOpoUzonl4pOJl05y8.webp"
                alt="logo-delicorner"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_refruiting-IqZXPHS6Rk0GhMAQaSVr6NvOcwEpdk.webp"
                alt="logo-refruiting"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_armada-qPEpAjPk2c1CaoF6WeKGEeUadnbHW1.webp"
                alt="logo-armada"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_eseis-R3e349i7Wo5NQK9HrU1KmiC1WVxtF5.webp"
                alt="logo-eseis"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_desautel-zC6PUIHhcmwZwy2hXJwDIsccu5MQ7g.webp"
                alt="logo-desautel"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_brita-q7wZNVtLQJ8Fnn5ChNVoeNOfNAZgSl.webp"
                alt="logo-brita"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_gally-Z8kbR9smSnqa8US2AzHp4MiqDFJ4z9.webp"
                alt="logo-gally"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="w-full h-48 relative mx-auto">
              <Image
                src="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_locafontaine-fIad2guYXuPgyNq1loQePSdq3oRcHq.webp"
                alt="logo-locafontaine"
                fill
                quality={100}
                className="object-contain"
              />
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="right-12 -top-9 translate-y-0 left-auto" />
        <CarouselNext className="right-0 -top-9 translate-y-0" />
      </Carousel>
    </section>
  );
};

export default Partenaires;
