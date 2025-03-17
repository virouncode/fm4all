import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CommentairesContext } from "@/context/CommentairesProvider";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../PropositionsFooter";
import PropositionsTitle from "../../PropositionsTitle";
import PropositionsTitleMobile from "../../PropositionsTitleMobile";

const PersonnaliserCommentaires = () => {
  const { commentaires, setCommentaires } = useContext(CommentairesContext);
  const { personnalisation, setPersonnalisation } = useContext(
    PersonnalisationContext
  );
  const router = useRouter();
  const handleClickPrevious = () => {
    const currentIndex = personnalisation.personnalisationIds.indexOf(13);

    setPersonnalisation((prev) => ({
      ...prev,
      currentPersonnalisationId:
        personnalisation.personnalisationIds[currentIndex - 1],
    }));
  };
  const handleClickNext = () => {
    const currentIndex = personnalisation.personnalisationIds.indexOf(13);
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
    setCommentaires(value);
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="13">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title="Commentaires / remarques"
          description=""
          icon={MessageSquareText}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          title="Commentaires / remarques"
          description=""
          icon={MessageSquareText}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div
        className="w-full flex-1 flex flex-col gap-6 px-2"
        ref={propositionsRef}
      >
        <p className="text-2xl">Commentaires et remarques</p>
        <Label htmlFor="commentaires-nettoyage" className="text-base">
          Ajoutez des précisions pour notre équipe :
        </Label>
        <Textarea
          id="commentaires-nettoyage"
          onChange={handleChange}
          className="resize-none h-60 lg:flex-1"
          value={commentaires ?? ""}
        />
      </div>
      {!isTabletOrMobile ? (
        <PropositionsFooter handleClickNext={handleClickNext} />
      ) : null}
    </div>
  );
};

export default PersonnaliserCommentaires;
