import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IncendieContext } from "@/context/IncendieProvider";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { roundNbAlarmes } from "@/lib/roundAlarmes";
import { roundNbExutoires } from "@/lib/roundNbExutoires";
import { SelectAlarmesTarifsType } from "@/zod-schemas/alarmesTarifs";
import { SelectColonnesSechesTarifsType } from "@/zod-schemas/colonnesSechesTarifs";
import { SelectExutoiresTarifsType } from "@/zod-schemas/exutoiresTarifs";
import { SelectPortesCoupeFeuTarifsType } from "@/zod-schemas/portesCoupeFeuTarifs";
import { SelectRiaTarifsType } from "@/zod-schemas/riaTarifs";
import { FireExtinguisher } from "lucide-react";
import { ChangeEvent, useContext, useState } from "react";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";

export const MAX_NB_EXUTOIRES = 100;
export const MAX_NB_ALARMES = 100;
export const MAX_NB_RIA = 100;
export const MAX_NB_COLONNES_SECHES = 100;
export const MAX_NB_PORTES_COUPES_FEU = 100;

type PersonnaliserIncendieComplementsProps = {
  exutoiresTarifs?: SelectExutoiresTarifsType[];
  exutoiresParkingTarifs?: SelectExutoiresTarifsType[];
  alarmesTarifs?: SelectAlarmesTarifsType[];
  riaTarifs?: SelectRiaTarifsType[];
  colonnesSechesTarifs?: SelectColonnesSechesTarifsType[];
  portesCoupeFeuTarifs?: SelectPortesCoupeFeuTarifsType[];
};

