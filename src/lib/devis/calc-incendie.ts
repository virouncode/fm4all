import { IncendieType } from "@/zod-schemas/incendie.schema";
import { TotalIncendieType } from "@/zod-schemas/total.schema";

export function calcIncendieTotaux(incendie: IncendieType): TotalIncendieType {
  const {
    quantites: {
      nbExtincteurs,
      nbBaes,
      nbTelBaes,
      nbExutoires,
      nbExutoiresParking,
      nbAlarmes,
      nbPortesCoupeFeuBattantes,
      nbPortesCoupeFeuCoulissantes,
      nbRIA,
      nbColonnesSechesStatiques,
      nbColonnesSechesDynamiques,
    },
    prix: {
      prixParExtincteur,
      prixParBaes,
      prixParTelBaes,
      prixParExutoire,
      prixParExutoireParking,
      prixParAlarme,
      prixParPorteCoupeFeuBattante,
      prixParProteCoupeFeuCoulissante,
      prixParRIA,
      prixParColonneSecheStatique,
      prixParColonneSecheDynamique,
      fraisDeplacementTrilogie,
      fraisDeplacementExutoires,
      fraisDeplacementExutoiresParking,
    },
  } = incendie;

  const totalTrilogie =
    nbExtincteurs !== null &&
    nbBaes !== null &&
    nbTelBaes !== null &&
    prixParExtincteur !== null &&
    prixParBaes !== null &&
    prixParTelBaes !== null
      ? nbExtincteurs * prixParExtincteur +
        nbBaes * prixParBaes +
        nbTelBaes * prixParTelBaes
      : null;

  const totalDeplacementTrilogie =
    fraisDeplacementTrilogie !== null ? fraisDeplacementTrilogie : null;

  const totalExutoires =
    nbExutoires !== null && prixParExutoire !== null
      ? prixParExutoire * nbExutoires
      : null;

  const totalDeplacementExutoires =
    nbExutoires !== null ? fraisDeplacementExutoires : null;

  const totalExutoiresParking =
    nbExutoiresParking !== null && prixParExutoireParking !== null
      ? prixParExutoireParking * nbExutoiresParking
      : null;

  const totalDeplacementExutoiresParking =
    nbExutoiresParking !== null ? fraisDeplacementExutoiresParking : null;

  const totalAlarmes =
    nbAlarmes !== null && prixParAlarme !== null
      ? prixParAlarme * nbAlarmes
      : null;

  const totalPortesCoupeFeuBattantes =
    nbPortesCoupeFeuBattantes !== null && prixParPorteCoupeFeuBattante !== null
      ? prixParPorteCoupeFeuBattante * nbPortesCoupeFeuBattantes
      : null;

  const totalPortesCoupeFeuCoulissantes =
    nbPortesCoupeFeuCoulissantes !== null &&
    prixParProteCoupeFeuCoulissante !== null
      ? prixParProteCoupeFeuCoulissante * nbPortesCoupeFeuCoulissantes
      : null;

  const totalRIA =
    nbRIA !== null && prixParRIA !== null ? prixParRIA * nbRIA : null;

  const totalColonnesSechesStatiques =
    nbColonnesSechesStatiques !== null && prixParColonneSecheStatique !== null
      ? prixParColonneSecheStatique * nbColonnesSechesStatiques
      : null;

  const totalColonnesSechesDynamiques =
    nbColonnesSechesDynamiques !== null && prixParColonneSecheDynamique !== null
      ? prixParColonneSecheDynamique * nbColonnesSechesDynamiques
      : null;

  return {
    totalTrilogie,
    totalExutoires,
    totalExutoiresParking,
    totalAlarmes,
    totalPortesCoupeFeuBattantes,
    totalPortesCoupeFeuCoulissantes,
    totalRIA,
    totalColonnesSechesStatiques,
    totalColonnesSechesDynamiques,
    totalDeplacementTrilogie,
    totalDeplacementExutoires,
    totalDeplacementExutoiresParking,
  };
}
