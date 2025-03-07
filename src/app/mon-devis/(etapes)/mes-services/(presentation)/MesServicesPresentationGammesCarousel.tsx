import CarouselGammesDots from "@/components/CarouselGammesDots";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";

const MesServicesPresentationGammesCarousel = () => {
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
      className="w-full relative"
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
              "bg-fm4allessential flex flex-col items-center justify-center border border-slate-200 rounded-xl p-6 text-white h-72"
            }
          >
            <p className="text-2xl text-center font-bold">Gamme Essentiel</p>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center">
                Vous êtes en recherche de services efficaces et optimisés. Ce
                qui est important pour vous c&apos;est d&apos;être en règle et
                d&apos;apporter ce qui est essentiel pour votre site.
              </p>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem>
          <div
            className={
              "bg-fm4allcomfort flex flex-col items-center justify-center border border-slate-200 rounded-xl p-6 text-white h-72"
            }
          >
            <p className="text-2xl text-center font-bold">Gamme Confort</p>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center">
                Vous êtes en recherche du bon rapport qualité prix. Le strict
                minimum vous semble un peu juste pour cette prestation et vous
                cherchez le bon équilibre. Dans cette formule, tout est géré clé
                en main, sans contraintes.
              </p>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem>
          <div
            className={
              "bg-fm4allexcellence flex flex-col items-center justify-center border border-slate-200 rounded-xl p-6 text-white h-72"
            }
          >
            <p className="text-2xl text-center font-bold">Gamme Excellence</p>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center">
                Le bien être au travail, c&apos;est important. Vous investissez
                sur les services envers vos collaborateurs, car ils vous le
                rendent bien. L&apos;excellence de service vous donne
                tranquillité d&apos;esprit.
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
