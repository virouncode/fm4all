import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { TheContext } from "@/context/TheProvider";
import { useRouter } from "@/i18n/navigation";
import { Leaf } from "lucide-react";
import { ChangeEvent, useContext } from "react";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";

const PersonnaliserTheCommentaires = () => {
  const { the, setThe } = useContext(TheContext);
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
    setThe((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        commentaires: value,
      },
    }));
  };

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="9">
      <PropositionsTitle
        title="Thés variés"
        description=""
        icon={Leaf}
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1 flex flex-col gap-6">
        <p className="text-2xl">Commentaires et remarques</p>
        <Label htmlFor="commentaires-the" className="text-base">
          Ajoutez des précisions pour le service de thés :
        </Label>
        <Textarea
          id="commentaires-the"
          onChange={handleChange}
          className="resize-none flex-1"
          value={the.infos.commentaires ?? ""}
        />
      </div>
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default PersonnaliserTheCommentaires;
