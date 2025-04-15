"use client";
import FournisseurDialog from "@/app/[locale]/(site)/devis/FournisseurDialog";
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
type HygieneFournisseurLogoProps = {
  nomFournisseur: string | null;
  logoUrl: string | null;
  locationUrl: string | null;
  sloganFournisseur: string | null;
  anneeCreation: number | null;
  ca: string | null;
  effectifFournisseur: string | null;
  nbClients: number | null;
  noteGoogle: string | null;
  nbAvis: number | null;
};

const HygieneFournisseurLogo = ({
  nomFournisseur,
  logoUrl,
  locationUrl,
  sloganFournisseur,
  anneeCreation,
  ca,
  effectifFournisseur,
  nbClients,
  noteGoogle,
  nbAvis,
}: HygieneFournisseurLogoProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="flex items-center justify-center p-2 h-1/4 w-full relative bg-transparent hover:bg-transparent shadow-none"
          asChild
          title="Infos sur le fournisseur"
        >
          <div>
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
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{nomFournisseur}</DialogTitle>
        </DialogHeader>
        <FournisseurDialog
          sloganFournisseur={sloganFournisseur}
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

export default HygieneFournisseurLogo;
