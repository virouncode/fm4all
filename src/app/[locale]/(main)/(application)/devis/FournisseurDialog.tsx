import StarRating from "@/components/star/StarRating";
import { useTranslations } from "next-intl";
import Image from "next/image";

type FournisseurDialogProps = {
  logoUrl: string | null;
  darkLogoUrl?: string | null;
  sloganFournisseur: string | null;
  presentation?: string | null;
  locationUrl: string | null;
  nomFournisseur: string | null;
  anneeCreation: number | null;
  ca: string | null;
  effectif: string | null;
  nbClients: number | null;
  noteGoogle: string | null;
  nbAvis: number | null;
};

const FournisseurDialog = ({
  logoUrl,
  darkLogoUrl,
  locationUrl,
  sloganFournisseur,
  presentation,
  nomFournisseur,
  anneeCreation,
  ca,
  effectif,
  nbClients,
  noteGoogle,
  nbAvis,
}: FournisseurDialogProps) => {
  const t = useTranslations("DevisPage");
  // const [score, setScore] = useState(0);
  // const [nbOfReviews, setNbOfReviews] = useState(0);
  // const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const fetchReviews = async () => {
  //     try {
  //       if (!locationUrl) return;
  //       setLoading(true);
  //       const response = await fetch("/api/google-reviews", {
  //         method: "POST",
  //         body: JSON.stringify({
  //           locationUrl,
  //         }),
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });
  //       const data = (await response.json()).data;
  //       if (data) {
  //         setScore(data[0].totalScore);
  //         setNbOfReviews(data.length);
  //       }
  //       setLoading(false);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };
  //   fetchReviews();
  // }, [locationUrl]);
  return (
    <div className="flex flex-col gap-2 text-sm">
      <p className="italic">{sloganFournisseur}</p>
      {nomFournisseur === "CASTALIE" && (
        <p>
          {t(
            "entreprise-francaise-leader-sur-son-marche-souhaitant-travailler-en-marque-blanche",
          )}
        </p>
      )}
      {logoUrl ? (
        <div className="relative h-[50px] w-full">
          <Image
            src={logoUrl}
            alt={`logo-de-${nomFournisseur}`}
            fill
            className={`object-contain ${nomFournisseur === "CASTALIE" ? "blur-lg" : ""} ${darkLogoUrl ? "dark:hidden" : ""}`}
            sizes="(max-width:768px) 25vw, 100vw"
          />
          {darkLogoUrl && (
            <Image
              src={darkLogoUrl}
              alt={`logo-de-${nomFournisseur}`}
              fill
              className={`hidden object-contain dark:block ${nomFournisseur === "CASTALIE" ? "blur-lg" : ""}`}
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
        {t("effectif")} {effectif}
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

export default FournisseurDialog;
