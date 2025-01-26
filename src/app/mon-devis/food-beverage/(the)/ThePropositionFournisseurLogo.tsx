import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import Image from "next/image";

type ThePropositionsProps = {
  fournisseurId: number | null;
  nomFournisseur: string | null;
  slogan: string | null;
};

const ThePropositionFournisseurLogo = ({
  fournisseurId,
  nomFournisseur,
  slogan,
}: ThePropositionsProps) => {
  const logoFournisseurUrl = getLogoFournisseurUrl(fournisseurId);
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center h-1/4 w-full py-2 px-4">
            {logoFournisseurUrl ? (
              <div className="w-full h-full relative">
                <Image
                  src={logoFournisseurUrl}
                  alt={`logo-de-${nomFournisseur}`}
                  fill={true}
                  className="w-full h-full object-contain"
                  quality={100}
                />
              </div>
            ) : (
              nomFournisseur
            )}
          </div>
        </TooltipTrigger>
        {slogan && (
          <TooltipContent>
            <p className="text-sm italic">{slogan}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThePropositionFournisseurLogo;
