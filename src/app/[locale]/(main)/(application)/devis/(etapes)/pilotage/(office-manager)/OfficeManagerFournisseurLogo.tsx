import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

type OfficeManagerFournisseurLogoProps = {
  nomPrestataire: string | null;
  sloganPrestataire: string | null;
  logoStorageKey: string | null;
};

const OfficeManagerFournisseurLogo = ({
  nomPrestataire,
  sloganPrestataire,
  logoStorageKey,
}: OfficeManagerFournisseurLogoProps) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex h-1/2 w-full items-center justify-center p-4">
            {logoStorageKey ? (
              <div className="relative h-full w-full">
                <Image
                  src={logoStorageKey}
                  alt={`logo-de-${nomPrestataire}`}
                  fill={true}
                  className="h-full w-full object-contain"
                  sizes="(min-width:768px) 100vw"
                />
              </div>
            ) : (
              nomPrestataire
            )}
          </div>
        </TooltipTrigger>
        {sloganPrestataire && (
          <TooltipContent className="max-w-60">
            <p className="text-sm italic">{sloganPrestataire}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default OfficeManagerFournisseurLogo;
