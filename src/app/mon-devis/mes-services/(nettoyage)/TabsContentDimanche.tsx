import { TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/formatNumber";

type TabsContentDimancheProps = {
  formattedNettoyagePropositions: {
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
  }[][];
  selectedDimanchePropositionId: number | null;
  handleClickProposition: (propositionId: number) => void;
};

const TabsContentDimanche = ({
  formattedNettoyagePropositions,
  selectedDimanchePropositionId,
  handleClickProposition,
}: TabsContentDimancheProps) => {
  return (
    <TabsContent value="dimanche" className="flex-1">
      <div className="h-full flex flex-col border rounded-xl overflow-hidden">
        {formattedNettoyagePropositions.length > 0
          ? formattedNettoyagePropositions.map((propositions) => (
              <div
                className="flex border-b flex-1"
                key={propositions[0].fournisseurId}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex w-1/4 items-center justify-center">
                        {propositions[0].nomEntreprise}
                      </div>
                    </TooltipTrigger>
                    {propositions[0].slogan && (
                      <TooltipContent>
                        <p className="text-sm italic">
                          {propositions[0].slogan}
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                {propositions.map((proposition) => {
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
                        selectedDimanchePropositionId === proposition.id
                          ? `bg-${color} border border-destructive`
                          : `bg-${color}/80`
                      } text-slate-200 items-center justify-center  text-2xl gap-4 cursor-pointer hover:bg-${color}`}
                      onClick={() => handleClickProposition(proposition.id)}
                      key={proposition.id}
                    >
                      {/* <Checkbox className="border-primary bg-background data-[state=checked]:bg-background data-[state=checked]:text-foreground" /> */}
                      <div>
                        <p className="font-bold">
                          {formatNumber(proposition.prixAnnuelDimanche)} € / an*
                        </p>
                        <p className="text-sm">
                          1 passage de {proposition.hParPassage / 10000}h en
                          plus
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          : null}
      </div>
    </TabsContent>
  );
};

export default TabsContentDimanche;

//heures  par an = heures par passage * frequence annuelle
//heures  par semaine = heures  par an / (nombre de semaines ouvrées dans l'année: 52.008 = 21.67*12/5)
