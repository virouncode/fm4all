import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Services: Hygiène Sanitaire",
  description:
    "En plus des prestations de nettoyage, fm4all propose la gestion complète des consommables d'hygiène sanitaire",
};

const page = () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <h1 className="text-4xl mt-6 mb-10">Hygiène sanitaire</h1>
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap font-bold text-center">
            En plus des prestations de nettoyage, fm4all propose la gestion
            complète des consommables sanitaires.
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/hygiene.webp"}
              alt="illustration-hygiene-sanitaire"
              quality={100}
              className="object-cover object-center"
              fill={true}
            />
          </div>
          <ul className="text-lg max-w-prose ml-10 md:mx-auto hyphens-auto text-wrap">
            <li className="list-disc">
              Approvisionnement en savon, papier hygiénique et essuie-mains
            </li>
            <li className="list-disc">
              Installation et maintenance des distributeurs
            </li>
            <li className="list-disc">
              Gestion des stocks pour éviter toute rupture
            </li>
          </ul>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap font-bold">
            Décliné en 3 gammes de finitions
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allessential font-bold">
            Gamme Essentiel
          </p>
          <p className="text-lg max-w-prose hyphens-auto text-wrap">
            Des distributeurs fonctionnels blancs.
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/hygiene-distrib-blanc.webp"}
              alt="illustration-hygiene-distributeur-blanc"
              quality={100}
              className="object-contain"
              fill={true}
            />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allcomfort font-bold">Gamme Confort</p>
          <p className="text-lg max-w-prose hyphens-auto text-wrap">
            Des distributeurs plus haut de gamme qui peuvent être proposé en
            gris ou noir
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/hygiene-distrib-noir.webp"}
              alt="illustration-hygiene-distributeur-noir"
              quality={100}
              className="object-contain"
              fill={true}
            />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-2xl text-fm4allexcellence font-bold">
            Gamme Excellence
          </p>
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-wrap">
            Des distributeurs en finition INOX pour des locaux haut de gamme et
            résistants dans le temps.
          </p>
          <div className="w-full md:w-3/4 h-[400px] rounded-lg relative overflow-hidden mx-auto">
            <Image
              src={"/img/services/hygiene-distrib-inox.webp"}
              alt="illustration-hygiene-distributeur-inox"
              quality={100}
              className="object-contain"
              fill={true}
            />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-lg max-w-prose mx-auto hyphens-auto text-pretty">
            Avec fm4all, chaque détail est pris en charge pour un environnement
            toujours impeccable et fonctionnel.
          </p>
        </div>
      </section>
    </main>
  );
};

export default page;
