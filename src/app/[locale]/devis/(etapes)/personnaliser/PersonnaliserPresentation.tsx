import WhyCard from "@/components/cards/WhyCard";
import { ClientContext } from "@/context/ClientProvider";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { Euro, Feather, Handshake, Rabbit, Waves } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { useMediaQuery } from "react-responsive";
import NextServiceButton from "../../NextServiceButton";

const PersonnaliserPresentation = () => {
  const tPourquoi = useTranslations("HomePage.pourquoi");
  const tPersonnaliser = useTranslations("DevisPage.personnaliser");
  const { client } = useContext(ClientContext);
  const { personnalisation, setPersonnalisation } = useContext(
    PersonnalisationContext
  );

  const handleClickNext = () => {
    const currentIndex = personnalisation.personnalisationIds.indexOf(1);
    setPersonnalisation((prev) => ({
      ...prev,
      currentPersonnalisationId: prev.personnalisationIds[currentIndex + 1],
    }));
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return (
    <div
      className="flex flex-col gap-6 w-full mx-auto h-full py-2 overflow-auto"
      id="1"
    >
      <div className="flex-1 flex flex-col gap-4">
        <p className="max-w-prose mx-auto">
          {client.prenomContact} {client.nomContact},{" "}
        </p>
        <p className="max-w-prose mx-auto">
          {tPersonnaliser(
            "dans-cette-etape-vous-allez-pouvoir-personnaliser-votre-devis-et-confirmer-certaines-informations-ces-complements-vont-nous-permettre-de-vous-donner-un-tarif-definitif-pour-votre-futur-contrat-de-prestations-de-services"
          )}
        </p>
        <p className="max-w-prose mx-auto">
          {tPersonnaliser("avec-fm4all-vous-avez")}{" "}
          <strong>
            {tPersonnaliser("5-bonnes-raisons-dameliorer-votre-quotidien")}
          </strong>{" "}
          :
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 mt-6">
          <WhyCard
            title={tPourquoi("simplicite")}
            content={tPourquoi(
              "3-gammes-de-services-standardisees-pour-une-comparaison-et-un-choix-faciles"
            )}
            icon={Feather}
          />
          <WhyCard
            title={tPourquoi("rapidite")}
            content={tPourquoi(
              "devis-personnalises-en-ligne-en-quelques-minutes-pret-a-demarrer"
            )}
            icon={Rabbit}
          />
          <WhyCard
            title={tPourquoi("fiabilite")}
            content={tPourquoi(
              "contrats-clairs-et-partenaires-de-confiance-rigoureusement-selectionnes"
            )}
            icon={Handshake}
          />
          <WhyCard
            title={tPourquoi("serenite")}
            content={tPourquoi(
              "centralisation-des-demandes-du-suivi-qualite-et-des-escalades-pour-une-tranquillite-desprit-garantie"
            )}
            icon={Waves}
          />
          <WhyCard
            title={tPourquoi("optimise")}
            content={tPourquoi(
              "10-en-moyenne-grace-aux-offres-groupees-de-nos-partenaires"
            )}
            icon={Euro}
          />
        </div>
      </div>
      {!isTabletOrMobile ? (
        <div>
          <NextServiceButton handleClickNext={handleClickNext} />
        </div>
      ) : null}
    </div>
  );
};

export default PersonnaliserPresentation;
