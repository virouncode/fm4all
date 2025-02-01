import WhyCard from "@/components/cards/WhyCard";
import { ClientContext } from "@/context/ClientProvider";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { Euro, Feather, Handshake, Rabbit, Waves } from "lucide-react";
import { useContext } from "react";
import NextServiceButton from "../NextServiceButton";

const PersonnaliserPresentation = () => {
  const { client } = useContext(ClientContext);
  const { personnalisation, setPersonnalisation } = useContext(
    PersonnalisationContext
  );

  const handleClickNext = () => {
    const indexOfcurrentPersonnalisationId =
      personnalisation.personnalisationIds.indexOf(1);
    setPersonnalisation((prev) => ({
      ...prev,
      currentPersonnalisationId:
        prev.personnalisationIds[indexOfcurrentPersonnalisationId + 1],
    }));
  };
  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="1">
      <div className="flex-1 flex flex-col gap-4">
        <p className="max-w-prose mx-auto">
          {client.prenomContact} {client.nomContact},{" "}
        </p>
        <p className="max-w-prose mx-auto">
          Dans cette étape, vous allez pouvoir personnaliser votre devis et
          confirmer certaines informations. Ces compléments vont nous permettre
          de vous donner un tarif définitif pour votre futur contrat de
          prestations de services.
        </p>
        <p className="max-w-prose mx-auto">
          Avec fm4all vous avez{" "}
          <strong>5 bonnes raisons d’améliorer votre quotidien</strong> :
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 mt-6">
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

      <div>
        <NextServiceButton handleClickNext={handleClickNext} />
      </div>
    </div>
  );
};

export default PersonnaliserPresentation;
