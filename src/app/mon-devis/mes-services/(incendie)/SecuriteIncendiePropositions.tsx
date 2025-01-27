import { IncendieContext } from "@/context/IncendieProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites";
import { SelectIncendieTarifsType } from "@/zod-schemas/incendieTarifs";
import { ChangeEvent, useContext } from "react";
import SecuriteIncendieFournisseurLogo from "./SecuriteIncendieFournisseurLogo";
import SecuriteIncendieInputs from "./SecuriteIncendieInputs";
import SecuriteIncendiePropostionCard from "./SecuriteIncendiePropostionCard";

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
    incendie.quantites.nbExtincteurs || incendieQuantite.nbExtincteurs;
  const nbBaes =
    incendie.quantites.nbBaes ||
    Math.ceil(incendieQuantite.nbExtincteurs * 2.3);
  const nbTelBaes = incendie.quantites.nbTelBaes || 1;

  const propositions = incendieTarifs.map((tarif) => ({
    id: tarif.id,
    fournisseurId: tarif.fournisseurId,
    nomFournisseur: tarif.nomFournisseur,
    sloganFournisseur: tarif.slogan,
    prixAnnuel: Math.round(
      nbExtincteurs * tarif.prixParExtincteur +
        nbBaes * tarif.prixParBaes +
        nbTelBaes * tarif.prixParTelBaes +
        tarif.fraisDeplacement
    ),
  }));

  const handleClickProposition = (proposition: {
    id: number;
    fournisseurId: number;
    nomFournisseur: string;
    sloganFournisseur: string | null;
    prixAnnuel: number;
  }) => {
    const { fournisseurId, nomFournisseur, sloganFournisseur, prixAnnuel } =
      proposition;
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
          fraisDeplacement: null,
        },
      }));
      setTotalIncendie({
        totalService: null,
      });
      return;
    }
    const incendieTarifsFournisseur = incendieTarifs.find(
      (tarif) => tarif.fournisseurId === fournisseurId
    );
    setIncendie((prev) => ({
      ...prev,
      infos: {
        ...prev.infos,
        fournisseurId,
        nomFournisseur,
        sloganFournisseur,
      },
      prix: {
        prixParExtincteur: incendieTarifsFournisseur?.prixParExtincteur ?? null,
        prixParBaes: incendieTarifsFournisseur?.prixParBaes ?? null,
        prixParTelBaes: incendieTarifsFournisseur?.prixParTelBaes ?? null,
        fraisDeplacement: incendieTarifsFournisseur?.fraisDeplacement ?? null,
      },
    }));
    setTotalIncendie({
      totalService: prixAnnuel,
    });
  };

  const handleChangeNbr = (
    e: ChangeEvent<HTMLInputElement>,
    type: "extincteur" | "baes" | "telBaes"
  ) => {
    const value = e.target.value;
    switch (type) {
      case "extincteur":
        const newNbExtincteurs = value
          ? parseInt(value)
          : incendieQuantite.nbExtincteurs;
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
          const fraisDeplacement = tarifsFournisseur?.fraisDeplacement ?? null;
          const totalService =
            prixParExtincteur !== null &&
            prixParBaes !== null &&
            prixParTelBaes !== null &&
            fraisDeplacement !== null
              ? Math.round(
                  newNbExtincteurs * prixParExtincteur +
                    nbBaes * prixParBaes +
                    nbTelBaes * prixParTelBaes +
                    fraisDeplacement
                )
              : null;
          setTotalIncendie({
            totalService,
          });
        }
        return;
      case "baes":
        const newNbBaes = value
          ? parseInt(value)
          : incendieQuantite.nbExtincteurs * 2.3;
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
          const fraisDeplacement = tarifsFournisseur?.fraisDeplacement ?? null;
          const totalService =
            prixParExtincteur !== null &&
            prixParBaes !== null &&
            prixParTelBaes !== null &&
            fraisDeplacement !== null
              ? Math.round(
                  nbExtincteurs * prixParExtincteur +
                    newNbBaes * prixParBaes +
                    nbTelBaes * prixParTelBaes +
                    fraisDeplacement
                )
              : null;
          setTotalIncendie({
            totalService,
          });
        }
        return;
      case "telBaes":
        const newNbTelBaes = value ? parseInt(value) : 1;
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
          const fraisDeplacement = tarifsFournisseur?.fraisDeplacement ?? null;
          const totalService =
            prixParExtincteur !== null &&
            prixParBaes !== null &&
            prixParTelBaes !== null &&
            fraisDeplacement !== null
              ? Math.round(
                  nbExtincteurs * prixParExtincteur +
                    nbBaes * prixParBaes +
                    newNbTelBaes * prixParTelBaes +
                    fraisDeplacement
                )
              : null;
          setTotalIncendie({
            totalService,
          });
        }
        return;
    }
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
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
              <p className="text-xs text-destructive italic px-2 text-center">
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
