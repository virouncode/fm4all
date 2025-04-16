import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_NB_ALARMES,
  MAX_NB_COLONNES_SECHES,
  MAX_NB_EXUTOIRES,
  MAX_NB_PORTES_COUPES_FEU,
  MAX_NB_RIA,
} from "@/constants/constants";
import { useTranslations } from "next-intl";
import React from "react";

type SecuriteIncendieComplementsInputsProps = {
  exutoires: boolean;
  nbExutoires: number;
  exutoiresParking: boolean;
  nbExutoiresParking: number;
  alarmes: boolean;
  nbAlarmes: number;
  portesCoupeFeuBattantes: boolean;
  nbPortesCoupeFeuBattantes: number;
  portesCoupeFeuCoulissantes: boolean;
  nbPortesCoupeFeuCoulissantes: number;
  colonnesSechesStatiques: boolean;
  nbColonnesSechesStatiques: number;
  colonnesSechesDynamiques: boolean;
  nbColonnesSechesDynamiques: number;
  ria: boolean;
  nbRIA: number;
  handleCheck: (checked: boolean, name: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SecuriteIncendieComplementsInputs = ({
  exutoires,
  nbExutoires,
  exutoiresParking,
  nbExutoiresParking,
  alarmes,
  nbAlarmes,
  portesCoupeFeuBattantes,
  nbPortesCoupeFeuBattantes,
  portesCoupeFeuCoulissantes,
  nbPortesCoupeFeuCoulissantes,
  colonnesSechesStatiques,
  nbColonnesSechesStatiques,
  colonnesSechesDynamiques,
  nbColonnesSechesDynamiques,
  ria,
  nbRIA,
  handleCheck,
  handleChange,
}: SecuriteIncendieComplementsInputsProps) => {
  const tPersonnaliser = useTranslations("DevisPage.personnaliser");
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-12 w-full md:mx-auto flex-1 overflow-auto p-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id="exutoires"
          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
          checked={exutoires}
          onCheckedChange={(checked: boolean) =>
            handleCheck(checked, "exutoires")
          }
          aria-label={tPersonnaliser("selectionner-exutoires-de-fumee")}
        />
        <Label htmlFor="exutoires" className="text-base flex-1">
          {tPersonnaliser("exutoires-de-fumee")}
        </Label>
        {exutoires && (
          <Input
            value={nbExutoires}
            onChange={handleChange}
            name="exutoires"
            type="number"
            className="w-20"
            min={0}
            max={MAX_NB_EXUTOIRES}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="exutoiresParking"
          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
          checked={exutoiresParking}
          onCheckedChange={(checked: boolean) =>
            handleCheck(checked, "exutoiresParking")
          }
          aria-label={tPersonnaliser("selectionner-exutoires-de-fumee-parking")}
        />
        <Label htmlFor="exutoiresParking" className="text-base flex-1">
          {tPersonnaliser("exutoires-de-fumee-parking")}
        </Label>
        {exutoiresParking && (
          <Input
            value={nbExutoiresParking}
            onChange={handleChange}
            name="exutoiresParking"
            type="number"
            className="w-20"
            min={0}
            max={MAX_NB_EXUTOIRES}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="alarmes"
          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
          checked={alarmes}
          onCheckedChange={(checked: boolean) =>
            handleCheck(checked, "alarmes")
          }
          aria-label={tPersonnaliser("selectionner-alarmes-t4")}
        />
        <Label htmlFor="alarmes" className="text-base flex-1">
          {tPersonnaliser("alarmes-t4")}
        </Label>
        {alarmes && (
          <Input
            value={nbAlarmes}
            onChange={handleChange}
            name="alarmes"
            type="number"
            className="w-20"
            min={0}
            max={MAX_NB_ALARMES}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="portesCoupeFeuBattantes"
          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
          checked={portesCoupeFeuBattantes}
          onCheckedChange={(checked: boolean) =>
            handleCheck(checked, "portesCoupeFeuBattantes")
          }
          aria-label={tPersonnaliser("selectionner-portes-coupe-feu-battantes")}
        />
        <Label htmlFor="portesCoupeFeuBattantes" className="text-base flex-1">
          {tPersonnaliser("portes-coupe-feu-battantes")}
        </Label>
        {portesCoupeFeuBattantes && (
          <Input
            value={nbPortesCoupeFeuBattantes}
            onChange={handleChange}
            name="portesCoupeFeuBattantes"
            type="number"
            className="w-20"
            min={0}
            max={MAX_NB_PORTES_COUPES_FEU}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="portesCoupeFeuCoulissantes"
          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
          checked={portesCoupeFeuCoulissantes}
          onCheckedChange={(checked: boolean) =>
            handleCheck(checked, "portesCoupeFeuCoulissantes")
          }
          aria-label={tPersonnaliser(
            "selectionner-portes-coupe-feu-coulissantes"
          )}
        />
        <Label
          htmlFor="portesCoupeFeuCoulissantes"
          className="text-base flex-1"
        >
          {tPersonnaliser("portes-coupe-feu-coulissantes")}
        </Label>
        {portesCoupeFeuCoulissantes && (
          <Input
            value={nbPortesCoupeFeuCoulissantes}
            onChange={handleChange}
            name="portesCoupeFeuCoulissantes"
            type="number"
            className="w-20"
            min={0}
            max={MAX_NB_PORTES_COUPES_FEU}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="colonnesSechesStatiques"
          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
          checked={colonnesSechesStatiques}
          onCheckedChange={(checked: boolean) =>
            handleCheck(checked, "colonnesSechesStatiques")
          }
          aria-label={tPersonnaliser("selectionner-colonnes-seches-statiques")}
        />
        <Label htmlFor="colonnesSechesStatiques" className="text-base flex-1">
          {tPersonnaliser("colonnes-seches-statiques")}
        </Label>
        {colonnesSechesStatiques && (
          <Input
            value={nbColonnesSechesStatiques}
            onChange={handleChange}
            name="colonnesSechesStatiques"
            type="number"
            className="w-20"
            min={0}
            max={MAX_NB_COLONNES_SECHES}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="colonnesSechesDynamiques"
          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
          checked={colonnesSechesDynamiques}
          onCheckedChange={(checked: boolean) =>
            handleCheck(checked, "colonnesSechesDynamiques")
          }
          aria-label={tPersonnaliser("selectionner-colonnes-seches-dynamiques")}
        />
        <Label htmlFor="colonnesSechesDynamiques" className="text-base flex-1">
          {tPersonnaliser("colonnes-seches-dynamiques")}
        </Label>
        {colonnesSechesDynamiques && (
          <Input
            value={nbColonnesSechesDynamiques}
            onChange={handleChange}
            name="colonnesSechesDynamiques"
            type="number"
            className="w-20"
            min={0}
            max={MAX_NB_COLONNES_SECHES}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="ria"
          className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
          checked={ria}
          onCheckedChange={(checked: boolean) => handleCheck(checked, "ria")}
          aria-label={tPersonnaliser("selectionner-robinets-dincendie-armes")}
        />
        <Label htmlFor="ria" className="text-base flex-1">
          {tPersonnaliser("robinets-dincendie-armes")}
        </Label>
        {ria && (
          <Input
            value={nbRIA}
            onChange={handleChange}
            name="ria"
            type="number"
            className="w-20"
            min={0}
            max={MAX_NB_RIA}
          />
        )}
      </div>
    </div>
  );
};

export default SecuriteIncendieComplementsInputs;
