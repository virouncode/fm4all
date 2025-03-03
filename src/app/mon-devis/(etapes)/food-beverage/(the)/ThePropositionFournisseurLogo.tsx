import FournisseurDialog from "@/app/mon-devis/FournisseurDialog";
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
        <Button className="flex items-center justify-center p-2 h-1/2 w-full relative bg-transparent hover:bg-transparent shadow-none">
          {logoUrl ? (
            <div className="w-full h-full relative">
              <Image
                src={logoUrl}
                alt={`logo-de-${nomFournisseur}`}
                fill={true}
                className="w-full h-full object-contain cursor-pointer"
                quality={100}
              />
            </div>
          ) : (
            nomFournisseur
          )}
          <SquareArrowOutUpRight
            className="absolute right-0 top-0 cursor-pointer hover:opacity-70"
            size={16}
            color="#000000"
          />
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
