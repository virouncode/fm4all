import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import {
  MAX_NB_ALARMES,
  MAX_NB_COLONNES_SECHES,
  MAX_NB_EXUTOIRES,
  MAX_NB_PORTES_COUPES_FEU,
  MAX_NB_RIA,
} from "./PersonnaliserIncendieComplements";

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
          aria-label="Sélectionner exutoires de fumée"
        />
        <Label htmlFor="exutoires" className="text-base flex-1">
          Exutoires de fumée
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
          aria-label="Sélectionner exutoires de fumée (parking)"
        />
        <Label htmlFor="exutoiresParking" className="text-base flex-1">
          Exutoires de fumée (parking)
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
          aria-label="Sélectionner alarmes T4"
        />
        <Label htmlFor="alarmes" className="text-base flex-1">
          Alarmes T4
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
          aria-label="Sélectionner portes coupe-feu battantes"
        />
        <Label htmlFor="portesCoupeFeuBattantes" className="text-base flex-1">
          Portes coupe-feu battantes
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
          aria-label="Sélectionner portes coupe-feu coulissantes"
        />
        <Label
          htmlFor="portesCoupeFeuCoulissantes"
          className="text-base flex-1"
        >
          Portes coupe-feu coulissantes
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
          aria-label="Sélectionner colonnes sèches statiques"
        />
        <Label htmlFor="colonnesSechesStatiques" className="text-base flex-1">
          Colonnes sèches statiques
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
          aria-label="Sélectionner colonnes sèches dynamiques"
        />
        <Label htmlFor="colonnesSechesDynamiques" className="text-base flex-1">
          Colonnes sèches dynamiques
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
          aria-label="Sélectionner robinets d'incendie armés"
        />
        <Label htmlFor="ria" className="text-base flex-1">
          Robinets d&apos;incendie armés
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
