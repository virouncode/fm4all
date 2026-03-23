import PrestataireDialog from "@/app/[locale]/(main)/(application)/devis/PrestataireDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SquareArrowOutUpRight } from "lucide-react";
import Image from "next/image";

type SecuriteIncendiePrestataireLogoProps = {
  nomPrestataire: string | null;
  sloganPrestataire: string | null;
  logoStorageKey: string | null;
  anneeCreation: number | null;
  ca: string | null;
  effectifPrestataire: string | null;
  nbClients: number | null;
  noteGoogle: string | null;
  nbAvis: number | null;
};

const SecuriteIncendiePrestataireLogo = ({
  nomPrestataire,
  sloganPrestataire,
  logoStorageKey,
  anneeCreation,
  ca,
  effectifPrestataire,
  nbClients,
  noteGoogle,
  nbAvis,
}: SecuriteIncendiePrestataireLogoProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative flex h-1/4 w-full cursor-pointer items-center justify-center p-2">
          {logoStorageKey ? (
            <div className="relative h-full w-full">
              <Image
                src={logoStorageKey}
                alt={`logo-de-${nomPrestataire}`}
                fill
                className="h-full w-full object-contain"
                sizes="(min-width:768px) 100vw"
              />
            </div>
          ) : (
            nomPrestataire
          )}
          <SquareArrowOutUpRight
            className="absolute top-0 right-0 hover:opacity-70"
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

export default SecuriteIncendiePrestataireLogo;
