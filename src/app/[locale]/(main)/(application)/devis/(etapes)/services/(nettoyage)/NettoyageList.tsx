"use client";
import { setOffreDansPanierAction } from "@/actions/panierActions";
import { toast } from "@/hooks/use-toast";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { useOptimistic, useState, useTransition } from "react";
import NettoyageFournisseurLogo from "./(desktop)/NettoyageFournisseurLogo";
import NettoyagePropositionCard from "./(desktop)/NettoyagePropositionCard";

type NettoyageLineType = {
  propositions: {
    id: number | undefined;
    logoUrl: string | null;
    freqAnnuelle: number | null;
    hParPassage: number;
    gamme: "essentiel" | "confort" | "excellence";
    totalAnnuel: number | null;
  }[];
  fournisseur: SelectFournisseurType | null | undefined;
};

type NettoyageListProps = {
  lines: NettoyageLineType[];
  initialSelectedId?: string;
};

const NettoyageList = ({ lines, initialSelectedId }: NettoyageListProps) => {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialSelectedId,
  );
  const [optimisticSelectedId, setOptimisticSelectedId] =
    useOptimistic(selectedId);

  const [isPending, startTransition] = useTransition();

  const onToggle = async (id?: string) => {
    if (!id || isPending) return;
    const next = optimisticSelectedId === id ? undefined : id;

    startTransition(() => {
      setOptimisticSelectedId(next);
    });
    try {
      const res = await setOffreDansPanierAction({
        offreId: id,
        quantite: next ? 1 : 0,
        categorieId: "Nettoyage",
      });
      setSelectedId(next);
      await fetch("/api/panier/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ panierId: res?.data?.panierId }),
        keepalive: true,
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue, veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {lines.map(
        (line) =>
          line.fournisseur &&
          line.propositions.length > 0 && (
            <div className="flex flex-1 border-b" key={line.fournisseur?.id}>
              <NettoyageFournisseurLogo {...line.fournisseur} />
              {line.propositions.map((p) => (
                <NettoyagePropositionCard
                  key={p.id}
                  proposition={p}
                  selectedId={optimisticSelectedId}
                  onToggle={onToggle}
                  isPending={isPending}
                />
              ))}
            </div>
          ),
      )}
    </>
  );
};

export default NettoyageList;
