import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IncendieContext } from "@/context/IncendieProvider";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { FireExtinguisher } from "lucide-react";
import { ChangeEvent, useContext, useState } from "react";
import PropositionsFooter from "../../PropositionsFooter";
import PropositionsTitle from "../../PropositionsTitle";

const PersonnaliserIncendieComplements = () => {
  const { incendie, setIncendie } = useContext(IncendieContext);
  const { personnalisation, setPersonnalisation } = useContext(
    PersonnalisationContext
  );
  const [exutoires, setExutoires] = useState(false);
  const [portes, setPortes] = useState(false);
  const [colonnes, setColonnes] = useState(false);
  const [ria, setRia] = useState(false);
  const [alarmes, setAlarmes] = useState(false);

  const handleClickPrevious = () => {
    const currentIndex = personnalisation.personnalisationIds.indexOf(
      personnalisation.currentPersonnalisationId as number
    );
    setPersonnalisation((prev) => ({
      ...prev,
      currentPersonnalisationId:
        personnalisation.personnalisationIds[currentIndex - 1],
    }));
  };
  const handleClickNext = () => {
    setPersonnalisation((prev) => ({
      ...prev,
      currentPersonnalisationId: 7,
    }));
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newNb = value ? parseInt(value) : 0;
    switch (name) {
      case "exutoires":
        setIncendie((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbExutoires: newNb,
          },
        }));
        break;
      case "alarmes":
        setIncendie((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbAlarmesT4SSI: newNb,
          },
        }));
        break;
      case "portes":
        setIncendie((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbPortesCoupFeu: newNb,
          },
        }));
        break;
      case "colonnes":
        setIncendie((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbColonnesSeches: newNb,
          },
        }));
        break;
      case "ria":
        setIncendie((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbRIA: newNb,
          },
        }));
        break;
    }
  };
  const handleCheck = (checked: boolean, name: string) => {
    console.log(checked, name);

    switch (name) {
      case "exutoires":
        setExutoires(checked);
        if (!checked)
          setIncendie((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbExutoires: 0,
            },
          }));
        break;
      case "alarmes":
        setAlarmes(checked);
        if (!checked)
          setIncendie((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbAlarmesT4SSI: 0,
            },
          }));
        break;
      case "portes":
        setPortes(checked);
        if (!checked)
          setIncendie((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbPortesCoupFeu: 0,
            },
          }));
        break;
      case "colonnes":
        setColonnes(checked);
        if (!checked)
          setIncendie((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbColonnesSeches: 0,
            },
          }));
        break;
      case "ria":
        setRia(checked);
        if (!checked)
          setIncendie((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbRIA: 0,
            },
          }));
        break;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="6">
      <PropositionsTitle
        title="Securite incendie"
        description=""
        icon={FireExtinguisher}
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1 flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <p className="text-2xl">Compléments</p>
          <p className="max-w-prose mx-auto hyphens-auto"></p>
          <div className="flex flex-col gap-8">
            <p className="max-w-prose mx-auto hyphens-auto font-bold">
              En complément des BAES et Extincteurs, souhaitez vous nous confier
              le contrôle de :
            </p>
            <div className="flex flex-col gap-6 md:w-1/3 md:mx-auto">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="exutoires"
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                  checked={exutoires}
                  onCheckedChange={(checked: boolean) =>
                    handleCheck(checked, "exutoires")
                  }
                />
                <Label htmlFor="exutoires" className="text-base flex-1">
                  Exutoires de fumée
                </Label>
                <Input
                  value={incendie.quantites.nbExutoires ?? 0}
                  onChange={handleChange}
                  name="exutoires"
                  type="number"
                  className="w-20"
                  disabled={!exutoires}
                  min={0}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="alarmes"
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                  checked={alarmes}
                  onCheckedChange={(checked: boolean) =>
                    handleCheck(checked, "alarmes")
                  }
                />
                <Label htmlFor="alarmes" className="text-base flex-1">
                  Alarmes T4
                </Label>
                <Input
                  value={incendie.quantites.nbAlarmesT4SSI ?? 0}
                  onChange={handleChange}
                  name="alarmes"
                  type="number"
                  className="w-20"
                  disabled={!alarmes}
                  min={0}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="portes"
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                  checked={portes}
                  onCheckedChange={(checked: boolean) =>
                    handleCheck(checked, "portes")
                  }
                />
                <Label htmlFor="portes" className="text-base flex-1">
                  Portes coupe-feu
                </Label>
                <Input
                  value={incendie.quantites.nbPortesCoupFeu ?? 0}
                  onChange={handleChange}
                  name="portes"
                  type="number"
                  className="w-20"
                  disabled={!portes}
                  min={0}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="colonnes"
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                  checked={colonnes}
                  onCheckedChange={(checked: boolean) =>
                    handleCheck(checked, "colonnes")
                  }
                />
                <Label htmlFor="colonnes" className="text-base flex-1">
                  Colonnes sèches
                </Label>
                <Input
                  value={incendie.quantites.nbColonnesSeches ?? 0}
                  onChange={handleChange}
                  name="colonnes"
                  type="number"
                  className="w-20"
                  disabled={!colonnes}
                  min={0}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ria"
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                  checked={ria}
                  onCheckedChange={(checked: boolean) =>
                    handleCheck(checked, "ria")
                  }
                />
                <Label htmlFor="ria" className="text-base flex-1">
                  Robinets d&apos;incendie armés
                </Label>
                <Input
                  value={incendie.quantites.nbRIA ?? 0}
                  onChange={handleChange}
                  name="ria"
                  type="number"
                  className="w-20"
                  disabled={!ria}
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default PersonnaliserIncendieComplements;
