import { IncendieContext } from "@/context/IncendieProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { toast } from "@/hooks/use-toast";
import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites";
import { SelectIncendieTarifsType } from "@/zod-schemas/incendieTarifs";
import { ChangeEvent, useContext } from "react";
import SecuriteIncendieFournisseurLogo from "./SecuriteIncendieFournisseurLogo";
import SecuriteIncendieInputs from "./SecuriteIncendieInputs";
import SecuriteIncendiePropostionCard from "./SecuriteIncendiePropostionCard";

export const MAX_NB_EXTINCTEURS = 100;
export const MAX_NB_BAES = 100;
export const MAX_NB_TEL_BAES = 10;

type SecuriteIncendiePropositionsProps = {
  incendieQuantite: SelectIncendieQuantitesType;
  incendieTarifs: SelectIncendieTarifsType[];
};

const SecuriteIncendiePropositions = ({
  incendieQuantite,
  incendieTarifs,
}: SecuriteIncendiePropositionsProps) => {
  const { incendie, setIncendie } = useContext(IncendieContext);
  const { setTotalIncendie } = useContext(TotalIncendieContext);

  //Calcul des propositions
  const nbExtincteurs =
    incendie.quantites.nbExtincteurs !== null
      ? incendie.quantites.nbExtincteurs
      : incendieQuantite.nbExtincteurs;

  const nbBaes =
    incendie.quantites.nbBaes !== null
      ? incendie.quantites.nbBaes
      : Math.ceil(incendieQuantite.nbExtincteurs * 2.3);

  const nbTelBaes =
    incendie.quantites.nbTelBaes !== null ? incendie.quantites.nbTelBaes : 1;

  const propositions = incendieTarifs.map((tarif) => ({
    id: tarif.id,
    fournisseurId: tarif.fournisseurId,
    nomFournisseur: tarif.nomFournisseur,
    sloganFournisseur: tarif.slogan,
    nbExtincteurs,
    nbBaes,
    nbTelBaes,
    prixParExtincteur: tarif.prixParExtincteur,
    prixParBaes: tarif.prixParBaes,
    prixParTelBaes: tarif.prixParTelBaes,
    totalAnnuelTrilogie:
      nbExtincteurs * tarif.prixParExtincteur +
      nbBaes * tarif.prixParBaes +
      nbTelBaes * tarif.prixParTelBaes,
    fraisDeplacementTrilogie: tarif.fraisDeplacement,
  }));

  const handleClickProposition = (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    nbExtincteurs: number;
    nbBaes: number;
    nbTelBaes: number;
    prixParExtincteur: number;
    prixParBaes: number;
    prixParTelBaes: number;
    totalAnnuelTrilogie: number;
    fraisDeplacementTrilogie: number;
  }) => {
    const {
      fournisseurId,
      nomFournisseur,
      sloganFournisseur,
      nbExtincteurs,
      nbBaes,
      nbTelBaes,
      prixParExtincteur,
      prixParBaes,
      prixParTelBaes,
      totalAnnuelTrilogie,
      fraisDeplacementTrilogie,
    } = proposition;
    if (incendie.infos.fournisseurId === fournisseurId) {
      setIncendie((prev) => ({
        ...prev,
        infos: {
          ...prev.infos,
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
        },
        prix: {
          prixParExtincteur: null,
          prixParBaes: null,
          prixParTelBaes: null,
          prixParExutoire: null,
          prixParExutoireParking: null,
          prixParAlarme: null,
          prixParPorteCoupeFeuBattante: null,
          prixParProteCoupeFeuCoulissante: null,
          prixParRIA: null,
          prixParColonneSecheStatique: null,
          prixParColonneSecheDynamique: null,
          fraisDeplacementTrilogie: null,
          fraisDeplacementExutoires: null,
          fraisDeplacementExutoiresParking: null,
        },
      }));
      setTotalIncendie({
        totalTrilogie: null,
        totalExutoires: null,
        totalExutoiresParking: null,
        totalAlarmes: null,
        totalPortesCoupeFeuBattantes: null,
        totalPortesCoupeFeuCoulissantes: null,
        totalRIA: null,
        totalColonnesSechesStatiques: null,
        totalColonnesSechesDynamiques: null,
        totalDeplacementTrilogie: null,
        totalDeplacementExutoires: null,
        totalDeplacementExutoiresParking: null,
      });
      return;
    }
    setIncendie((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
      },
      quantites: {
        ...prev.quantites,
        nbExtincteurs,
        nbBaes,
        nbTelBaes,
      },
      prix: {
        ...prev.prix,
        prixParExtincteur,
        prixParBaes,
        prixParTelBaes,
        fraisDeplacementTrilogie,
      },
    }));
    setTotalIncendie((prev) => ({
      ...prev,
      totalTrilogie: totalAnnuelTrilogie,
      totalDeplacementTrilogie: fraisDeplacementTrilogie,
    }));
    toast({
      description: `Veillez à (re)-sélectionner vos options de sécurité incendie dans l'étape 6 (Personnaliser)`,
    });
  };

  const handleChangeNbr = (
    e: ChangeEvent<HTMLInputElement>,
    type: "extincteur" | "baes" | "telBaes"
  ) => {
    const value = e.target.value;
    switch (type) {
      case "extincteur":
        // let newNbExtincteurs = value
        //   ? parseInt(value)
        //   : incendieQuantite.nbExtincteurs;
        let newNbExtincteurs = value ? parseInt(value) : 0;

        if (newNbExtincteurs > MAX_NB_EXTINCTEURS)
          newNbExtincteurs = MAX_NB_EXTINCTEURS;
        setIncendie((prev) => ({
          ...prev,
          quantites: { ...prev.quantites, nbExtincteurs: newNbExtincteurs },
        }));
        if (incendie.infos.fournisseurId) {
          const tarifsFournisseur = incendieTarifs.find(
            (tarif) => tarif.fournisseurId === incendie.infos.fournisseurId
          );
          const prixParExtincteur =
            tarifsFournisseur?.prixParExtincteur ?? null;
          const prixParBaes = tarifsFournisseur?.prixParBaes ?? null;
          const prixParTelBaes = tarifsFournisseur?.prixParTelBaes ?? null;
          const totalTrilogie =
            prixParExtincteur !== null &&
            prixParBaes !== null &&
            prixParTelBaes !== null
              ? newNbExtincteurs * prixParExtincteur +
                nbBaes * prixParBaes +
                nbTelBaes * prixParTelBaes
              : null;

          setTotalIncendie((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        return;
      case "baes":
        // let newNbBaes = value
        //   ? parseInt(value)
        //   : Math.ceil(incendieQuantite.nbExtincteurs * 2.3);
        let newNbBaes = value ? parseInt(value) : 0;

        if (newNbBaes > MAX_NB_BAES) newNbBaes = MAX_NB_BAES;
        setIncendie((prev) => ({
          ...prev,
          quantites: { ...prev.quantites, nbBaes: newNbBaes },
        }));
        if (incendie.infos.fournisseurId) {
          const tarifsFournisseur = incendieTarifs.find(
            (tarif) => tarif.fournisseurId === incendie.infos.fournisseurId
          );
          const prixParExtincteur =
            tarifsFournisseur?.prixParExtincteur ?? null;
          const prixParBaes = tarifsFournisseur?.prixParBaes ?? null;
          const prixParTelBaes = tarifsFournisseur?.prixParTelBaes ?? null;
          const totalTrilogie =
            prixParExtincteur !== null &&
            prixParBaes !== null &&
            prixParTelBaes !== null
              ? nbExtincteurs * prixParExtincteur +
                newNbBaes * prixParBaes +
                nbTelBaes * prixParTelBaes
              : null;
          setTotalIncendie((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        return;
      case "telBaes":
        // let newNbTelBaes = value ? parseInt(value) : 1;
        let newNbTelBaes = value ? parseInt(value) : 0;

        if (newNbTelBaes > MAX_NB_TEL_BAES) newNbTelBaes = MAX_NB_TEL_BAES;
        setIncendie((prev) => ({
          ...prev,
          quantites: { ...prev.quantites, nbTelBaes: newNbTelBaes },
        }));
        if (incendie.infos.fournisseurId) {
          const tarifsFournisseur = incendieTarifs.find(
            (tarif) => tarif.fournisseurId === incendie.infos.fournisseurId
          );
          const prixParExtincteur =
            tarifsFournisseur?.prixParExtincteur ?? null;
          const prixParBaes = tarifsFournisseur?.prixParBaes ?? null;
          const prixParTelBaes = tarifsFournisseur?.prixParTelBaes ?? null;
          const totalTrilogie =
            prixParExtincteur !== null &&
            prixParBaes !== null &&
            prixParTelBaes !== null
              ? nbExtincteurs * prixParExtincteur +
                nbBaes * prixParBaes +
                newNbTelBaes * prixParTelBaes
              : null;
          setTotalIncendie((prev) => ({
            ...prev,
            totalTrilogie,
          }));
        }
        return;
    }
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-auto">
      {propositions.length > 0 &&
        propositions.map((proposition) => (
          <div className="flex border-b flex-1" key={proposition.id}>
            <div className="flex w-1/4 items-center justify-between flex-col gap-10 p-4">
              <SecuriteIncendieFournisseurLogo
                fournisseurId={proposition.fournisseurId}
                nomFournisseur={proposition.nomFournisseur}
                sloganFournisseur={proposition.sloganFournisseur}
              />
              <SecuriteIncendieInputs
                nbExtincteurs={nbExtincteurs}
                nbBaes={nbBaes}
                nbTelBaes={nbTelBaes}
                handleChangeNbr={handleChangeNbr}
                incendieQuantite={incendieQuantite}
              />
              <p className="text-xs text-fm4alldestructive italic px-2 text-center">
                Les quantités sont estimées pour vous mais vous pouvez les
                changer
              </p>
            </div>
            <SecuriteIncendiePropostionCard
              proposition={proposition}
              handleClickProposition={handleClickProposition}
            />
          </div>
        ))}
    </div>
  );
};

export default SecuriteIncendiePropositions;
