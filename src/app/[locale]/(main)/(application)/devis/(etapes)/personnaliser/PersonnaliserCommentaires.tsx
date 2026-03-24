import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { useCommentairesStore } from "@/stores/devis/commentairesStore";
import { usePersonnalisationStore } from "@/stores/devis/personnalisationStore";
import { MessageSquareText } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChangeEvent, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import PropositionsFooter from "../../PropositionsFooter";
import PropositionsTitle from "../../PropositionsTitle";
import PropositionsTitleMobile from "../../PropositionsTitleMobile";

const PersonnaliserCommentaires = () => {
  const tPersonnaliser = useTranslations("DevisPage.personnaliser");
  const { commentaires, setCommentaires } = useCommentairesStore(
    useShallow((s) => ({
      commentaires: s.commentaires,
      setCommentaires: s.setCommentaires,
    })),
  );
  const setPersonnalisation = usePersonnalisationStore(
    (s) => s.setPersonnalisation,
  );
  const router = useRouter();
  const handleClickPrevious = () => {
    setPersonnalisation((prev) => {
      const currentIndex = prev.personnalisationIds.indexOf(
        prev.currentPersonnalisationId as number,
      );
      if (currentIndex <= 0) return prev;
      return {
        ...prev,
        currentPersonnalisationId: prev.personnalisationIds[currentIndex - 1],
      };
    });
  };

  const handleClickNext = () => {
    setPersonnalisation((prev) => {
      const currentIndex = prev.personnalisationIds.indexOf(
        prev.currentPersonnalisationId as number,
      );
      if (currentIndex + 1 === prev.personnalisationIds.length) {
        const nextState = {
          ...prev,
          currentPersonnalisationId: 1,
        };
        router.push({ pathname: "/devis/afficher" });
        return nextState;
      }

      return {
        ...prev,
        currentPersonnalisationId: prev.personnalisationIds[currentIndex + 1],
      };
    });
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCommentaires(value);
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4 py-2" id="13">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title={tPersonnaliser("commentaires-remarques")}
          description=""
          icon={MessageSquareText}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          title={tPersonnaliser("commentaires-remarques")}
          description=""
          icon={MessageSquareText}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div
        className="flex w-full flex-1 flex-col gap-6 px-2"
        ref={propositionsRef}
      >
        <p className="text-2xl">
          {tPersonnaliser("commentaires-et-remarques")}
        </p>
        <Label htmlFor="commentaires-nettoyage" className="text-base">
          {tPersonnaliser("ajoutez-des-precisions-pour-notre-equipe")}
        </Label>
        <Textarea
          id="commentaires-nettoyage"
          onChange={handleChange}
          className="min-h-60 flex-1 resize-none"
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
