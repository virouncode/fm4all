import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

type FontaineEspacePropositionFournisseurLogoProps = {
  fournisseurId: number | null;
  nomFournisseur: string | null;
  sloganFournisseur: string | null;
  logoUrl: string | null;
};

const FontaineEspacePropositionFournisseurLogo = ({
  fournisseurId,
  nomFournisseur,
  sloganFournisseur,
  logoUrl,
}: FontaineEspacePropositionFournisseurLogoProps) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex w-1/4 items-center justify-center p-2">
            {logoUrl ? (
              <div
                className={`w-full h-full relative ${
                  fournisseurId === 13 ? "blur-lg" : ""
                }`}
              >
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
            <p className="text-sm italic">
              {fournisseurId === 13
                ? "Entreprise française leader sur son marché souhaitant travailler en marque blache"
                : sloganFournisseur}
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default FontaineEspacePropositionFournisseurLogo;
