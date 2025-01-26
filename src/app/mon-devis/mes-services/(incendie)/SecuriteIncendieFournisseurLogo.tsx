import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import Image from "next/image";

type SecuriteIncendieFournisseurLogoProps = {
  fournisseurId: number | null;
  nomFournisseur: string | null;
  sloganFournisseur: string | null;
};

const SecuriteIncendieFournisseurLogo = ({
  fournisseurId,
  nomFournisseur,
  sloganFournisseur,
}: SecuriteIncendieFournisseurLogoProps) => {
  const logoFournisseurUrl = getLogoFournisseurUrl(fournisseurId);
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center h-1/4 w-full">
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
        <TooltipContent>
          <p className="text-sm italic">{sloganFournisseur}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SecuriteIncendieFournisseurLogo;
