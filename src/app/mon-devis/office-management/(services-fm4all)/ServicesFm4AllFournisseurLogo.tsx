import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import Image from "next/image";

const ServicesFm4AllFournisseurLogo = () => {
  const logoFournisseurUrl = getLogoFournisseurUrl(15);
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex w-1/4 items-center justify-center p-4">
            {logoFournisseurUrl ? (
              <div className="w-full h-full relative">
                <Image
                  src={logoFournisseurUrl}
                  alt={`logo-de-fm4All`}
                  fill={true}
                  className="w-full h-full object-contain"
                  quality={100}
                />
              </div>
            ) : (
              "FM4ALL"
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm italic">Le Facility Management pour tous</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ServicesFm4AllFournisseurLogo;
