import { Button } from "@/components/ui/button";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { useMediaQuery } from "react-responsive";
import PreviousServiceButton from "../../PreviousServiceButton";
import { useDevisProgressStore } from "@/stores/devisProgressStore";

const PersonnaliserFinal = () => {
  const tPersonnaliser = useTranslations("DevisPage.personnaliser");
  const setDevisProgress = useDevisProgressStore((s) => s.setDevisProgress);
  const { personnalisation, setPersonnalisation } = useContext(
    PersonnalisationContext,
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
      className="mx-auto flex h-full w-full flex-col gap-4 overflow-auto py-2"
      id="14"
    >
      {!isTabletOrMobile ? (
        <div className="flex justify-end">
          <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
        </div>
      ) : null}
      <div className="mx-auto flex max-w-prose flex-col items-center gap-4 py-6 hyphens-auto">
        <p>
          {tPersonnaliser(
            "encore-un-doute-sur-une-prestation-besoin-de-precisions-supplementaires",
          )}
        </p>
        <p className="text-center">{tPersonnaliser("pas-dinquietude")}</p>
        <p>
          {tPersonnaliser(
            "apres-cette-etape-vous-pourrez-nous-contacter-pour-des-demandes-ou-questions-specifiques-avant-de-valider-votre-contrat",
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
          data-testid="valider-personnalisation"
        >
          {tPersonnaliser("valider")}
        </Button>
      </div>
    </div>
  );
};

export default PersonnaliserFinal;
