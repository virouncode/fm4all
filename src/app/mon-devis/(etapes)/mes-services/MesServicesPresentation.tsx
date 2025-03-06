"use client";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ServicesContext } from "@/context/ServicesProvider";
import { GammeType } from "@/zod-schemas/gamme";
import {
  Banana,
  Coffee,
  Cookie,
  CupSoda,
  FireExtinguisher,
  Info,
  Leaf,
  SprayCan,
  Toilet,
  UserRoundCog,
  Wrench,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import NextServiceButton from "../../NextServiceButton";

const MesServicesPresentation = () => {
  const { setServices } = useContext(ServicesContext);
  const [gammeSelected, setGammeSelected] = useState<GammeType>("essentiel");
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

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const isGammeSelected = (gamme: GammeType) => gamme === gammeSelected;
  const handleClickNext = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: 1,
    }));
  };
  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="0">
      <div className="w-full flex-1 overflow-auto">
        <div className="h-full flex flex-col gap-6">
          <p>
            Nous allons vous proposer plus de 3 devis de plusieurs fournisseurs
            pour chacun des services suivants :
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 items-center">
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <SprayCan />
              </div>
              <p>Nettoyage et propreté</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <Toilet />
              </div>
              <p>Hygiène sanitaire</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <Wrench />
              </div>
              <p>Maintenance</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <FireExtinguisher />
              </div>
              <p>Sécurité incendie</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <Coffee />
              </div>
              <p>Boissons chaudes</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <Leaf />
              </div>
              <p>Thés variés</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <Cookie />
                <Banana />
                <CupSoda />
              </div>
              <p>Snacks & Fruits</p>
            </div>
            <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <UserRoundCog />
              </div>
              <p>Office/Hospitality Manager</p>
            </div>
            {/* <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <HandPlatter />
              </div>
              <p>Services fm4all</p>
            </div> */}
          </div>
          <p>
            Pour chaque offre, cliquez sur{" "}
            <Info className="inline-block" size={14} /> pour en savoir plus et
            sélectionnez la gamme qui vous convient :{" "}
          </p>

          {isTabletOrMobile ? (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full relative"
              setApi={setApi}
            >
              <CarouselContent>
                <CarouselItem>
                  <div
                    className={
                      "bg-fm4allessential flex flex-col items-center justify-center border border-slate-200 rounded-xl p-6 text-white h-72"
                    }
                  >
                    <p className="text-2xl text-center font-bold">
                      Gamme Essentiel
                    </p>
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-center">
                        Vous êtes en recherche de services efficaces et
                        optimisés. Ce qui est important pour vous c&apos;est
                        d&apos;être en règle et d&apos;apporter ce qui est
                        essentiel pour votre site.
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
                    <p className="text-2xl text-center font-bold">
                      Gamme Confort
                    </p>
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-center">
                        Vous êtes en recherche du bon rapport qualité prix. Le
                        strict minimum vous semble un peu juste pour cette
                        prestation et vous cherchez le bon équilibre. Dans cette
                        formule, tout est géré clé en main, sans contraintes.
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
                    <p className="text-2xl text-center font-bold">
                      Gamme Excellence
                    </p>
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-center">
                        Le bien être au travail, c&apos;est important. Vous
                        investissez sur les services envers vos collaborateurs,
                        car ils vous le rendent bien. L&apos;excellence de
                        service vous donne tranquillité d&apos;esprit.
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                {[...Array(3)].map((_, index) => {
                  return (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full border-white border ${
                        currentIndex === index
                          ? "bg-fm4allsecondary"
                          : "bg-gray-300"
                      }`}
                    />
                  );
                })}
              </div>
            </Carousel>
          ) : (
            <>
              <div className="flex-wrap gap-10 justify-center text-2xl mb-4 hidden lg:flex">
                <div
                  className={`w-48 text-center px-6 py-10 bg-fm4allessential rounded-lg text-slate-200 font-bold cursor-pointer ${
                    isGammeSelected("essentiel")
                      ? "ring-4 ring-inset ring-fm4alldestructive"
                      : ""
                  }`}
                  onClick={() => setGammeSelected("essentiel")}
                >
                  Essentiel
                </div>
                <div
                  className={`w-48 text-center px-6 py-10 bg-fm4allcomfort rounded-lg text-slate-200 font-bold cursor-pointer ${
                    isGammeSelected("confort")
                      ? "ring-4 ring-inset ring-fm4alldestructive"
                      : ""
                  }`}
                  onClick={() => setGammeSelected("confort")}
                >
                  Confort
                </div>
                <div
                  className={`w-48 text-center px-6 py-10 bg-fm4allexcellence rounded-lg text-slate-200 font-bold cursor-pointer ${
                    isGammeSelected("excellence")
                      ? "ring-4 ring-inset ring-fm4alldestructive"
                      : ""
                  }`}
                  onClick={() => setGammeSelected("excellence")}
                >
                  Excellence
                </div>
              </div>
              <div className="lg:w-2/3 mx-auto hyphens-auto text-wrap mb-6 lg:mb-0">
                {gammeSelected === "essentiel" && (
                  <p>
                    Gamme Essentiel : Vous êtes en recherche de services
                    efficaces et optimisés. Ce qui est important pour vous
                    c&apos;est d&apos;être en règle et d&apos;apporter ce qui
                    est essentiel pour votre site.
                  </p>
                )}
                {gammeSelected === "confort" && (
                  <p>
                    Gamme Confort : Vous êtes en recherche du bon rapport
                    qualité prix. Le strict minimum vous semble un peu juste
                    pour cette prestation et vous cherchez le bon équilibre.
                    Dans cette formule, tout est géré clé en main, sans
                    contraintes.
                  </p>
                )}
                {gammeSelected === "excellence" && (
                  <p>
                    Gamme Excellence : Le bien être au travail, c&apos;est
                    important. Vous investissez sur les services envers vos
                    collaborateurs, car ils vous le rendent bien.
                    L&apos;excellence de service vous donne tranquillité
                    d&apos;esprit.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default MesServicesPresentation;
