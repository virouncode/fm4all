"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import Image from "next/image";

type MaintenanceFournisseurLogoProps = {
  fournisseurId: number | null;
  nomFournisseur: string | null;
  sloganFournisseur: string | null;
};

const MaintenanceFournisseurLogo = ({
  fournisseurId,
  nomFournisseur,
  sloganFournisseur,
}: MaintenanceFournisseurLogoProps) => {
  const logoFournisseurUrl = getLogoFournisseurUrl(fournisseurId);
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex w-1/4 items-center justify-center p-4">
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
          <TooltipContent className="max-w-60">
            <p className="text-sm italic">{sloganFournisseur}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default MaintenanceFournisseurLogo;
