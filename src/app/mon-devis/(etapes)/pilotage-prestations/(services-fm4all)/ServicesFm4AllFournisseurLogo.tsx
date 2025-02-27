import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

const ServicesFm4AllFournisseurLogo = () => {
  const logoFournisseurUrl =
    "https://6njvcatb4pcugmyl.public.blob.vercel-storage.com/logos_fournisseurs/logo_full-9pR7O9U3ZmYUyrsH9plouCrF6ZIQmH.webp";
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
        <TooltipContent className="max-w-60">
          <p className="text-sm italic">Le Facility Management pour tous</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ServicesFm4AllFournisseurLogo;
