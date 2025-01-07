import { Checkbox } from "@/components/ui/checkbox";
import { TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/formatNumber";

type TabsContentSamediProps = {
  filteredNettoyagePropositions: {
    fournisseurId: number;
    nomEntreprise: string;
    slogan: string | null;
    id: number;
    surface: number;
    gamme: "essentiel" | "confort" | "excellence";
    createdAt: Date;
    hParPassage: number;
    tauxHoraire: number;
    prixAnnuel: number;
    freqAnnuelle: number;
    prixAnnuelSamedi: number;
    prixAnnuelDimanche: number;
  }[];
  selectedSamediPropositionId: number | null;
  handleClickProposition: (propositionId: number) => void;
};

const TabsContentSamedi = ({
  filteredNettoyagePropositions,
  selectedSamediPropositionId,
  handleClickProposition,
}: TabsContentSamediProps) => {
  return (
    <TabsContent value="samedi" className="flex-1">
      <div className="h-full flex flex-col border rounded-xl overflow-hidden">
        <div
          className="flex border-b flex-1"
          key={filteredNettoyagePropositions[0].fournisseurId}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex w-1/4 items-center justify-center">
                  {filteredNettoyagePropositions[0].nomEntreprise}
                </div>
              </TooltipTrigger>
              {filteredNettoyagePropositions[0].slogan && (
                <TooltipContent>
                  <p className="text-sm italic">
                    {filteredNettoyagePropositions[0].slogan}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          {filteredNettoyagePropositions.map((proposition) => {
            const gamme = proposition.gamme;
            const color =
              gamme === "essentiel"
                ? "fm4allessential"
                : gamme === "confort"
                ? "fm4allcomfort"
                : "fm4allexcellence";
            return (
              <div
                className={`flex flex-1 ${
                  selectedSamediPropositionId === proposition.id
                    ? "ring-2 ring-inset ring-destructive"
                    : ""
                } bg-${color} text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer`}
                onClick={() => handleClickProposition(proposition.id)}
                key={proposition.id}
              >
                <Checkbox
                  checked={selectedSamediPropositionId === proposition.id}
                  onCheckedChange={() => handleClickProposition(proposition.id)}
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                />
                <div>
                  <p className="font-bold">
                    {formatNumber(proposition.prixAnnuelSamedi)} € / an*
                  </p>
                  <p className="text-sm">
                    1 passage de {proposition.hParPassage / 10000}h en plus
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TabsContent>
  );
};

export default TabsContentSamedi;

//heures  par an = heures par passage * frequence annuelle
//heures  par semaine = heures  par an / (nombre de semaines ouvrées dans l'année: 52.008 = 21.67*12/5)
