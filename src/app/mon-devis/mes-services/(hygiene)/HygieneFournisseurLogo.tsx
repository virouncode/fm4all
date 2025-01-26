"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HygieneContext } from "@/context/HygieneProvider";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import Image from "next/image";
import { useContext } from "react";

const HygieneFournisseurLogo = () => {
  const { hygiene } = useContext(HygieneContext);
  const logoFournisseurUrl = getLogoFournisseurUrl(hygiene.infos.fournisseurId);
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center h-1/4 w-full">
            {logoFournisseurUrl ? (
              <div className="w-full h-full relative">
                <Image
                  src={logoFournisseurUrl}
                  alt={`logo-de-${hygiene.infos.nomFournisseur}`}
                  fill={true}
                  className="w-full h-full object-contain"
                  quality={100}
                />
              </div>
            ) : (
              hygiene.infos.nomFournisseur
            )}
          </div>
        </TooltipTrigger>
        {hygiene.infos.sloganFournisseur && (
          <TooltipContent>
            <p className="text-sm italic">{hygiene.infos.sloganFournisseur}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default HygieneFournisseurLogo;
