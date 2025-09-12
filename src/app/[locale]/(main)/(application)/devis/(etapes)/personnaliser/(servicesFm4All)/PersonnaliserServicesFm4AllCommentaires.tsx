import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { usePersonnalisationStore } from "@/stores/personnalisationStore";
import { useServicesFm4AllStore } from "@/stores/servicesFm4AllStore";
import { HandPlatter } from "lucide-react";
import { ChangeEvent } from "react";
import { useShallow } from "zustand/shallow";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";

const PersonnaliserServicesFm4AllCommentaires = () => {
  const { servicesFm4All, setServicesFm4All } = useServicesFm4AllStore(
    useShallow((s) => ({
      servicesFm4All: s.servicesFm4All,
      setServicesFm4All: s.setServicesFm4All,
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
    setServicesFm4All((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        commentaires: value,
      },
    }));
  };

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4 py-2" id="12">
      <PropositionsTitle
        title="Services fm4all"
        description=""
        icon={HandPlatter}
        handleClickPrevious={handleClickPrevious}
      />
      <div className="flex w-full flex-1 flex-col gap-6">
        <p className="text-2xl">Commentaires et remarques</p>
        <Label htmlFor="commentaires-servicesFm4All" className="text-base">
          Ajoutez des précisions pour le service fm4all :
        </Label>
        <Textarea
          id="commentaires-servicesFm4All"
          onChange={handleChange}
          className="flex-1 resize-none"
          value={servicesFm4All.infos.commentaires ?? ""}
        />
      </div>
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default PersonnaliserServicesFm4AllCommentaires;
