import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { useRouter } from "@/i18n/navigation";
import { useCafeStore } from "@/stores/cafeStore";
import { Coffee } from "lucide-react";
import { ChangeEvent, useContext } from "react";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";

const PersonnaliserCafeCommentaires = () => {
  const { cafe, setCafe } = useCafeStore((s) => ({
    cafe: s.cafe,
    setCafe: s.setCafe,
  }));
  const { personnalisation, setPersonnalisation } = useContext(
    PersonnalisationContext,
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
      router.push({
        pathname: "/devis/afficher",
      });
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
    setCafe((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        commentaires: value,
      },
    }));
  };

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4 py-2" id="8">
      <PropositionsTitle
        title="Boissons chaudes"
        description=""
        icon={Coffee}
        handleClickPrevious={handleClickPrevious}
      />
      <div className="flex w-full flex-1 flex-col gap-6">
        <p className="text-2xl">Commentaires et remarques</p>
        <Label htmlFor="commentaires-cafe" className="text-base">
          Ajoutez des précisions pour le service de boissons chaudes :
        </Label>
        <Textarea
          id="commentaires-cafe"
          onChange={handleChange}
          className="flex-1 resize-none"
          value={cafe.infos.commentaires ?? ""}
        />
      </div>
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default PersonnaliserCafeCommentaires;
