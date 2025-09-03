import CarouselGammesDots from "@/components/carousel/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const MesServicesPresentationGammesCarousel = () => {
  const tGammes = useTranslations("GammesPage");
  const t = useTranslations("DevisPage.services.presentation.gammes");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  useEffect(() => {
    if (!api) {
      return;
    }
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="relative w-full"
      setApi={setApi}
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
    >
      <CarouselContent>
        <CarouselItem>
          <div
            className={
              "flex h-72 flex-col items-center justify-center rounded-xl border border-slate-200 bg-fm4allessential p-6 text-white"
            }
          >
            <p className="text-center text-2xl font-bold">
              {tGammes("gamme-essentiel")}
            </p>
            <div className="flex flex-1 items-center justify-center">
              <p className="text-center">
                {t(
                  "vous-etes-en-recherche-de-services-efficaces-et-optimises-ce-qui-est-important-pour-vous-c-est-d-etre-en-regle-et-d-apporter-ce-qui-est-essentiel-pour-votre-site",
                )}
              </p>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem>
          <div
            className={
              "flex h-72 flex-col items-center justify-center rounded-xl border border-slate-200 bg-fm4allcomfort p-6 text-white"
            }
          >
            <p className="text-center text-2xl font-bold">
              {tGammes("gamme-confort")}
            </p>
            <div className="flex flex-1 items-center justify-center">
              <p className="text-center">
                {t(
                  "vous-etes-en-recherche-du-bon-rapport-qualite-prix-le-strict-minimum-vous-semble-un-peu-juste-pour-cette-prestation-et-vous-cherchez-le-bon-equilibre-dans-cette-formule-tout-est-gere-cle-en-main-sans-contraintes",
                )}
              </p>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem>
          <div
            className={
              "flex h-72 flex-col items-center justify-center rounded-xl border border-slate-200 bg-fm4allexcellence p-6 text-white"
            }
          >
            <p className="text-center text-2xl font-bold">
              {tGammes("gamme-excellence")}
            </p>
            <div className="flex flex-1 items-center justify-center">
              <p className="text-center">
                {t(
                  "le-bien-etre-au-travail-c-est-important-vous-investissez-sur-les-services-envers-vos-collaborateurs-car-ils-vous-le-rendent-bien-l-excellence-de-service-vous-donne-tranquillite-d-esprit",
                )}
              </p>
            </div>
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselGammesDots currentIndex={currentIndex} />
    </Carousel>
  );
};

export default MesServicesPresentationGammesCarousel;
