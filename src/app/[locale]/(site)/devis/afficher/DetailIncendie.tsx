import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MARGE } from "@/constants/constants";
import { IncendieContext } from "@/context/IncendieProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useContext } from "react";

const DetailIncendie = () => {
  const { incendie } = useContext(IncendieContext);
  const { totalIncendie } = useContext(TotalIncendieContext);
  const totalOptions =
    (totalIncendie.totalExutoires ?? 0) +
    (totalIncendie.totalExutoiresParking ?? 0) +
    (totalIncendie.totalAlarmes ?? 0) +
    (totalIncendie.totalPortesCoupeFeuBattantes ?? 0) +
    (totalIncendie.totalPortesCoupeFeuCoulissantes ?? 0) +
    (totalIncendie.totalColonnesSechesStatiques ?? 0) +
    (totalIncendie.totalColonnesSechesDynamiques ?? 0) +
    (totalIncendie.totalRIA ?? 0) +
    (totalIncendie.totalDeplacementExutoires ?? 0) +
    (totalIncendie.totalDeplacementExutoiresParking ?? 0);
  if (!totalIncendie.totalTrilogie) return null;
  return (
    <>
      <Table className="detail-section border">
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Prestataire</TableHead>
            <TableHead>Gamme</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Prévisionnel</TableHead>
            <TableHead>Prestation amortie sur</TableHead>
            <TableHead className="text-end">Total (€ HT/mois)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {totalIncendie.totalTrilogie ? (
            <>
              <TableRow>
                <TableCell>Contrôle Extincteurs</TableCell>
                <TableCell>{incendie.infos.nomFournisseur}</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>{incendie.quantites.nbExtincteurs}</TableCell>
                <TableCell>extincteurs</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell className="text-end">
                  {formatNumber(
                    ((incendie.quantites.nbExtincteurs ?? 0) *
                      (incendie.prix.prixParExtincteur ?? 0) *
                      MARGE) /
                      12
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Contrôle BAES</TableCell>
                <TableCell>{incendie.infos.nomFournisseur}</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>{incendie.quantites.nbBaes}</TableCell>
                <TableCell>baes</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell className="text-end">
                  {formatNumber(
                    ((incendie.quantites.nbBaes ?? 0) *
                      (incendie.prix.prixParBaes ?? 0) *
                      MARGE) /
                      12
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Contrôle télécomandes BAES</TableCell>
                <TableCell>{incendie.infos.nomFournisseur}</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>{incendie.quantites.nbTelBaes}</TableCell>
                <TableCell>télécommande(s) baes</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell className="text-end">
                  {formatNumber(
                    ((incendie.quantites.nbTelBaes ?? 0) *
                      (incendie.prix.prixParTelBaes ?? 0) *
                      MARGE) /
                      12
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Frais de déplacement</TableCell>
                <TableCell>{incendie.infos.nomFournisseur}</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell className="text-end">
                  {formatNumber(
                    ((totalIncendie.totalDeplacementTrilogie ?? 0) * MARGE) / 12
                  )}
                </TableCell>
              </TableRow>
            </>
          ) : null}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} className="font-bold">
              Total Incendie Trilogie Extincteurs / BAES / Télécommandes BAES
            </TableCell>
            <TableCell className="text-end font-bold">
              {formatNumber(
                (((totalIncendie.totalTrilogie ?? 0) +
                  (totalIncendie.totalDeplacementTrilogie ?? 0)) *
                  MARGE) /
                  12
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <Table className="detail-section">
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Prestataire</TableHead>
            <TableHead>Gamme</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Prévisionnel</TableHead>
            <TableHead>Prestation amortie sur</TableHead>
            <TableHead className="text-end">Total (€ HT/mois)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {totalIncendie.totalExutoires ? (
            <>
              <TableRow>
                <TableCell>Exutoires de fumée</TableCell>
                <TableCell>{incendie.infos.nomFournisseur}</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>{incendie.quantites.nbExutoires}</TableCell>
                <TableCell>trappes</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell className="text-end">
                  {formatNumber((totalIncendie.totalExutoires * MARGE) / 12)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Frais de déplacement</TableCell>
                <TableCell>{incendie.infos.nomFournisseur}</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell className="text-end">
                  {formatNumber(
                    ((totalIncendie.totalDeplacementExutoires ?? 0) * MARGE) /
                      12
                  )}
                </TableCell>
              </TableRow>
            </>
          ) : null}
          {totalIncendie.totalExutoiresParking ? (
            <>
              <TableRow>
                <TableCell>Exutoires de fumée (parking)</TableCell>
                <TableCell>{incendie.infos.nomFournisseur}</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>{incendie.quantites.nbExutoiresParking}</TableCell>
                <TableCell>trappes</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell className="text-end">
                  {formatNumber(
                    (totalIncendie.totalExutoiresParking * MARGE) / 12
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Frais de déplacement</TableCell>
                <TableCell>{incendie.infos.nomFournisseur}</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell className="text-end">
                  {formatNumber(
                    ((totalIncendie.totalDeplacementExutoiresParking ?? 0) *
                      MARGE) /
                      12
                  )}
                </TableCell>
              </TableRow>
            </>
          ) : null}

          {totalIncendie.totalAlarmes ? (
            <TableRow>
              <TableCell>Alarmes T4 SSI</TableCell>
              <TableCell>{incendie.infos.nomFournisseur}</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>{incendie.quantites.nbAlarmes}</TableCell>
              <TableCell>alarmes</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell className="text-end">
                {formatNumber(((totalIncendie.totalAlarmes ?? 0) * MARGE) / 12)}
              </TableCell>
            </TableRow>
          ) : null}
          {totalIncendie.totalPortesCoupeFeuBattantes ? (
            <TableRow>
              <TableCell>Portes Coupe-feu battantes</TableCell>
              <TableCell>{incendie.infos.nomFournisseur}</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>
                {incendie.quantites.nbPortesCoupeFeuBattantes}
              </TableCell>
              <TableCell>porte(s) </TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell className="text-end">
                {formatNumber(
                  ((totalIncendie.totalPortesCoupeFeuBattantes ?? 0) * MARGE) /
                    12
                )}
              </TableCell>
            </TableRow>
          ) : null}
          {totalIncendie.totalPortesCoupeFeuCoulissantes ? (
            <TableRow>
              <TableCell>Portes Coupe-feu battantes</TableCell>
              <TableCell>{incendie.infos.nomFournisseur}</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>
                {incendie.quantites.nbPortesCoupeFeuCoulissantes}
              </TableCell>
              <TableCell>porte(s) </TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell className="text-end">
                {formatNumber(
                  ((totalIncendie.totalPortesCoupeFeuCoulissantes ?? 0) *
                    MARGE) /
                    12
                )}
              </TableCell>
            </TableRow>
          ) : null}
          {totalIncendie.totalColonnesSechesStatiques ? (
            <TableRow>
              <TableCell>Colonnes sèches statiques</TableCell>
              <TableCell>{incendie.infos.nomFournisseur}</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>
                {incendie.quantites.nbColonnesSechesStatiques}
              </TableCell>
              <TableCell>colonne(s) </TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell className="text-end">
                {formatNumber(
                  ((totalIncendie.totalColonnesSechesStatiques ?? 0) * MARGE) /
                    12
                )}
              </TableCell>
            </TableRow>
          ) : null}
          {totalIncendie.totalColonnesSechesDynamiques ? (
            <TableRow>
              <TableCell>Colonnes sèches dynamiques</TableCell>
              <TableCell>{incendie.infos.nomFournisseur}</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>
                {incendie.quantites.nbColonnesSechesDynamiques}
              </TableCell>
              <TableCell>colonne(s) </TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell className="text-end">
                {formatNumber(
                  ((totalIncendie.totalColonnesSechesDynamiques ?? 0) * MARGE) /
                    12
                )}
              </TableCell>
            </TableRow>
          ) : null}
          {totalIncendie.totalRIA ? (
            <TableRow>
              <TableCell>Robinet(s) incendie armé(s)</TableCell>
              <TableCell>{incendie.infos.nomFournisseur}</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>{incendie.quantites.nbRIA}</TableCell>
              <TableCell>robinet(s) </TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell className="text-end">
                {formatNumber(((totalIncendie.totalRIA ?? 0) * MARGE) / 12)}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} className="font-bold">
              Total Incendie Options
            </TableCell>
            <TableCell className="text-end font-bold">
              {formatNumber(((totalOptions ?? 0) * MARGE) / 12)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
};

export default DetailIncendie;
