import { Button } from "@/components/ui/button";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { useMediaQuery } from "react-responsive";
import PreviousServiceButton from "../../PreviousServiceButton";

const PersonnaliserFinal = () => {
  const tPersonnaliser = useTranslations("DevisPage.personnaliser");
  const { setDevisProgress } = useContext(DevisProgressContext);
  const { personnalisation, setPersonnalisation } = useContext(
    PersonnalisationContext
  );
  const router = useRouter();
  const handleAfficherDevis = () => {
    setDevisProgress({
      currentStep: 7,
      completedSteps: [1, 2, 3, 4, 5, 6],
    });
    router.push({
      pathname: "/devis/afficher",
    });
  };
  const handleClickPrevious = () => {
    const currentIndex = personnalisation.personnalisationIds.indexOf(14);
    setPersonnalisation((prev) => ({
      ...prev,
      currentPersonnalisationId:
        personnalisation.personnalisationIds[currentIndex - 1],
    }));
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return (
    <div
      className="flex flex-col gap-4 w-full mx-auto h-full py-2 overflow-auto"
      id="14"
    >
      {!isTabletOrMobile ? (
        <div className="flex justify-end">
          <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
        </div>
      ) : null}
      <div className="flex flex-col gap-4 py-6 items-center max-w-prose hyphens-auto mx-auto">
        <p>
          {tPersonnaliser(
            "encore-un-doute-sur-une-prestation-besoin-de-precisions-supplementaires"
          )}
        </p>
        <p className="text-center">{tPersonnaliser("pas-dinquietude")}</p>
        <p>
          {tPersonnaliser(
            "apres-cette-etape-vous-pourrez-nous-contacter-pour-des-demandes-ou-questions-specifiques-avant-de-valider-votre-contrat"
          )}
        </p>
        <p className="text-center">
          {tPersonnaliser("pret-a-obtenir-votre-devis-complet-et-engageant")}
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleAfficherDevis}
          variant="destructive"
          size="lg"
          className="text-base"
        >
          {tPersonnaliser("valider")}
        </Button>
      </div>
    </div>
  );
};

export default PersonnaliserFinal;
