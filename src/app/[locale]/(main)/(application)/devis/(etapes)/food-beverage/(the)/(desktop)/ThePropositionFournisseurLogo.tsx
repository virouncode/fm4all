import FournisseurDialog from "@/app/[locale]/(main)/(application)/devis/FournisseurDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SquareArrowOutUpRight } from "lucide-react";
import Image from "next/image";

type ThePropositionsProps = {
  nomPrestataire: string | null;
  slogan: string | null;
  logoStorageKey: string | null;
  anneeCreation: number | null;
  ca: string | null;
  effectifFournisseur: string | null;
  nbClients: number | null;
  noteGoogle: string | null;
  nbAvis: number | null;
};

const ThePropositionFournisseurLogo = ({
  nomPrestataire,
  slogan,
  logoStorageKey,
  anneeCreation,
  ca,
  effectifFournisseur,
  nbClients,
  noteGoogle,
  nbAvis,
}: ThePropositionsProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="relative flex h-1/2 w-full items-center justify-center bg-transparent p-2 shadow-none hover:bg-transparent"
          asChild
          title="Infos sur le fournisseur"
        >
          <div>
            {logoStorageKey ? (
              <div className="relative h-full w-full">
                <Image
                  src={logoStorageKey}
                  alt={`logo-de-${nomPrestataire}`}
                  fill
                  className="h-full w-full cursor-pointer object-contain"
                  sizes="(min-width:768px) 100vw"
                />
              </div>
            ) : (
              nomPrestataire
            )}
            <SquareArrowOutUpRight
              className="absolute top-0 right-0 cursor-pointer hover:opacity-70"
              size={16}
              color="#000000"
            />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{nomPrestataire}</DialogTitle>
        </DialogHeader>
        <FournisseurDialog
          sloganPrestataire={slogan}
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

export default ThePropositionFournisseurLogo;
