import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HygieneContext } from "@/context/HygieneProvider";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { Toilet } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext } from "react";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";

const PersonnaliserHygieneCommentaires = () => {
  const { hygiene, setHygiene } = useContext(HygieneContext);
  const { personnalisation, setPersonnalisation } = useContext(
    PersonnalisationContext
  );
  const router = useRouter();
  const handleClickPrevious = () => {
    const currentIndex = personnalisation.personnalisationIds.indexOf(
      personnalisation.currentPersonnalisationId as number
    );
    setPersonnalisation((prev) => ({
      ...prev,
      currentPersonnalisationId:
        personnalisation.personnalisationIds[currentIndex - 1],
    }));
  };
  const handleClickNext = () => {
    const currentIndex = personnalisation.personnalisationIds.indexOf(
      personnalisation.currentPersonnalisationId as number
    );
    if (currentIndex + 1 === personnalisation.personnalisationIds.length) {
      setPersonnalisation((prev) => ({
        ...prev,
        currentPersonnalisationId: 1,
      }));
      router.push("/mon-devis/afficher-mon-devis");
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
    setHygiene((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        commentaires: value,
      },
    }));
  };

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="4">
      <PropositionsTitle
        title="Hygiène et propreté"
        description=""
        icon={Toilet}
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1 flex flex-col gap-6">
        <p className="text-2xl">Commentaires et remarques</p>
        <Label htmlFor="commentaires-hygiene" className="text-base">
          Ajoutez des précisions pour le service d&apos;hygiène :
        </Label>
        <Textarea
          id="commentaires-hygiene"
          onChange={handleChange}
          className="resize-none flex-1"
          value={hygiene.infos.commentaires ?? ""}
        />
      </div>
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default PersonnaliserHygieneCommentaires;
