import StarRating from "@/components/star-rating";
import Image from "next/image";

type FournisseurDialogProps = {
  logoUrl: string | null;
  sloganFournisseur: string | null;
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
  locationUrl,
  sloganFournisseur,
  nomFournisseur,
  anneeCreation,
  ca,
  effectif,
  nbClients,
  noteGoogle,
  nbAvis,
}: FournisseurDialogProps) => {
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
          Entreprise française leader sur son marché souhaitant travailler en
          marque blanche
        </p>
      )}
      {logoUrl ? (
        <div className="w-full h-[50px] relative">
          <Image
            src={logoUrl}
            alt={`logo-de-${nomFournisseur}`}
            fill={true}
            className={`object-contain ${
              nomFournisseur === "CASTALIE" ? "blur-lg" : ""
            }`}
            quality={100}
          />
        </div>
      ) : null}
      <p>Année de création : {anneeCreation}</p>
      <p>Chiffre d&apos;affaires : {ca}</p>
      <p>Effectif : {effectif}</p>
      <p>Nombre de clients : {nbClients}</p>
      {noteGoogle ? (
        <div className="flex items-center gap-2">
          Avis Google : {noteGoogle}{" "}
          <StarRating score={parseFloat(noteGoogle.replace(",", "."))} /> (
          {nbAvis})
        </div>
      ) : null}
    </div>
  );
};

export default FournisseurDialog;
