import WhyCard from "@/components/cards/WhyCard";
import { Euro, Feather, Handshake, Rabbit, Waves } from "lucide-react";
import Image from "next/image";

const Why = () => {
  return (
    <section
      className="max-w-7xl w-full mx-auto flex flex-col gap-10 p-6"
      id="process"
    >
      <h2 className="text-2xl md:text-3xl border-l-2 px-4">
        Pourquoi ça marche ?
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
        <WhyCard
          title="Simplicité"
          content="3 gammes de services standardisées pour une comparaison et un choix faciles."
          icon={Feather}
        />
        <WhyCard
          title="Rapidité"
          content="Devis personnalisés en ligne en quelques minutes, prêt à démarrer."
          icon={Rabbit}
        />
        <WhyCard
          title="Fiabilité"
          content="Contrats clairs et partenaires de confiance rigoureusement sélectionnés."
          icon={Handshake}
        />
        <WhyCard
          title="Sérénité"
          content="Centralisation des demandes, du suivi qualité et des escalades pour une tranquillité d'esprit garantie."
          icon={Waves}
        />
        <WhyCard
          title="Optimisé"
          content="-10% en moyenne grâce aux offres groupées de nos partenaires"
          icon={Euro}
        />
      </div>
      <div className="text-lg flex flex-col gap-4 w-full max-w-prose mx-auto hyphens-auto text-wrap">
        <p className="text-center font-bold">
          Parce que tout le monde est gagnant ! Prestataires comme clients !
        </p>
        <p>
          Vous ne courez pas après vos devis et vous avez de meilleurs prix !
          Nos prestataires ne perdent pas de temps ni de ressources à chiffrer
          pour rien ! Du coup, ils peuvent vous offrir leurs meilleurs tarifs.
        </p>
        <p className="text-center font-bold">
          Parce que fm4all centralise tout
        </p>
        <p>
          Nous gérons la facturation, les demandes et le suivi qualité. Un gain
          de temps précieux pour tous !
        </p>
        <p className="font-bold">Pour vous clients:</p>
        <ul className="mx-auto ml-10">
          <li className="list-thumb">Fini la course aux devis !</li>
          <li className="list-thumb">Accédez aux prix les plus avantageux</li>
        </ul>
        <p className="font-bold">Pour nos prestataires:</p>
        <ul className="mx-auto ml-10">
          <li className="list-thumb">
            Gain de temps et de ressources : ils se concentrent sur leur cœur de
            métier.
          </li>
          <li className="list-thumb">
            Des tarifs plus compétitifs grâce à l&apos;optimisation des
            processus.
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-lg">
          <strong>Le problème</strong> : un marché complexe pour les petites
          structures
        </p>
        <div className="flex flex-col md:flex-row w-full lg:w-3/4 mx-auto border rounded-xl overflow-hidden">
          <div className="w-full md:w-2/3 p-6 md:py-10 md:px-16 flex flex-col gap-4 italic order-last md:order-first">
            <p>
              “Quand on est client utilisateur de bureaux de moins de 2000m²,
              beaucoup de demandes de devis restent sans réponse. Les ressources
              achats sont limitées, on n&apos;achète pas ça tous les jours, et
              d’ailleurs que mettre dans son cahier des charges ? On perd du
              temps à obtenir des devis et pire, ceux qu’on obtient paraissent
              toujours trop chers.
            </p>
            <p>Pour cause?</p>
            <p>
              Pour les prestataires, faire un devis pour un site de “petite
              taille” est un risque. Le temps de visiter, chiffrer, négocier et
              démarrer… Si ça ne signe pas ou s’il y a la moindre erreur
              opérationnelle, c’est la marge qui s’effondre. Résultat? Soit ils
              ne répondent pas et se concentrent sur les gros, soit ils
              répondent avec des marges gonflées pour compenser ces risques.”
            </p>
            <p className="text-end not-italic font-bold text-sm">
              Romuald Buffe, fondateur fm4all, <br />
              Ancien directeur commercial de ISS France et CBRE GWS France
            </p>
          </div>
          <div className="w-full md:w-1/3 h-[300px] sm:h-[500px] md:h-auto relative">
            <Image
              src="/img/portrait-dg.jpg"
              alt="portrait-du-directeur-general"
              fill={true}
              className="w-full h-full object-cover"
              quality={100}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 text-lg">
        <p>
          <strong>La solution</strong> : fm4all simplifie et optimise la gestion
          facility management pour tous.
        </p>
        <p className="text-center max-w-prose mx-auto">
          Un seul contact, un seul contrat, une seule facture
          <br />
          Avec fm4all, gérer vos bureaux n&apos;aura jamais été aussi simple !
        </p>
      </div>
    </section>
  );
};

export default Why;
