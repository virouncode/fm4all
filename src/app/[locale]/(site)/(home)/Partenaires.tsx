"use client";

import Autoscroll from "embla-carousel-auto-scroll";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useTranslations } from "next-intl";
import Image from "next/image";

const partenairesData = [
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_ecoclean-GcLp7UKcLxSjk5uXd89gFhBEgpSGhO.webp",
    alt: "logo-ecoclean-services",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_ems-fOA0ZFomRFMHCrXIHWkxH7kvk5Ua4N.webp",
    alt: "logo-ems",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_esp-FL4EgEgoIATCnMPaCWez3vvGhrAhyP.webp",
    alt: "logo-esp",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_NIKITA-RkaVBkIsb7qZveBaZnSIJJFlvVRQ5C",
    alt: "logo-nikita",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_epch-Iy9QGTogt8KMcKbWGFrKzjQ6jqlEHS.webp",
    alt: "logo-epch",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_braam-37bGV4MHB3FLkLNyzpGYGQFQHQX9Zx.webp",
    alt: "logo-braam",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_quartier_frais-UTwuFwqppB3Q87qUaLAPVEEOAX1WRU.webp",
    alt: "logo-quartier-frais",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_delicorner-e4PkYmfzNuzANOpoUzonl4pOJl05y8.webp",
    alt: "logo-delicorner",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_refruiting-IqZXPHS6Rk0GhMAQaSVr6NvOcwEpdk.webp",
    alt: "logo-refruiting",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_armada-qPEpAjPk2c1CaoF6WeKGEeUadnbHW1.webp",
    alt: "logo-armada",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_eseis-R3e349i7Wo5NQK9HrU1KmiC1WVxtF5.webp",
    alt: "logo-eseis",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_desautel-zC6PUIHhcmwZwy2hXJwDIsccu5MQ7g.webp",
    alt: "logo-desautel",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_brita-q7wZNVtLQJ8Fnn5ChNVoeNOfNAZgSl.webp",
    alt: "logo-brita",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_gally-Z8kbR9smSnqa8US2AzHp4MiqDFJ4z9.webp",
    alt: "logo-gally",
  },
  {
    logoUrl:
      "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_locafontaine-fIad2guYXuPgyNq1loQePSdq3oRcHq.webp",
    alt: "logo-locafontaine",
  },
];

const Partenaires = () => {
  const t = useTranslations("HomePage.partenaires");
  return (
    <section className="bg-gradient-to-r from-[#f0c674]/100 to-[#f0c674]/70">
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-10 pt-8 pb-12 px-6">
        <h2 className="text-2xl md:text-3xl border-l-2 px-4">
          {t("nos-partenaires")}
        </h2>
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
            {partenairesData.map(({ logoUrl, alt }) => (
              <CarouselItem
                className="sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                key={alt}
              >
                <div className="w-full h-48 relative mx-auto">
                  <Image
                    src={logoUrl}
                    alt={alt}
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default Partenaires;
