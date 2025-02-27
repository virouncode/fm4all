"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HygieneContext } from "@/context/HygieneProvider";
import Image from "next/image";
import { useContext } from "react";

const HygieneFournisseurLogo = () => {
  const { hygiene } = useContext(HygieneContext);
  const logoUrl = hygiene.infos.logoUrl;
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center h-1/4 w-full">
            {logoUrl ? (
              <div className="w-full h-full relative">
                <Image
                  src={logoUrl}
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
          <TooltipContent className="max-w-60">
            <p className="text-sm italic">{hygiene.infos.sloganFournisseur}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default HygieneFournisseurLogo;
