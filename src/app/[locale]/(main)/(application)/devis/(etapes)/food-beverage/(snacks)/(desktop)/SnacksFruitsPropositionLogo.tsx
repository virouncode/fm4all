import PrestataireDialog from "@/app/[locale]/(main)/(application)/devis/PrestataireDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PresignedLogoImage from "@/components/devis/PresignedLogoImage";
import { SquareArrowOutUpRight } from "lucide-react";

type SnacksFruitsPropositionLogoProps = {
  nomPrestataire: string | null;
  logoStorageKey: string | null;
  sloganPrestataire: string | null;
  anneeCreation: number | null;
  ca: string | null;
  effectifPrestataire: string | null;
  nbClients: number | null;
  noteGoogle: string | null;
  nbAvis: number | null;
};

const SnacksFruitsPropositionLogo = ({
  nomPrestataire,
  logoStorageKey,
  sloganPrestataire,
  anneeCreation,
  ca,
  effectifPrestataire,
  nbClients,
  noteGoogle,
  nbAvis,
}: SnacksFruitsPropositionLogoProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative flex h-full w-1/4 items-center justify-center p-2">
          {logoStorageKey ? (
            <div className="relative h-full w-full">
              <PresignedLogoImage
                storageKey={logoStorageKey}
                alt={`logo-de-${nomPrestataire}`}
                className="h-full w-full cursor-pointer object-contain"
                sizes="(min-width:768px) 100vw"
              />
            </div>
          ) : (
            nomPrestataire
          )}
          <SquareArrowOutUpRight
            className="absolute top-2 right-2 cursor-pointer hover:opacity-70"
            size={16}
            color="#000000"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{nomPrestataire}</DialogTitle>
        </DialogHeader>
        <PrestataireDialog
          sloganPrestataire={sloganPrestataire}
          logoStorageKey={logoStorageKey}
          nomPrestataire={nomPrestataire}
          locationUrl={null}
          anneeCreation={anneeCreation}
          ca={ca}
          effectifPrestataire={effectifPrestataire}
          nbClients={nbClients}
          noteGoogle={noteGoogle}
          nbAvis={nbAvis}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SnacksFruitsPropositionLogo;