const PersonnaliserIncendieComplements = ({
  exutoiresTarifs,
  exutoiresParkingTarifs,
  alarmesTarifs,
  riaTarifs,
  colonnesSechesTarifs,
  portesCoupeFeuTarifs,
}: PersonnaliserIncendieComplementsProps) => {
  const { incendie, setIncendie } = useContext(IncendieContext);
  const { totalIncendie, setTotalIncendie } = useContext(TotalIncendieContext);
  const { personnalisation, setPersonnalisation } = useContext(
    PersonnalisationContext
  );
  const [exutoires, setExutoires] = useState(
    totalIncendie.totalExutoires ? true : false
  );
  const [exutoiresParking, setExutoiresParking] = useState(
    totalIncendie.totalExutoiresParking ? true : false
  );
  const [portesCoupeFeuBattantes, setPortesCoupeFeuBattantes] = useState(
    totalIncendie.totalPortesCoupeFeuBattantes ? true : false
  );
  const [portesCoupeFeuCoulissantes, setPortesCoupeFeuCoulissantes] = useState(
    totalIncendie.totalPortesCoupeFeuCoulissantes ? true : false
  );
  const [colonnesSechesStatiques, setColonnesStatiques] = useState(
    totalIncendie.totalColonnesSechesStatiques ? true : false
  );
  const [colonnesSechesDynamiques, setColonnesDynamiques] = useState(
    totalIncendie.totalColonnesSechesDynamiques ? true : false
  );
  const [ria, setRia] = useState(totalIncendie.totalRIA ? true : false);
  const [alarmes, setAlarmes] = useState(
    totalIncendie.totalAlarmes ? true : false
  );

  const exutoiresTarifsFournisseur = exutoiresTarifs?.filter(
    (tarif) => tarif.fournisseurId === incendie.infos.fournisseurId
  );
  const exutoiresParkingTarifsFournisseur = exutoiresParkingTarifs?.filter(
    (tarif) => tarif.fournisseurId === incendie.infos.fournisseurId
  );
  const alarmesTarifsFournisseur = alarmesTarifs?.filter(
    (tarif) => tarif.fournisseurId === incendie.infos.fournisseurId
  );
  const riaTarifFournisseur = riaTarifs?.find(
    (tarif) => tarif.fournisseurId === incendie.infos.fournisseurId
  );
  const colonnesSechesTarifsFournisseur = colonnesSechesTarifs?.filter(
    (tarif) => tarif.fournisseurId === incendie.infos.fournisseurId
  );
  const portesCoupeFeuTarifsFournisseur = portesCoupeFeuTarifs?.filter(
    (tarif) => tarif.fournisseurId === incendie.infos.fournisseurId
  );
  const nbExutoires = incendie.quantites.nbExutoires || 1;
  const nbExutoiresParking = incendie.quantites.nbExutoiresParking || 1;
  const nbAlarmes = incendie.quantites.nbAlarmes || 1;
  const nbPortesCoupeFeuBattantes =
    incendie.quantites.nbPortesCoupeFeuBattantes || 1;
  const nbPortesCoupeFeuCoulissantes =
    incendie.quantites.nbPortesCoupeFeuCoulissantes || 1;
  const nbColonnesSechesStatiques =
    incendie.quantites.nbColonnesSechesStatiques || 1;
  const nbColonnesSechesDynamiques =
    incendie.quantites.nbColonnesSechesDynamiques || 1;
  const nbRIA = incendie.quantites.nbRIA || 1;

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
      currentPersonnalisationId: 13,
    }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newNb = value ? parseInt(value) : 1;
    switch (name) {
      case "exutoires":
        const newNbrExutoires =
          newNb > MAX_NB_EXUTOIRES ? MAX_NB_EXUTOIRES : newNb;
        const prixParExutoire =
          exutoiresTarifsFournisseur?.find(
            (tarif) => tarif.nbExutoires === roundNbExutoires(newNbrExutoires)
          )?.prixParExutoire ?? null;
        const totalExutoires =
          prixParExutoire !== null ? prixParExutoire * newNbrExutoires : null;
        const fraisDeplacementExutoires =
          exutoiresTarifsFournisseur?.find(
            (tarif) => tarif.nbExutoires === roundNbExutoires(newNbrExutoires)
          )?.fraisDeplacement ?? null;
        setIncendie((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbExutoires: newNbrExutoires,
          },
          prix: { ...prev.prix, prixParExutoire, fraisDeplacementExutoires },
        }));
        setTotalIncendie((prev) => ({
          ...prev,
          totalExutoires,
          totalDeplacementExutoires: fraisDeplacementExutoires,
        }));

        break;
      case "exutoiresParking":
        const newNbrExutoiresParking =
          newNb > MAX_NB_EXUTOIRES ? MAX_NB_EXUTOIRES : newNb;
        const prixParExutoireParking =
          exutoiresParkingTarifsFournisseur?.find(
            (tarif) =>
              tarif.nbExutoires === roundNbExutoires(newNbrExutoiresParking)
          )?.prixParExutoire ?? null;
        const totalExutoiresParking =
          prixParExutoireParking !== null
            ? prixParExutoireParking * newNbrExutoiresParking
            : null;
        const fraisDeplacementExutoiresParking =
          exutoiresParkingTarifsFournisseur?.find(
            (tarif) =>
              tarif.nbExutoires === roundNbExutoires(newNbrExutoiresParking)
          )?.fraisDeplacement ?? null;
        setIncendie((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbExutoiresParking: newNbrExutoiresParking,
          },
          prix: {
            ...prev.prix,
            prixParExutoireParking,
            fraisDeplacementExutoiresParking,
          },
        }));
        setTotalIncendie((prev) => ({
          ...prev,
          totalExutoiresParking,
          totalDeplacementExutoiresParking: fraisDeplacementExutoiresParking,
        }));
        break;
      case "alarmes":
        const newNbrAlarmes = newNb > MAX_NB_ALARMES ? MAX_NB_ALARMES : newNb;
        const totalAlarmes =
          alarmesTarifsFournisseur?.find(
            (tarif) => tarif.nbPoints === roundNbAlarmes(newNbrAlarmes)
          )?.prixParControle ?? null;
        const prixParAlarme =
          totalAlarmes !== null
            ? Math.round((totalAlarmes * 10) / newNbrAlarmes) / 10
            : null;
        setIncendie((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbAlarmes: newNbrAlarmes,
          },
          prix: { ...prev.prix, prixParAlarme },
        }));
        setTotalIncendie((prev) => ({ ...prev, totalAlarmes }));
        break;
      case "portesCoupeFeuBattantes":
        const newNbrPortesCoupeFeuBattantes =
          newNb > MAX_NB_PORTES_COUPES_FEU ? MAX_NB_PORTES_COUPES_FEU : newNb;
        const prixParPorteCoupeFeuBattante =
          portesCoupeFeuTarifsFournisseur?.find(
            (tarif) => tarif.type === "vantaux"
          )?.prixParPorte ?? null;
        const totalPortesCoupeFeuBattantes =
          prixParPorteCoupeFeuBattante !== null
            ? prixParPorteCoupeFeuBattante * newNbrPortesCoupeFeuBattantes
            : null;
        setIncendie((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbPortesCoupeFeuBattantes: newNbrPortesCoupeFeuBattantes,
          },
          prix: { ...prev.prix, prixParPorteCoupeFeuBattante },
        }));
        setTotalIncendie((prev) => ({
          ...prev,
          totalPortesCoupeFeuBattantes: totalPortesCoupeFeuBattantes,
        }));

        break;
      case "portesCoupeFeuCoulissantes":
        const newNbrPortesCoupeFeuCoulissantes =
          newNb > MAX_NB_PORTES_COUPES_FEU ? MAX_NB_PORTES_COUPES_FEU : newNb;
        const prixParProteCoupeFeuCoulissante =
          portesCoupeFeuTarifsFournisseur?.find(
            (tarif) => tarif.type === "coulissante"
          )?.prixParPorte ?? null;
        const totalPortesCoupeFeuCoulissantes =
          prixParProteCoupeFeuCoulissante !== null
            ? prixParProteCoupeFeuCoulissante * newNbrPortesCoupeFeuCoulissantes
            : null;
        setIncendie((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbPortesCoupeFeuCoulissantes: newNbrPortesCoupeFeuCoulissantes,
          },
          prix: { ...prev.prix, prixParProteCoupeFeuCoulissante },
        }));
        setTotalIncendie((prev) => ({
          ...prev,
          totalPortesCoupeFeuCoulissantes: totalPortesCoupeFeuCoulissantes,
        }));
        break;
      case "colonnesSechesStatiques":
        const newNbColonnesSechesStatiques =
          newNb > MAX_NB_COLONNES_SECHES ? MAX_NB_COLONNES_SECHES : newNb;
        const prixParColonneSecheStatique =
          colonnesSechesTarifsFournisseur?.find(
            (tarif) => tarif.type === "statique"
          )?.prixParColonne ?? null;
        const totalColonnesSechesStatiques =
          prixParColonneSecheStatique !== null
            ? prixParColonneSecheStatique * newNbColonnesSechesStatiques
            : null;
        setIncendie((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbColonnesSechesStatiques: newNbColonnesSechesStatiques,
          },
          prix: { ...prev.prix, prixParColonneSecheStatique },
        }));
        setTotalIncendie((prev) => ({
          ...prev,
          totalColonnesSechesStatiques,
        }));
        break;
      case "colonnesSechesDynamiques":
        const newNbColonnesSechesDynamiques =
          newNb > MAX_NB_COLONNES_SECHES ? MAX_NB_COLONNES_SECHES : newNb;
        const prixParColonneSecheDynamique =
          colonnesSechesTarifsFournisseur?.find(
            (tarif) => tarif.type === "dynamique"
          )?.prixParColonne ?? null;
        const totalColonnesSechesDynamiques =
          prixParColonneSecheDynamique !== null
            ? prixParColonneSecheDynamique * newNbColonnesSechesDynamiques
            : null;
        setIncendie((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbColonnesSechesDynamiques: newNbColonnesSechesDynamiques,
          },
          prix: { ...prev.prix, prixParColonneSecheDynamique },
        }));
        setTotalIncendie((prev) => ({
          ...prev,
          totalColonnesSechesDynamiques,
        }));
        break;
      case "ria":
        const newNbRia = newNb > MAX_NB_RIA ? MAX_NB_RIA : newNb;
        const prixParRIA = riaTarifFournisseur?.prixParRIA ?? null;
        const totalRIA = prixParRIA !== null ? prixParRIA * newNbRia : null;
        setIncendie((prev) => ({
          ...prev,
          quantites: {
            ...prev.quantites,
            nbRIA: newNbRia,
          },
          prix: { ...prev.prix, prixParRIA },
        }));
        setTotalIncendie((prev) => ({ ...prev, totalRIA }));
        break;
    }
  };
  const handleCheck = (checked: boolean, name: string) => {
    switch (name) {
      case "exutoires":
        setExutoires(checked);
        if (!checked) {
          setIncendie((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbExutoires: null,
            },
            prix: {
              ...prev.prix,
              prixParExutoire: null,
              fraisDeplacementExutoires: null,
            },
          }));
          setTotalIncendie((prev) => ({
            ...prev,
            totalExutoires: null,
            totalDeplacementExutoires: null,
          }));
        } else {
          const prixParExutoire =
            exutoiresTarifsFournisseur?.find(
              (tarif) => tarif.nbExutoires === roundNbExutoires(nbExutoires)
            )?.prixParExutoire ?? null;
          const totalExutoires =
            prixParExutoire !== null ? prixParExutoire * nbExutoires : null;
          const fraisDeplacementExutoires =
            exutoiresTarifsFournisseur?.find(
              (tarif) => tarif.nbExutoires === roundNbExutoires(nbExutoires)
            )?.fraisDeplacement ?? null;
          setIncendie((prev) => ({
            ...prev,
            quantites: { ...prev.quantites, nbExutoires },
            prix: { ...prev.prix, prixParExutoire, fraisDeplacementExutoires },
          }));
          setTotalIncendie((prev) => ({
            ...prev,
            totalExutoires,
            totalDeplacementExutoires: fraisDeplacementExutoires,
          }));
        }
        break;
      case "exutoiresParking":
        setExutoiresParking(checked);
        if (!checked) {
          setIncendie((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbExutoiresParking: null,
            },
            prix: { ...prev.prix, prixParExutoireParking: null },
          }));
          setTotalIncendie((prev) => ({
            ...prev,
            totalExutoiresParking: null,
            totalDeplacementExutoiresParking: null,
          }));
        } else {
          const prixParExutoireParking =
            exutoiresTarifsFournisseur?.find(
              (tarif) =>
                tarif.nbExutoires === roundNbExutoires(nbExutoiresParking)
            )?.prixParExutoire ?? null;
          const totalExutoiresParking =
            prixParExutoireParking !== null
              ? prixParExutoireParking * nbExutoires
              : null;
          const fraisDeplacementExutoiresParking =
            exutoiresParkingTarifsFournisseur?.find(
              (tarif) =>
                tarif.nbExutoires === roundNbExutoires(nbExutoiresParking)
            )?.fraisDeplacement ?? null;
          setIncendie((prev) => ({
            ...prev,
            quantites: { ...prev.quantites, nbExutoiresParking },
            prix: {
              ...prev.prix,
              prixParExutoireParking,
              fraisDeplacementExutoiresParking,
            },
          }));
          setTotalIncendie((prev) => ({
            ...prev,
            totalExutoiresParking,
            totalDeplacementExutoiresParking: fraisDeplacementExutoiresParking,
          }));
        }
        break;
      case "alarmes":
        setAlarmes(checked);
        if (!checked) {
          setIncendie((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbAlarmes: null,
            },
            prix: { ...prev.prix, prixParAlarme: null },
          }));
          setTotalIncendie((prev) => ({ ...prev, totalAlarmes: null }));
        } else {
          const totalAlarmes =
            alarmesTarifsFournisseur?.find(
              (tarif) => tarif.nbPoints === roundNbAlarmes(nbAlarmes)
            )?.prixParControle ?? null;
          const prixParAlarme =
            totalAlarmes !== null
              ? Math.round((totalAlarmes * 10) / nbAlarmes) / 10
              : null;
          setIncendie((prev) => ({
            ...prev,
            quantites: { ...prev.quantites, nbAlarmes },
            prix: { ...prev.prix, prixParAlarme },
          }));
          setTotalIncendie((prev) => ({ ...prev, totalAlarmes }));
        }
        break;
      case "portesCoupeFeuBattantes":
        setPortesCoupeFeuBattantes(checked);
        if (!checked) {
          setIncendie((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbPortesCoupeFeuBattantes: null,
            },
            prix: { ...prev.prix, prixParPorteCoupeFeuBattante: null },
          }));
          setTotalIncendie((prev) => ({
            ...prev,
            totalPortesCoupeFeuBattantes: null,
          }));
        } else {
          const prixParPorteCoupeFeuBattante =
            portesCoupeFeuTarifsFournisseur?.find(
              (tarif) => tarif.type === "vantaux"
            )?.prixParPorte ?? null;
          const totalPortesCoupeFeuBattantes =
            prixParPorteCoupeFeuBattante !== null
              ? prixParPorteCoupeFeuBattante * nbPortesCoupeFeuBattantes
              : null;
          setIncendie((prev) => ({
            ...prev,
            quantites: { ...prev.quantites, nbPortesCoupeFeuBattantes },
            prix: { ...prev.prix, prixParPorteCoupeFeuBattante },
          }));
          setTotalIncendie((prev) => ({
            ...prev,
            totalPortesCoupeFeuBattantes,
          }));
        }
        break;
      case "portesCoupeFeuCoulissantes":
        setPortesCoupeFeuCoulissantes(checked);
        if (!checked) {
          setIncendie((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbPortesCoupeFeuCoulissantes: null,
            },
            prix: { ...prev.prix, prixParProteCoupeFeuCoulissante: null },
          }));
          setTotalIncendie((prev) => ({
            ...prev,
            totalPortesCoupeFeuCoulissantes: null,
          }));
        } else {
          const prixParProteCoupeFeuCoulissante =
            portesCoupeFeuTarifsFournisseur?.find(
              (tarif) => tarif.type === "coulissante"
            )?.prixParPorte ?? null;
          const totalPortesCoupeFeuCoulissantes =
            prixParProteCoupeFeuCoulissante !== null
              ? prixParProteCoupeFeuCoulissante * nbPortesCoupeFeuCoulissantes
              : null;
          setIncendie((prev) => ({
            ...prev,
            quantites: { ...prev.quantites, nbPortesCoupeFeuCoulissantes },
            prix: { ...prev.prix, prixParProteCoupeFeuCoulissante },
          }));
          setTotalIncendie((prev) => ({
            ...prev,
            totalPortesCoupeFeuCoulissantes,
          }));
        }
        break;
      case "colonnesSechesStatiques":
        setColonnesStatiques(checked);
        if (!checked) {
          setIncendie((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbColonnesSechesStatiques: null,
            },
            prix: { ...prev.prix, prixParColonneSecheStatique: null },
          }));
          setTotalIncendie((prev) => ({
            ...prev,
            totalColonnesSechesStatiques: null,
          }));
        } else {
          const prixParColonneSecheStatique =
            colonnesSechesTarifsFournisseur?.find(
              (tarif) => tarif.type === "statique"
            )?.prixParColonne ?? null;
          const totalColonnesSechesStatiques =
            prixParColonneSecheStatique !== null
              ? prixParColonneSecheStatique * nbColonnesSechesStatiques
              : null;
          setIncendie((prev) => ({
            ...prev,
            quantites: { ...prev.quantites, nbColonnesSechesStatiques },
            prix: { ...prev.prix, prixParColonneSecheStatique },
          }));
          setTotalIncendie((prev) => ({
            ...prev,
            totalColonnesSechesStatiques,
          }));
        }
        break;
      case "colonnesSechesDynamiques":
        setColonnesDynamiques(checked);
        if (!checked) {
          setIncendie((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbColonnesSechesDynamiques: null,
            },
            prix: { ...prev.prix, prixParColonneSecheDynamique: null },
          }));
          setTotalIncendie((prev) => ({
            ...prev,
            totalColonnesSechesDynamiques: null,
          }));
        } else {
          const prixParColonneSecheDynamique =
            colonnesSechesTarifsFournisseur?.find(
              (tarif) => tarif.type === "dynamique"
            )?.prixParColonne ?? null;
          const totalColonnesSechesDynamiques =
            prixParColonneSecheDynamique !== null
              ? prixParColonneSecheDynamique * nbColonnesSechesDynamiques
              : null;
          setIncendie((prev) => ({
            ...prev,
            quantites: { ...prev.quantites, nbColonnesSechesDynamiques },
            prix: { ...prev.prix, prixParColonneSecheDynamique },
          }));
          setTotalIncendie((prev) => ({
            ...prev,
            totalColonnesSechesDynamiques,
          }));
        }

        break;
      case "ria":
        setRia(checked);
        if (!checked) {
          setIncendie((prev) => ({
            ...prev,
            quantites: {
              ...prev.quantites,
              nbRIA: null,
            },
            prix: { ...prev.prix, prixParRIA: null },
          }));
          setTotalIncendie((prev) => ({ ...prev, totalRIA: null }));
        } else {
          const prixParRIA = riaTarifFournisseur?.prixParRIA ?? null;
          const totalRIA = prixParRIA !== null ? prixParRIA * nbRIA : null;
          setIncendie((prev) => ({
            ...prev,
            quantites: { ...prev.quantites, nbRIA: nbRIA },
            prix: { ...prev.prix, prixParRIA },
          }));
          setTotalIncendie((prev) => ({ ...prev, totalRIA }));
        }

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
      <div className="w-full flex-1 flex flex-col gap-6 overflow-auto">
        <div className="flex flex-col gap-6">
          <p className="text-2xl">Compléments</p>
          <p className="max-w-prose mx-auto hyphens-auto"></p>
          <div className="flex flex-col gap-8">
            <p className="max-w-prose mx-auto hyphens-auto font-bold">
              En complément des BAES et Extincteurs, souhaitez vous nous confier
              le contrôle de :
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-12 w-full md:mx-auto flex-1 overflow-auto p-2">
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
                  value={nbExutoires}
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
                  id="exutoiresParking"
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                  checked={exutoiresParking}
                  onCheckedChange={(checked: boolean) =>
                    handleCheck(checked, "exutoiresParking")
                  }
                />
                <Label htmlFor="exutoiresParking" className="text-base flex-1">
                  Exutoires de fumée (parking)
                </Label>
                <Input
                  value={nbExutoiresParking}
                  onChange={handleChange}
                  name="exutoiresParking"
                  type="number"
                  className="w-20"
                  disabled={!exutoiresParking}
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
                  value={nbAlarmes}
                  onChange={handleChange}
                  name="alarmes"
                  type="number"
                  className="w-20"
                  disabled={!alarmes}
                  min={0}
                  max={MAX_NB_EXUTOIRES}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="portesCoupeFeuBattantes"
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                  checked={portesCoupeFeuBattantes}
                  onCheckedChange={(checked: boolean) =>
                    handleCheck(checked, "portesCoupeFeuBattantes")
                  }
                />
                <Label
                  htmlFor="portesCoupeFeuBattantes"
                  className="text-base flex-1"
                >
                  Portes coupe-feu battantes
                </Label>
                <Input
                  value={nbPortesCoupeFeuBattantes}
                  onChange={handleChange}
                  name="portesCoupeFeuBattantes"
                  type="number"
                  className="w-20"
                  disabled={!portesCoupeFeuBattantes}
                  min={0}
                  max={MAX_NB_PORTES_COUPES_FEU}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="portesCoupeFeuCoulissantes"
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                  checked={portesCoupeFeuCoulissantes}
                  onCheckedChange={(checked: boolean) =>
                    handleCheck(checked, "portesCoupeFeuCoulissantes")
                  }
                />
                <Label
                  htmlFor="portesCoupeFeuCoulissantes"
                  className="text-base flex-1"
                >
                  Portes coupe-feu coulissantes
                </Label>
                <Input
                  value={nbPortesCoupeFeuCoulissantes}
                  onChange={handleChange}
                  name="portesCoupeFeuCoulissantes"
                  type="number"
                  className="w-20"
                  disabled={!portesCoupeFeuCoulissantes}
                  min={0}
                  max={MAX_NB_PORTES_COUPES_FEU}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="colonnesSechesStatiques"
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                  checked={colonnesSechesStatiques}
                  onCheckedChange={(checked: boolean) =>
                    handleCheck(checked, "colonnesSechesStatiques")
                  }
                />
                <Label
                  htmlFor="colonnesSechesStatiques"
                  className="text-base flex-1"
                >
                  Colonnes sèches statiques
                </Label>
                <Input
                  value={nbColonnesSechesStatiques}
                  onChange={handleChange}
                  name="colonnesSechesStatiques"
                  type="number"
                  className="w-20"
                  disabled={!colonnesSechesStatiques}
                  min={0}
                  max={MAX_NB_COLONNES_SECHES}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="colonnesSechesDynamiques"
                  className="data-[state=checked]:text-foreground bg-background data-[state=checked]:bg-background font-bold"
                  checked={colonnesSechesDynamiques}
                  onCheckedChange={(checked: boolean) =>
                    handleCheck(checked, "colonnesSechesDynamiques")
                  }
                />
                <Label
                  htmlFor="colonnesSechesDynamiques"
                  className="text-base flex-1"
                >
                  Colonnes sèches dynamiques
                </Label>
                <Input
                  value={nbColonnesSechesDynamiques}
                  onChange={handleChange}
                  name="colonnesSechesDynamiques"
                  type="number"
                  className="w-20"
                  disabled={!colonnesSechesDynamiques}
                  min={0}
                  max={MAX_NB_COLONNES_SECHES}
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
                  value={nbRIA}
                  onChange={handleChange}
                  name="ria"
                  type="number"
                  className="w-20"
                  disabled={!ria}
                  min={0}
                  max={MAX_NB_RIA}
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
