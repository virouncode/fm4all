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

type NettoyageMobileFournisseurLogoProps = {
  nomFournisseur: string;
  sloganFournisseur: string | null;
  logoUrl: string | null;
  locationUrl: string | null;
  anneeCreation: number | null;
  effectifFournisseur: string | null;
  nbClients: number | null;
  noteGoogle: string | null;
  nbAvis: number | null;
  ca: string | null;
};

const NettoyageMobileFournisseurLogo = ({
  nomFournisseur,
  sloganFournisseur,
  logoUrl,
  locationUrl,
  anneeCreation,
  effectifFournisseur,
  nbClients,
  noteGoogle,
  nbAvis,
  ca,
}: NettoyageMobileFournisseurLogoProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex w-full h-auto p-2 shadow rounded-xl"
          asChild
          title="Infos sur le fournisseur"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-1 items-center gap-2">
              <p className="text-sm font-bold text-foreground">
                {nomFournisseur}
              </p>
              {logoUrl ? (
                <div className="flex-1 h-10 relative">
                  <Image
                    src={logoUrl}
                    alt={`logo-de-${nomFournisseur}`}
                    fill={true}
                    className="object-contain object-left cursor-pointer"
                    quality={100}
                  />
                </div>
              ) : null}
            </div>

            <SquareArrowOutUpRight
              className="cursor-pointer hover:opacity-70"
              size={64}
              color="#000000"
            />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-5/6 lg:w-auto rounded-xl">
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

export default NettoyageMobileFournisseurLogo;
