import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IncendieContext } from "@/context/IncendieProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { getLogoFournisseurUrl } from "@/lib/logosFournisseursMapping";
import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites";
import { SelectIncendieTarifsType } from "@/zod-schemas/incendieTarifs";
import Image from "next/image";
import { ChangeEvent, useContext } from "react";

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
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
        },
        prix: {
          prixParExtincteur: 0,
          prixParBaes: 0,
          prixParTelBaes: 0,
          fraisDeplacement: 0,
        },
      }));
      setTotalIncendie({
        totalService: 0,
      });
      return;
    }
    const incendieTarifsDuFournisseur = incendieTarifs.find(
      (tarif) => tarif.fournisseurId === fournisseurId
    );
    setIncendie((prev) => ({
      ...prev,
      infos: {
        fournisseurId: fournisseurId,
        nomFournisseur: nomFournisseur,
        sloganFournisseur: sloganFournisseur,
      },
      prix: {
        prixParExtincteur: incendieTarifsDuFournisseur?.prixParExtincteur ?? 0,
        prixParBaes: incendieTarifsDuFournisseur?.prixParBaes ?? 0,
        prixParTelBaes: incendieTarifsDuFournisseur?.prixParTelBaes ?? 0,
        fraisDeplacement: incendieTarifsDuFournisseur?.fraisDeplacement ?? 0,
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
          const tarifsDuFournisseur = incendieTarifs.find(
            (tarif) => tarif.fournisseurId === incendie.infos.fournisseurId
          );
          const prixParExtincteur = tarifsDuFournisseur?.prixParExtincteur ?? 0;
          const prixParBaes = tarifsDuFournisseur?.prixParBaes ?? 0;
          const prixParTelBaes = tarifsDuFournisseur?.prixParTelBaes ?? 0;
          const fraisDeplacement = tarifsDuFournisseur?.fraisDeplacement ?? 0;

          setTotalIncendie({
            totalService: Math.round(
              newNbExtincteurs * prixParExtincteur +
                nbBaes * prixParBaes +
                nbTelBaes * prixParTelBaes +
                fraisDeplacement
            ),
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
          const tarifsDuFournisseur = incendieTarifs.find(
            (tarif) => tarif.fournisseurId === incendie.infos.fournisseurId
          );
          const prixParExtincteur = tarifsDuFournisseur?.prixParExtincteur ?? 0;
          const prixParBaes = tarifsDuFournisseur?.prixParBaes ?? 0;
          const prixParTelBaes = tarifsDuFournisseur?.prixParTelBaes ?? 0;
          const fraisDeplacement = tarifsDuFournisseur?.fraisDeplacement ?? 0;
          setTotalIncendie({
            totalService: Math.round(
              nbExtincteurs * prixParExtincteur +
                newNbBaes * prixParBaes +
                nbTelBaes * prixParTelBaes +
                fraisDeplacement
            ),
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
          const tarifsDuFournisseur = incendieTarifs.find(
            (tarif) => tarif.fournisseurId === incendie.infos.fournisseurId
          );
          const prixParExtincteur = tarifsDuFournisseur?.prixParExtincteur ?? 0;
          const prixParBaes = tarifsDuFournisseur?.prixParBaes ?? 0;
          const prixParTelBaes = tarifsDuFournisseur?.prixParTelBaes ?? 0;
          const fraisDeplacement = tarifsDuFournisseur?.fraisDeplacement ?? 0;
          setTotalIncendie({
            totalService: Math.round(
              nbExtincteurs * prixParExtincteur +
                nbBaes * prixParBaes +
                newNbTelBaes * prixParTelBaes +
                fraisDeplacement
            ),
          });
        }

        return;
    }
  };

  const nbExtincteurs =
    incendie.quantites.nbExtincteurs || incendieQuantite.nbExtincteurs;
  const nbBaes =
    incendie.quantites.nbBaes ||
    Math.round(incendieQuantite.nbExtincteurs * 2.3);
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

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      {propositions.length > 0 &&
        propositions.map((proposition) => (
          <div className="flex border-b flex-1" key={proposition.id}>
            <div className="flex w-1/4 items-center justify-between flex-col gap-10 p-4">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center h-1/4 w-full">
                      {getLogoFournisseurUrl(proposition.fournisseurId) ? (
                        <div className="w-full h-full relative">
                          <Image
                            src={
                              getLogoFournisseurUrl(
                                proposition.fournisseurId
                              ) as string
                            }
                            alt={`logo-de-${proposition.nomFournisseur}`}
                            fill={true}
                            className="w-full h-full object-contain"
                            quality={100}
                          />
                        </div>
                      ) : (
                        proposition.nomFournisseur
                      )}
                    </div>
                  </TooltipTrigger>
                  {proposition.sloganFournisseur && (
                    <TooltipContent>
                      <p className="text-sm italic">
                        {proposition.sloganFournisseur}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <div className="flex flex-col gap-6 w-3/4">
                <div className="flex gap-4 items-center  w-full">
                  <Input
                    type="number"
                    value={nbExtincteurs}
                    min={1}
                    max={100}
                    step={1}
                    onChange={(e) => handleChangeNbr(e, "extincteur")}
                    className={`w-16 ${
                      incendie.quantites.nbExtincteurs ===
                      incendieQuantite.nbExtincteurs
                        ? "text-destructive"
                        : ""
                    }`}
                  />
                  <Label htmlFor="nbExtincteurs" className="text-sm flex-1">
                    extincteur(s)
                  </Label>
                </div>

                <div className="flex gap-4 items-center w-full">
                  <Input
                    type="number"
                    value={nbBaes}
                    min={1}
                    max={100}
                    step={1}
                    onChange={(e) => handleChangeNbr(e, "baes")}
                    className={`w-16 ${
                      incendie.quantites.nbBaes ===
                      Math.ceil(incendieQuantite.nbExtincteurs * 2.3)
                        ? "text-destructive"
                        : ""
                    }`}
                  />
                  <Label htmlFor="nbBaes" className="text-sm flex-1">
                    BAES
                  </Label>
                </div>

                <div className="flex gap-4 items-center w-full">
                  <Input
                    type="number"
                    value={nbTelBaes}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(e) => handleChangeNbr(e, "telBaes")}
                    className={`w-16 ${
                      incendie.quantites.nbTelBaes === 1
                        ? "text-destructive"
                        : ""
                    }`}
                  />
                  <Label htmlFor="nbTelBaes" className="text-sm flex-1">
                    télécommande(s) BAES
                  </Label>
                </div>
              </div>
              <p className="text-xs text-destructive italic px-2 text-center">
                Les quantités sont estimées pour vous mais vous pouvez les
                changer
              </p>
            </div>

            <div
              className={`w-3/4 flex items-center justify-center text-xl gap-4 cursor-pointer bg-slate-100 ${
                incendie.infos.fournisseurId === proposition.fournisseurId
                  ? "ring-4 ring-inset ring-destructive"
                  : ""
              }`}
              onClick={() => handleClickProposition(proposition)}
            >
              <Checkbox
                checked={
                  incendie.infos.fournisseurId === proposition.fournisseurId
                }
                onCheckedChange={() => handleClickProposition(proposition)}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                <p className="font-bold">
                  {proposition.prixAnnuel / 12} € / mois*
                </p>
                <p>Pour le contrôle de :</p>
                <p className="text-sm">
                  {" "}
                  {incendie.quantites.nbExtincteurs} extincteurs
                </p>
                <p className="text-sm"> {incendie.quantites.nbBaes} BAES</p>
                <p className="text-sm">
                  {" "}
                  {incendie.quantites.nbTelBaes} télécommandes BAES
                </p>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default SecuriteIncendiePropositions;
