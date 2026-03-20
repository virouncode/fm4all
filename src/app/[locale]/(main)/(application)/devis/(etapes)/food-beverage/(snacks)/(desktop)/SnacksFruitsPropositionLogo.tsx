import FournisseurDialog from "@/app/[locale]/(main)/(application)/devis/FournisseurDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SquareArrowOutUpRight } from "lucide-react";
import Image from "next/image";

type SnacksFruitsPropositionLogoProps = {
  nomPrestataire: string | null;
  logoStorageKey: string | null;
  sloganPrestataire: string | null;
  anneeCreation: number | null;
  ca: string | null;
  effectifFournisseur: string | null;
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
  effectifFournisseur,
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
              <Image
                src={logoStorageKey}
                alt={`logo-de-${nomPrestataire}`}
                fill={true}
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
        <FournisseurDialog
          sloganPrestataire={sloganPrestataire}
          logoStorageKey={logoStorageKey}
          nomPrestataire={nomPrestataire}
          locationUrl={null}
          anneeCreation={anneeCreation}
          ca={ca}
          effectif={effectifFournisseur}
          nbClients={nbClients}
          noteGoogle={noteGoogle}
          nbAvis={nbAvis}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SnacksFruitsPropositionLogo;
