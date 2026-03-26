import PresignedLogoImage from "@/components/devis/PresignedLogoImage";
import StarRating from "@/components/star/StarRating";
import { useTranslations } from "next-intl";
import Image from "next/image";

type PrestataireDialogProps = {
  logoStorageKey: string | null;
  darkLogoUrl?: string | null;
  sloganPrestataire: string | null;
  presentation?: string | null;
  nomPrestataire: string | null;
  anneeCreation: number | null;
  ca: string | null;
  effectifPrestataire: string | null;
  nbClients: number | null;
  noteGoogle: string | null;
  nbAvis: number | null;
};

const PrestataireDialog = ({
  logoStorageKey,
  darkLogoUrl,
  sloganPrestataire,
  presentation,
  nomPrestataire,
  anneeCreation,
  ca,
  effectifPrestataire,
  nbClients,
  noteGoogle,
  nbAvis,
}: PrestataireDialogProps) => {
  const t = useTranslations("DevisPage");
  return (
    <div className="flex flex-col gap-2 text-sm">
      <p className="italic">{sloganPrestataire}</p>
      {nomPrestataire === "CASTALIE" && (
        <p>
          {t(
            "entreprise-francaise-leader-sur-son-marche-souhaitant-travailler-en-marque-blanche",
          )}
        </p>
      )}
      {logoStorageKey ? (
        <div className="relative h-[50px] w-full">
          <PresignedLogoImage
            storageKey={logoStorageKey}
            alt={`logo-de-${nomPrestataire}`}
            className={`object-contain ${nomPrestataire === "CASTALIE" ? "blur-lg" : ""} ${darkLogoUrl ? "dark:hidden" : ""}`}
            sizes="(max-width:768px) 25vw, 100vw"
          />
          {darkLogoUrl && (
            <Image
              src={darkLogoUrl}
              alt={`logo-de-${nomPrestataire}`}
              fill
              className={`hidden object-contain dark:block ${nomPrestataire === "CASTALIE" ? "blur-lg" : ""}`}
              sizes="(max-width:768px) 25vw, 100vw"
            />
          )}
        </div>
      ) : null}
      {presentation && (
        <p className="my-6 text-wrap hyphens-auto whitespace-pre">
          {presentation}
        </p>
      )}
      <p>
        {t("annee-de-creation")} {anneeCreation}
      </p>
      <p>
        {t("chiffre-d-affaires")} {ca}
      </p>
      <p>
        {t("effectif")} {effectifPrestataire}
      </p>
      <p>
        {t("nombre-de-clients")} {nbClients}
      </p>
      {noteGoogle ? (
        <div className="flex items-center gap-2">
          {t("avis-google")} {noteGoogle}{" "}
          <StarRating score={parseFloat(noteGoogle.replace(",", "."))} /> (
          {nbAvis})
        </div>
      ) : null}
    </div>
  );
};

export default PrestataireDialog;
