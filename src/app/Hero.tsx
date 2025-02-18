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
      className="flex items-center justify-center min-h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] bg-hero-img bg-cover bg-no-repeat p-6"
      id="hero"
    >
      <Card className="w-11/12 sm:w-3/4 md:max-w-2xl p-4">
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl md:text-4xl text-center  text-fm4allsecondary text-pretty">
              Trouvez des prestataires de services au meilleur prix.
            </h1>
          </CardTitle>
          <CardDescription>
            <h2 className="text-lg md:text-xl text-center">
              <em>Le Facility Management pour tous</em>
            </h2>
            {/* <p className="flex md:flex-row flex-col items-center text-xl md:text-2xl mt-6 md:justify-center">
              <span>Simplifiez.</span>
              <span>Comparez.</span>
              <span>Déléguez.</span>
            </p> */}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p className="text-base text-center">
            <strong>Vos locaux font moins de 3000m² ?</strong> Gagnez du temps
            et de l’argent sur la gestion de vos prestations nettoyage, café,
            maintenance…
          </p>
          <div className="flex gap-8 justify-center items-center">
            <ul>
              <li className="list-disc">
                <strong>Comparez</strong> par gamme Essentiel, Confort ou
                Excellence
              </li>
              <li className="list-disc">
                <strong>Simplifiez</strong> la mise en place des services
              </li>
              <li className="list-disc">
                <strong>Déléguez</strong> la gestion du quotidien
              </li>
            </ul>
            <div className="h-[120px] w-[120px] relative md:block hidden rounded-xl overflow-hidden">
              <Image
                src={"/img/zen_1.png"}
                alt={"image-collaborateur-zen"}
                fill={true}
              />
            </div>
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
    </section>
  );
};

export default Hero;
