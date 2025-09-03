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
  nomFournisseur: string | null;
  slogan: string | null;
  logoUrl: string | null;
  locationUrl: string | null;
  anneeCreation: number | null;
  ca: string | null;
  effectifFournisseur: string | null;
  nbClients: number | null;
  noteGoogle: string | null;
  nbAvis: number | null;
};

const ThePropositionFournisseurLogo = ({
  nomFournisseur,
  slogan,
  logoUrl,
  locationUrl,
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
            {logoUrl ? (
              <div className="relative h-full w-full">
                <Image
                  src={logoUrl}
                  alt={`logo-de-${nomFournisseur}`}
                  fill={true}
                  className="h-full w-full cursor-pointer object-contain"
                  quality={100}
                />
              </div>
            ) : (
              nomFournisseur
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
          <DialogTitle>{nomFournisseur}</DialogTitle>
        </DialogHeader>
        <FournisseurDialog
          sloganFournisseur={slogan}
          logoUrl={logoUrl}
          nomFournisseur={nomFournisseur}
          locationUrl={locationUrl}
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
