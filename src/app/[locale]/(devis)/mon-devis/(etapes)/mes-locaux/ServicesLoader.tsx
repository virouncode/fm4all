import WhyCard from "@/components/cards/WhyCard";
import Loader from "@/components/loader";
import { Euro, Feather, Handshake, Rabbit, Waves } from "lucide-react";

const ServicesLoader = () => {
  return (
    <section className="flex-1 overflow-hidden">
      <div className="flex flex-col gap-10">
        <Loader src="/img/logo_simple.webp" alt="logo-fm4all-simple" />
        <div className="text-lg mx-auto max-w-prose mt-10 animate-pulse text-center">
          Vous allez obtenir des devis qui bénéficient du service de gestion
          centralisé fm4all : <br />
          Un seul interlocuteur, un seul contrat, une seule facture...
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 animate-pulse">
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
      </div>
    </section>
  );
};

export default ServicesLoader;
