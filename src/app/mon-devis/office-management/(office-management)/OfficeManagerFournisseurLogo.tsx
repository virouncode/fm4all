import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import Image from "next/image";

type OfficeManagerFournisseurLogoProps = {
  fournisseurId: number | null;
  nomFournisseur: string | null;
  sloganFournisseur: string | null;
};

const OfficeManagerFournisseurLogo = ({
  fournisseurId,
  nomFournisseur,
  sloganFournisseur,
}: OfficeManagerFournisseurLogoProps) => {
  const logoFournisseurUrl = getLogoFournisseurUrl(fournisseurId);
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center p-4 h-1/2 w-full">
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

export default OfficeManagerFournisseurLogo;
