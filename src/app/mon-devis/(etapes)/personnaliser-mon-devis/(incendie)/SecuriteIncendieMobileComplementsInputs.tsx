import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import {
  MAX_NB_ALARMES,
  MAX_NB_COLONNES_SECHES,
  MAX_NB_EXUTOIRES,
  MAX_NB_PORTES_COUPES_FEU,
  MAX_NB_RIA,
} from "./PersonnaliserIncendieComplements";

type IncendieComplementType =
  | "exutoires"
  | "exutoiresParking"
  | "alarmes"
  | "portesCoupeFeuBattantes"
  | "portesCoupeFeuCoulissantes"
  | "colonnesSechesStatiques"
  | "colonnesSechesDynamiques"
  | "ria";

type SecuriteIncendieMobileComplementsInputsProps = {
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
  handleIncrement: (name: IncendieComplementType) => void;
  handleDecrement: (name: IncendieComplementType) => void;
};

const SecuriteIncendieMobileComplementsInputs = ({
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
  handleIncrement,
  handleDecrement,
}: SecuriteIncendieMobileComplementsInputsProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
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
        </div>
        {exutoires && (
          <div className="flex items-center gap-2">
            <Input
              value={nbExutoires}
              disabled={true}
              name="exutoires"
              type="number"
              className="w-16"
              min={1}
              max={MAX_NB_EXUTOIRES}
            />
            <Button
              variant="outline"
              title="Diminuer le nombre d'exutoires de fumée"
              onClick={() => handleDecrement("exutoires")}
              disabled={nbExutoires === 1}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre d'exutoires de fumée"
              onClick={() => handleIncrement("exutoires")}
              disabled={nbExutoires === MAX_NB_EXUTOIRES}
            >
              <Plus />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
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
        </div>
        {exutoiresParking && (
          <div className="flex items-center gap-2">
            <Input
              value={nbExutoiresParking}
              disabled={true}
              name="exutoiresParking"
              type="number"
              className="w-16"
              min={1}
              max={MAX_NB_EXUTOIRES}
            />
            <Button
              variant="outline"
              title="Diminuer le nombre d'exutoires de fumée (parking)"
              onClick={() => handleDecrement("exutoiresParking")}
              disabled={nbExutoiresParking === 1}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre d'exutoires de fumée (parking)"
              onClick={() => handleIncrement("exutoiresParking")}
              disabled={nbExutoiresParking === MAX_NB_EXUTOIRES}
            >
              <Plus />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
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
        </div>
        {alarmes && (
          <div className="flex items-center gap-2">
            <Input
              value={nbAlarmes}
              disabled={true}
              name="alarmes"
              type="number"
              className="w-16"
              min={1}
              max={MAX_NB_ALARMES}
            />
            <Button
              variant="outline"
              title="Diminuer le nombre d'alarmes T4"
              onClick={() => handleDecrement("alarmes")}
              disabled={nbAlarmes === 1}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre d'alarmes T4"
              onClick={() => handleIncrement("alarmes")}
              disabled={nbExutoiresParking === MAX_NB_ALARMES}
            >
              <Plus />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
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
        </div>
        {portesCoupeFeuBattantes && (
          <div className="flex items-center gap-2">
            <Input
              value={nbPortesCoupeFeuBattantes}
              disabled={true}
              name="portesCoupeFeuBattantes"
              type="number"
              className="w-16"
              min={1}
              max={MAX_NB_PORTES_COUPES_FEU}
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de portes coupe-feu battantes"
              onClick={() => handleDecrement("portesCoupeFeuBattantes")}
              disabled={nbPortesCoupeFeuBattantes === 1}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de portes coupe-feu battantes"
              onClick={() => handleIncrement("portesCoupeFeuBattantes")}
              disabled={nbPortesCoupeFeuBattantes === MAX_NB_PORTES_COUPES_FEU}
            >
              <Plus />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
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
        </div>
        {portesCoupeFeuCoulissantes && (
          <div className="flex items-center gap-2">
            <Input
              value={nbPortesCoupeFeuCoulissantes}
              disabled={true}
              name="portesCoupeFeuCoulissantes"
              type="number"
              className="w-16"
              min={1}
              max={MAX_NB_PORTES_COUPES_FEU}
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de portes coupe-feu coulissantes"
              onClick={() => handleDecrement("portesCoupeFeuCoulissantes")}
              disabled={nbPortesCoupeFeuCoulissantes === 1}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de portes coupe-feu coulissantes"
              onClick={() => handleIncrement("portesCoupeFeuCoulissantes")}
              disabled={
                nbPortesCoupeFeuCoulissantes === MAX_NB_PORTES_COUPES_FEU
              }
            >
              <Plus />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="colonnesSechesStatiques"
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            checked={colonnesSechesStatiques}
            onCheckedChange={(checked: boolean) =>
              handleCheck(checked, "colonnesSechesStatiques")
            }
            aria-label="Sélectionner Colonnes Seches Statiques"
          />
          <Label htmlFor="colonnesSechesStatiques" className="text-base flex-1">
            Colonnes sèches statiques
          </Label>
        </div>
        {colonnesSechesStatiques && (
          <div className="flex items-center gap-2">
            <Input
              value={nbColonnesSechesStatiques}
              disabled={true}
              name="colonnesSechesStatiques"
              type="number"
              className="w-16"
              min={1}
              max={MAX_NB_COLONNES_SECHES}
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de colonnes sèches statiques"
              onClick={() => handleDecrement("colonnesSechesStatiques")}
              disabled={nbColonnesSechesStatiques === 1}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de colonnes sèches statiques"
              onClick={() => handleIncrement("colonnesSechesStatiques")}
              disabled={nbColonnesSechesStatiques === MAX_NB_COLONNES_SECHES}
            >
              <Plus />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="colonnesSechesDynamiques"
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            checked={colonnesSechesDynamiques}
            onCheckedChange={(checked: boolean) =>
              handleCheck(checked, "colonnesSechesDynamiques")
            }
            aria-label="Sélectionner colonnes seches dynamiques"
          />
          <Label
            htmlFor="colonnesSechesDynamiques"
            className="text-base flex-1"
          >
            Colonnes sèches dynamiques
          </Label>
        </div>
        {colonnesSechesDynamiques && (
          <div className="flex items-center gap-2">
            <Input
              value={nbColonnesSechesDynamiques}
              disabled={true}
              name="colonnesSechesDynamiques"
              type="number"
              className="w-16"
              min={1}
              max={MAX_NB_COLONNES_SECHES}
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de colonnes sèches dynamiques"
              onClick={() => handleDecrement("colonnesSechesDynamiques")}
              disabled={nbColonnesSechesDynamiques === 1}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de colonnes sèches dynamiques"
              onClick={() => handleIncrement("colonnesSechesDynamiques")}
              disabled={nbColonnesSechesDynamiques === MAX_NB_COLONNES_SECHES}
            >
              <Plus />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="ria"
            className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
            checked={ria}
            onCheckedChange={(checked: boolean) => handleCheck(checked, "ria")}
            aria-label="Sélectionner robinets incendie armé"
          />
          <Label htmlFor="ria" className="text-base flex-1">
            Robinets d&apos;incendie armés
          </Label>
        </div>
        {ria && (
          <div className="flex items-center gap-2">
            <Input
              value={nbRIA}
              disabled={true}
              name="ria"
              type="number"
              className="w-16"
              min={1}
              max={MAX_NB_RIA}
            />
            <Button
              variant="outline"
              title="Diminuer le nombre de robinets d'
              incendie armés"
              onClick={() => handleDecrement("ria")}
              disabled={nbRIA === 1}
            >
              <Minus />
            </Button>
            <Button
              variant="outline"
              title="Augmenter le nombre de robinets d'
              incendie armés"
              onClick={() => handleIncrement("ria")}
              disabled={nbRIA === MAX_NB_RIA}
            >
              <Plus />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuriteIncendieMobileComplementsInputs;
