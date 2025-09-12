import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { usePersonnalisationStore } from "@/stores/personnalisationStore";
import { useSnacksFruitsStore } from "@/stores/snacksFruitsStore";
import { Banana, Cookie, CupSoda } from "lucide-react";
import { ChangeEvent } from "react";
import { useShallow } from "zustand/shallow";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";

const PersonnaliserSnacksFruitsCommentaires = () => {
  const { snacksFruits, setSnacksFruits } = useSnacksFruitsStore(
    useShallow((s) => ({
      snacksFruits: s.snacksFruits,
      setSnacksFruits: s.setSnacksFruits,
    })),
  );
  const { personnalisation, setPersonnalisation } = usePersonnalisationStore(
    useShallow((s) => ({
      personnalisation: s.personnalisation,
      setPersonnalisation: s.setPersonnalisation,
    })),
  );
  const router = useRouter();
  const handleClickPrevious = () => {
    const currentIndex = personnalisation.personnalisationIds.indexOf(
      personnalisation.currentPersonnalisationId as number,
    );
    setPersonnalisation((prev) => ({
      ...prev,
      currentPersonnalisationId:
        personnalisation.personnalisationIds[currentIndex - 1],
    }));
  };
  const handleClickNext = () => {
    const currentIndex = personnalisation.personnalisationIds.indexOf(
      personnalisation.currentPersonnalisationId as number,
    );
    if (currentIndex + 1 === personnalisation.personnalisationIds.length) {
      setPersonnalisation((prev) => ({
        ...prev,
        currentPersonnalisationId: 1,
      }));
      router.push("/devis/afficher");
      return;
    }
    setPersonnalisation((prev) => ({
      ...prev,
      currentPersonnalisationId:
        personnalisation.personnalisationIds[currentIndex + 1],
    }));
  };
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSnacksFruits((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        commentaires: value,
      },
    }));
  };

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4 py-2" id="10">
      <PropositionsTitle
        title="Snacks & fruits"
        description=""
        icon={Cookie}
        icon2={Banana}
        icon3={CupSoda}
        handleClickPrevious={handleClickPrevious}
      />
      <div className="flex w-full flex-1 flex-col gap-6">
        <p className="text-2xl">Commentaires et remarques</p>
        <Label htmlFor="commentaires-snacksFruits" className="text-base">
          Ajoutez des précisions pour le service de snacks et fruits :
        </Label>
        <Textarea
          id="commentaires-snacksFruits"
          onChange={handleChange}
          className="flex-1 resize-none"
          value={snacksFruits.infos.commentaires ?? ""}
        />
      </div>
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default PersonnaliserSnacksFruitsCommentaires;
