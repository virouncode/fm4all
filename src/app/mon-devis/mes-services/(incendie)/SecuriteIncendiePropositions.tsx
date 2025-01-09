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
import { SelectIncendieQuantitesType } from "@/zod-schemas/incendieQuantites";
import { SelectIncendieTarifsType } from "@/zod-schemas/incendieTarifs";
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

  const nbExtincteurs =
    (incendie.nbExtincteurs || incendieQuantite?.nbExtincteurs) ?? 0;
  const nbBaes =
    incendie.nbBaes || Math.round(incendieQuantite.nbExtincteurs * 2.3);
  const nbTelBaes = incendie.nbTelBaes || 1;

  const propositions = incendieTarifs.map((tarif) => ({
    id: tarif.id,
    nomEntreprise: tarif.nomEntreprise,
    slogan: tarif.slogan,
    nbExtincteurs,
    nbBaes,
    nbTelBaes,
    prixAnnuel: Math.round(
      nbExtincteurs * tarif.prixParExtincteur +
        nbBaes * tarif.prixParBaes +
        nbTelBaes * tarif.prixParTelBaes +
        tarif.fraisDeplacement
    ),
  }));

  const handleClickProposition = (propositionId: number) => {
    if (incendie.propositionId === propositionId) {
      setIncendie((prev) => ({
        ...prev,
        propositionId: null,
      }));
      setTotalIncendie({
        nomFournisseur: "",
        prixIncendie: null,
      });
      return;
    }
    setIncendie((prev) => ({
      ...prev,
      propositionId,
    }));
    setTotalIncendie({
      nomFournisseur: propositions.find(
        (proposition) => proposition.id === propositionId
      )?.nomEntreprise as string,
      prixIncendie: propositions.find(
        (proposition) => proposition.id === propositionId
      )?.prixAnnuel as number,
    });
  };

  const handleChangeNbr = (
    e: ChangeEvent<HTMLInputElement>,
    type: "extincteur" | "baes" | "telBaes"
  ) => {
    const value = e.target.value;
    switch (type) {
      case "extincteur":
        setIncendie((prev) => ({
          ...prev,
          nbExtincteurs: value
            ? parseInt(value)
            : incendieQuantite?.nbExtincteurs ?? 0,
        }));
        return;
      case "baes":
        setIncendie((prev) => ({
          ...prev,
          nbBaes: value
            ? parseInt(value)
            : Math.round(
                ((incendie.nbExtincteurs || incendieQuantite?.nbExtincteurs) ??
                  0) * 2.3
              ),
        }));
        return;
      case "telBaes":
        setIncendie((prev) => ({
          ...prev,
          nbTelBaes: value ? parseInt(value) : 1,
        }));
        return;
    }
  };

  return (
    <div className="h-full flex flex-col border rounded-xl overflow-hidden">
      {propositions.length > 0 &&
        propositions.map((proposition) => (
          <div className="flex border-b flex-1" key={proposition.id}>
            <div className="flex w-1/4 items-center justify-center flex-col gap-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-lg">{proposition.nomEntreprise}</div>
                  </TooltipTrigger>
                  {proposition.slogan && (
                    <TooltipContent>
                      <p className="text-sm italic">{proposition.slogan}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <div className="flex flex-col gap-6 w-3/4">
                <div className="flex gap-4 items-center  w-full">
                  <Input
                    type="number"
                    value={incendie.nbExtincteurs || proposition.nbExtincteurs}
                    min={1}
                    max={100}
                    step={1}
                    onChange={(e) => handleChangeNbr(e, "extincteur")}
                    className={`w-16 ${
                      incendie.nbExtincteurs === incendieQuantite?.nbExtincteurs
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
                    value={incendie.nbBaes || proposition.nbBaes}
                    min={1}
                    max={100}
                    step={1}
                    onChange={(e) => handleChangeNbr(e, "baes")}
                    className={`w-16 ${
                      incendie.nbBaes ===
                      Math.ceil((incendieQuantite?.nbExtincteurs ?? 0) * 2.3)
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
                    value={incendie.nbTelBaes || proposition.nbTelBaes}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(e) => handleChangeNbr(e, "telBaes")}
                    className={`w-16 ${
                      incendie.nbTelBaes === 1 ? "text-destructive" : ""
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
              className={`w-3/4 flex items-center justify-center text-xl gap-4 cursor-pointer bg-slate-400 ${
                incendie.propositionId === proposition.id
                  ? "ring-2 ring-inset ring-destructive"
                  : ""
              }`}
              onClick={() => handleClickProposition(proposition.id)}
            >
              <Checkbox
                checked={incendie.propositionId === proposition.id}
                onCheckedChange={() => handleClickProposition(proposition.id)}
                className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
              />
              <div>
                <p className="font-bold">{proposition.prixAnnuel} € / an*</p>
                <p>Pour le contrôle de :</p>
                <p className="text-sm">
                  {" "}
                  {proposition.nbExtincteurs} extincteurs
                </p>
                <p className="text-sm"> {proposition.nbBaes} BAES</p>
                <p className="text-sm">
                  {" "}
                  {proposition.nbTelBaes} télécommandes BAES
                </p>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default SecuriteIncendiePropositions;
