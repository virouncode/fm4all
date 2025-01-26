import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import Image from "next/image";

type SnacksFruitsFournisseurLogoProps = {
  fournisseurId: number | null;
  nomFournisseur: string | null;
  sloganFournisseur: string | null;
};

const SnackFruitsPropositionLogo = ({
  fournisseurId,
  nomFournisseur,
  sloganFournisseur,
}: SnacksFruitsFournisseurLogoProps) => {
  const logoFournisseurUrl = getLogoFournisseurUrl(fournisseurId);
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex w-1/4 items-center justify-center px-4">
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
        {sloganFournisseur && (
          <TooltipContent>
            <p className="text-sm italic">{sloganFournisseur}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default SnackFruitsPropositionLogo;
