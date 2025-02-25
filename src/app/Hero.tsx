import DevisButton from "@/components/devis-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

const Hero = () => {
  return (
    <section
      className="flex items-center justify-center min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] bg-hero-img
      bg-cover bg-center bg-no-repeat p-6"
      id="hero"
    >
      <div className="flex w-11/12 sm:w-3/4 md:max-w-5xl rounded-xl overflow-hidden shadow-lg shadow-slate-100/50">
        <Card className="flex-1 rounded-none py-4">
          <CardHeader>
            <CardTitle>
              <h1 className="text-3xl md:text-4xl text-center text-fm4allsecondary text-pretty font-bold">
                Trouvez des prestataires de services au meilleur prix.
              </h1>
            </CardTitle>
            <CardDescription>
              <h2 className="text-lg md:text-xl text-center mt-6 font-bold">
                Vos locaux font moins de 3000m² ?
              </h2>
              {/* <p className="flex md:flex-row flex-col items-center text-xl md:text-2xl mt-6 md:justify-center">
              <span>Simplifiez.</span>
              <span>Comparez.</span>
              <span>Déléguez.</span>
            </p> */}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 text-base md:text-lg">
            {/* <p className="text-center text-xl">
            <strong>Vos locaux font moins de 3000m² ?</strong>
          </p> */}
            <p className="text-center">
              Gagnez du temps et de l’argent sur la{" "}
              <strong>gestion de vos prestations</strong> nettoyage, café,
              maintenance, etc.
            </p>
            <div className="flex justify-center">
              <ul className="ml-10 mb-4">
                <li className="list-check">
                  <strong>Comparez</strong> par gamme :{" "}
                  <span className="text-fm4allessential font-bold">
                    Essentiel
                  </span>
                  ,{" "}
                  <span className="text-fm4allcomfort font-bold">Confort</span>,{" "}
                  <span className="text-fm4allexcellence font-bold">
                    Excellence
                  </span>
                </li>
                <li className="list-check">
                  <strong>Simplifiez</strong> la mise en place des services
                </li>
                <li className="list-check">
                  <strong>Déléguez</strong> la gestion du quotidien
                </li>
              </ul>
              {/* <div className="h-[120px] w-[120px] relative md:block hidden rounded-xl overflow-hidden">
              <Image
                src={"/img/zen_1.png"}
                alt={"image-collaborateur-zen"}
                fill={true}
              />
            </div> */}
            </div>
            <div className="hidden w-full md:flex justify-center">
              <DevisButton
                title="Je réalise mon devis en ligne"
                text="Je réalise mon devis en ligne"
                size="lg"
              />
            </div>
            <div className="flex w-full md:hidden justify-center">
              <DevisButton
                title="Mon devis en ligne"
                text="Mon devis en ligne"
                size="lg"
              />
            </div>
          </CardContent>
        </Card>
        <div className="w-[365px] relative overflow-hidden hidden lg:block">
          <Image
            src={"/img/two_collaborators.png"}
            alt="deux-collaborateurs-se-serrent-la-main"
            quality={100}
            className="object-cover object-center"
            fill={true}
            priority={true}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
