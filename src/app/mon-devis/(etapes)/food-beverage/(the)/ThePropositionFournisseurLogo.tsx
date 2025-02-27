import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

type ThePropositionsProps = {
  nomFournisseur: string | null;
  slogan: string | null;
  logoUrl: string | null;
};

const ThePropositionFournisseurLogo = ({
  nomFournisseur,
  slogan,
  logoUrl,
}: ThePropositionsProps) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center h-1/4 w-full">
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
        {slogan && (
          <TooltipContent className="max-w-60">
            <p className="text-sm italic">{slogan}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThePropositionFournisseurLogo;
