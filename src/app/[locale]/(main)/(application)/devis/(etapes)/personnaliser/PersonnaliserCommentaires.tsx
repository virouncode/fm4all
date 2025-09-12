import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { useRouter } from "@/i18n/navigation";
import { MessageSquareText } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChangeEvent, useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../PropositionsFooter";
import PropositionsTitle from "../../PropositionsTitle";
import PropositionsTitleMobile from "../../PropositionsTitleMobile";
import { useCommentairesStore } from "@/stores/commentairesStore";

const PersonnaliserCommentaires = () => {
  const tPersonnaliser = useTranslations("DevisPage.personnaliser");
  const { commentaires, setCommentaires } = useCommentairesStore((s) => ({
    commentaires: s.commentaires,
    setCommentaires: s.setCommentaires,
  }));
  const { personnalisation, setPersonnalisation } = useContext(
    PersonnalisationContext,
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
      router.push({
        pathname: "/devis/afficher",
        query: {
          personnalisationId: 1,
        },
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
          className="h-60 resize-none lg:flex-1"
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
