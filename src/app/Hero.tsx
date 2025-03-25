import DevisButton from "@/components/devis-button";
import Image from "next/image";

const Hero = () => {
  return (
    <section
      className="flex items-center justify-center min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] overflow-hidden"
      id="hero"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/hero_wallpaper.webp"
          alt="hero background"
          fill
          className="object-cover object-center"
          priority
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
      </div>
      <div className="relative z-10 w-11/12 max-w-7xl mx-auto flex flex-col items-center gap-8 px-4 py-12">
        <div className="w-full max-w-3xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-pretty">
            Vos prestataires de services au meilleur prix.
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-8">
            Vos locaux font moins de 3000m² ?
          </p>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
            <h2 className="text-base md:text-lg mb-6">
              Gagnez du temps et de l’argent sur la{" "}
              <strong>gestion de vos prestations</strong> de nettoyage, hygiène
              sanitaire, café, maintenance multitechnique, sécurité incendie,
              etc.
            </h2>
            <ul className="space-y-4 mb-10 text-base md:text-lg">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center bg-fm4allsecondary text-white rounded-full w-6 h-6 mr-3 flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>
                  <strong className="text-white">Comparez</strong> par gamme :
                  <span className="font-bold ml-1">Essentiel</span>,{" "}
                  <span className="font-bold">Confort</span>,{" "}
                  <span className="font-bold">Excellence</span>
                </span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center bg-fm4allsecondary text-white rounded-full w-6 h-6 mr-3 flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>
                  <strong className="text-white">Simplifiez</strong> la mise en
                  place des services
                </span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center bg-fm4allsecondary text-white rounded-full w-6 h-6 mr-3 flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>
                  <strong className="text-white">Déléguez</strong> la gestion du
                  quotidien
                </span>
              </li>
            </ul>
            <div className="hidden md:flex md:justify-center">
              <DevisButton
                title="Je réalise mon devis en ligne"
                text="Je réalise mon devis en ligne"
                size="lg"
                className="bg-fm4alldestructive hover:bg-fm4alldestructive/90 text-white border-none shadow-lg hover:shadow-xl"
              />
            </div>
            <div className="md:hidden">
              <DevisButton
                title="Mon devis en ligne"
                text="Mon devis en ligne"
                size="lg"
                className="bg-fm4alldestructive hover:bg-fm4alldestructive/90 text-white border-none shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
