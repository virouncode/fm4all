import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { SprayCan } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext } from "react";
import PropositionsFooter from "../../PropositionsFooter";
import PropositionsTitle from "../../PropositionsTitle";

const PersonnaliserNettoyageCommentaires = () => {
  const { nettoyage, setNettoyage } = useContext(NettoyageContext);
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
    setNettoyage((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        commentaires: value,
      },
    }));
  };

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="3">
      <PropositionsTitle
        title="Nettoyage et propreté"
        description=""
        icon={SprayCan}
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1 flex flex-col gap-6">
        <p className="text-2xl">Commentaires et remarques</p>
        <Label htmlFor="commentaires-nettoyage" className="text-base">
          Ajoutez des précisions pour le service de nettoyage :
        </Label>
        <Textarea
          id="commentaires-nettoyage"
          onChange={handleChange}
          className="resize-none flex-1"
          value={nettoyage.infos.commentaires ?? ""}
        />
      </div>
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default PersonnaliserNettoyageCommentaires;
