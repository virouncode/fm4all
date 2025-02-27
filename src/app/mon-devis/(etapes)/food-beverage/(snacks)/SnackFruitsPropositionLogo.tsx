import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

type SnacksFruitsFournisseurLogoProps = {
  nomFournisseur: string | null;
  sloganFournisseur: string | null;
  logoUrl: string | null;
};

const SnackFruitsPropositionLogo = ({
  nomFournisseur,
  sloganFournisseur,
  logoUrl,
}: SnacksFruitsFournisseurLogoProps) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex w-1/4 items-center justify-center p-2">
            {logoUrl ? (
              <div className="w-full h-full relative">
                <Image
                  src={logoUrl}
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
          <TooltipContent className="max-w-60">
            <p className="text-sm italic">{sloganFournisseur}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default SnackFruitsPropositionLogo;
