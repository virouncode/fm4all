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
          className="flex h-auto w-full rounded-xl p-2 shadow"
          asChild
          title="Infos sur le fournisseur"
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
              <p className="text-sm font-bold text-foreground">
                {nomFournisseur}
              </p>
              {logoUrl ? (
                <div className="relative h-10 flex-1">
                  <Image
                    src={logoUrl}
                    alt={`logo-de-${nomFournisseur}`}
                    fill={true}
                    className="cursor-pointer object-contain object-left"
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
      <DialogContent className="w-5/6 rounded-xl sm:max-w-[425px] lg:w-auto">
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
