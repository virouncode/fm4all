import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { locationDistribHygiene } from "@/constants/locationsDistribHygiene";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const DetailHygiene = () => {
  const { hygiene } = useContext(HygieneContext);
  const { totalHygiene } = useContext(TotalHygieneContext);
  const totalOptions =
    (totalHygiene.totalDesinfectant ?? 0) +
    (totalHygiene.totalParfum ?? 0) +
    (totalHygiene.totalBalai ?? 0) +
    (totalHygiene.totalPoubelle ?? 0);
  if (!totalHygiene.totalTrilogie) return null;
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
          {totalHygiene.totalTrilogie ? (
            <>
              <TableRow>
                <TableCell>Essuies-mains papier</TableCell>
                <TableCell>{hygiene.infos.nomFournisseur}</TableCell>
                <TableCell>{hygiene.infos.trilogieGammeSelected}</TableCell>
                <TableCell>{hygiene.quantites.nbDistribEmp}</TableCell>
                <TableCell>distributeur(s) EMP</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>
                  {
                    locationDistribHygiene.find(
                      ({ id }) => id === hygiene.infos.dureeLocation
                    )?.description
                  }
                </TableCell>
                <TableCell className="text-end">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Savon</TableCell>
                <TableCell>{hygiene.infos.nomFournisseur}</TableCell>
                <TableCell>{hygiene.infos.trilogieGammeSelected}</TableCell>
                <TableCell>{hygiene.quantites.nbDistribEmp}</TableCell>
                <TableCell>distributeur(s) Savon</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>
                  {
                    locationDistribHygiene.find(
                      ({ id }) => id === hygiene.infos.dureeLocation
                    )?.description
                  }
                </TableCell>
                <TableCell className="text-end">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Papier hygiénique</TableCell>
                <TableCell>{hygiene.infos.nomFournisseur}</TableCell>
                <TableCell>{hygiene.infos.trilogieGammeSelected}</TableCell>
                <TableCell>{hygiene.quantites.nbDistribEmp}</TableCell>
                <TableCell>distributeur(s) PH</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>
                  {
                    locationDistribHygiene.find(
                      ({ id }) => id === hygiene.infos.dureeLocation
                    )?.description
                  }
                </TableCell>
                <TableCell className="text-end">-</TableCell>
              </TableRow>
              <TableRow></TableRow>
            </>
          ) : null}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} className="font-bold">
              Total Hygiène Sanitaire Trilogie EMP / Savon / PH
            </TableCell>
            <TableCell className="text-end font-bold">
              {formatNumber((totalHygiene.totalTrilogie ?? 0) / 12)}
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
          {totalHygiene.totalDesinfectant ? (
            <TableRow>
              <TableCell>Desinfectant cuvettes</TableCell>
              <TableCell>{hygiene.infos.nomFournisseur}</TableCell>
              <TableCell>{hygiene.infos.desinfectantGammeSelected}</TableCell>
              <TableCell>{hygiene.quantites.nbDistribDesinfectant}</TableCell>
              <TableCell>distributeur(s) désinfectant</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>
                {
                  locationDistribHygiene.find(
                    ({ id }) => id === hygiene.infos.dureeLocation
                  )?.description
                }
              </TableCell>
              <TableCell className="text-end">
                {formatNumber(totalHygiene.totalDesinfectant / 12)}
              </TableCell>
            </TableRow>
          ) : null}

          {totalHygiene.totalParfum ? (
            <TableRow>
              <TableCell>Parfum d&apos;ambiance</TableCell>
              <TableCell>{hygiene.infos.nomFournisseur}</TableCell>
              <TableCell>{hygiene.infos.parfumGammeSelected}</TableCell>
              <TableCell>{hygiene.quantites.nbDistribEmp}</TableCell>
              <TableCell>distributeur(s) parfum</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>
                {
                  locationDistribHygiene.find(
                    ({ id }) => id === hygiene.infos.dureeLocation
                  )?.description
                }
              </TableCell>
              <TableCell className="text-end">
                {formatNumber((totalHygiene.totalParfum ?? 0) / 12)}
              </TableCell>
            </TableRow>
          ) : null}
          {totalHygiene.totalBalai ? (
            <TableRow>
              <TableCell>Balais WC</TableCell>
              <TableCell>{hygiene.infos.nomFournisseur}</TableCell>
              <TableCell>{hygiene.infos.balaiGammeSelected}</TableCell>
              <TableCell>{hygiene.quantites.nbDistribBalai}</TableCell>
              <TableCell>bloc(s) </TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>
                {
                  locationDistribHygiene.find(
                    ({ id }) => id === hygiene.infos.dureeLocation
                  )?.description
                }
              </TableCell>
              <TableCell className="text-end">
                {formatNumber((totalHygiene.totalBalai ?? 0) / 12)}
              </TableCell>
            </TableRow>
          ) : null}
          {totalHygiene.totalPoubelle ? (
            <TableRow>
              <TableCell>Poubelles hygiène féminine</TableCell>
              <TableCell>{hygiene.infos.nomFournisseur}</TableCell>
              <TableCell>{hygiene.infos.balaiGammeSelected}</TableCell>
              <TableCell>{hygiene.quantites.nbDistribPoubelle}</TableCell>
              <TableCell>poubelle(s) </TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>
                {
                  locationDistribHygiene.find(
                    ({ id }) => id === hygiene.infos.dureeLocation
                  )?.description
                }
              </TableCell>
              <TableCell className="text-end">
                {formatNumber((totalHygiene.totalPoubelle ?? 0) / 12)}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} className="font-bold">
              Total Hygiène Sanitaire Options
            </TableCell>
            <TableCell className="text-end font-bold">
              {formatNumber((totalOptions ?? 0) / 12)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
};

export default DetailHygiene;
