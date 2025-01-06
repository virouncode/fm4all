import { Checkbox } from "@/components/ui/checkbox";
import { TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/formatNumber";

type TabsContentRepasseProps = {
  filteredRepassePropositions: {
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
  }[];
  selectedRepassePropositionId: number | null;
  handleClickProposition: (propositionId: number) => void;
};

const TabsContentRepasse = ({
  filteredRepassePropositions,
  selectedRepassePropositionId,
  handleClickProposition,
}: TabsContentRepasseProps) => {
  return (
    <TabsContent value="repasse" className="flex-1">
      <div className="h-full flex flex-col border rounded-xl overflow-hidden">
        <div
          className="flex border-b flex-1"
          key={filteredRepassePropositions[0].fournisseurId}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex w-1/4 items-center justify-center">
                  {filteredRepassePropositions[0].nomEntreprise}
                </div>
              </TooltipTrigger>
              {filteredRepassePropositions[0].slogan && (
                <TooltipContent>
                  <p className="text-sm italic">
                    {filteredRepassePropositions[0].slogan}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          {filteredRepassePropositions.map((proposition) => {
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
                  selectedRepassePropositionId === proposition.id
                    ? "border-2 border-destructive"
                    : ""
                } bg-${color} text-slate-200 items-center justify-center text-2xl gap-4 cursor-pointer`}
                onClick={() => handleClickProposition(proposition.id)}
                key={proposition.id}
              >
                <Checkbox
                  checked={selectedRepassePropositionId === proposition.id}
                  onCheckedChange={() => handleClickProposition(proposition.id)}
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                />
                <div>
                  <p className="font-bold">
                    {formatNumber(proposition.prixAnnuel)} € / an
                  </p>
                  <p className="text-base">
                    {formatNumber(
                      ((proposition.hParPassage / 10000) *
                        proposition.freqAnnuelle) /
                        10000 /
                        52.008
                    )}{" "}
                    h / semaine en plus*
                  </p>
                  <p className="text-xs">
                    {formatNumber(proposition.freqAnnuelle / (10000 * 52.008))}{" "}
                    passage(s) de {proposition.hParPassage / 10000}h / semaine
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

export default TabsContentRepasse;
