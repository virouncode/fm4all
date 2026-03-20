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
import { locationDistribHygiene } from "@/constants/locationsDistribHygiene";
import { calcHygieneTotaux } from "@/lib/devis/calc-hygiene";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { useMemo } from "react";

const DetailHygiene = () => {
  const hygiene = useHygieneStore((s) => s.hygiene);
  const effectif = useProspectStore((s) => s.prospect.effectif ?? 0);
  const totalHygiene = useMemo(
    () => calcHygieneTotaux(hygiene, effectif),
    [hygiene, effectif],
  );
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
                <TableCell>{hygiene.infos.nomPrestataire}</TableCell>
                <TableCell>{hygiene.infos.trilogieGammeSelected}</TableCell>
                <TableCell>{hygiene.quantites.nbDistribEmp}</TableCell>
                <TableCell>distributeur(s) EMP</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>
                  {
                    locationDistribHygiene.find(
                      ({ id }) => id === hygiene.infos.dureeLocation,
                    )?.description
                  }
                </TableCell>
                <TableCell className="text-end">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Savon</TableCell>
                <TableCell>{hygiene.infos.nomPrestataire}</TableCell>
                <TableCell>{hygiene.infos.trilogieGammeSelected}</TableCell>
                <TableCell>{hygiene.quantites.nbDistribEmp}</TableCell>
                <TableCell>distributeur(s) Savon</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>
                  {
                    locationDistribHygiene.find(
                      ({ id }) => id === hygiene.infos.dureeLocation,
                    )?.description
                  }
                </TableCell>
                <TableCell className="text-end">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Papier hygiénique</TableCell>
                <TableCell>{hygiene.infos.nomPrestataire}</TableCell>
                <TableCell>{hygiene.infos.trilogieGammeSelected}</TableCell>
                <TableCell>{hygiene.quantites.nbDistribEmp}</TableCell>
                <TableCell>distributeur(s) PH</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>
                  {
                    locationDistribHygiene.find(
                      ({ id }) => id === hygiene.infos.dureeLocation,
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
              {formatNumber(((totalHygiene.totalTrilogie ?? 0) * MARGE) / 12)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
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
          {totalHygiene.totalDesinfectant ? (
            <TableRow>
              <TableCell>Desinfectant cuvettes</TableCell>
              <TableCell>{hygiene.infos.nomPrestataire}</TableCell>
              <TableCell>{hygiene.infos.desinfectantGammeSelected}</TableCell>
              <TableCell>{hygiene.quantites.nbDistribDesinfectant}</TableCell>
              <TableCell>distributeur(s) désinfectant</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>
                {
                  locationDistribHygiene.find(
                    ({ id }) => id === hygiene.infos.dureeLocation,
                  )?.description
                }
              </TableCell>
              <TableCell className="text-end">
                {formatNumber((totalHygiene.totalDesinfectant * MARGE) / 12)}
              </TableCell>
            </TableRow>
          ) : null}

          {totalHygiene.totalParfum ? (
            <TableRow>
              <TableCell>Parfum d&apos;ambiance</TableCell>
              <TableCell>{hygiene.infos.nomPrestataire}</TableCell>
              <TableCell>{hygiene.infos.parfumGammeSelected}</TableCell>
              <TableCell>{hygiene.quantites.nbDistribEmp}</TableCell>
              <TableCell>distributeur(s) parfum</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>
                {
                  locationDistribHygiene.find(
                    ({ id }) => id === hygiene.infos.dureeLocation,
                  )?.description
                }
              </TableCell>
              <TableCell className="text-end">
                {formatNumber(((totalHygiene.totalParfum ?? 0) * MARGE) / 12)}
              </TableCell>
            </TableRow>
          ) : null}
          {totalHygiene.totalBalai ? (
            <TableRow>
              <TableCell>Balais WC</TableCell>
              <TableCell>{hygiene.infos.nomPrestataire}</TableCell>
              <TableCell>{hygiene.infos.balaiGammeSelected}</TableCell>
              <TableCell>{hygiene.quantites.nbDistribBalai}</TableCell>
              <TableCell>bloc(s) </TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>
                {
                  locationDistribHygiene.find(
                    ({ id }) => id === hygiene.infos.dureeLocation,
                  )?.description
                }
              </TableCell>
              <TableCell className="text-end">
                {formatNumber(((totalHygiene.totalBalai ?? 0) * MARGE) / 12)}
              </TableCell>
            </TableRow>
          ) : null}
          {totalHygiene.totalPoubelle ? (
            <TableRow>
              <TableCell>Poubelles hygiène féminine</TableCell>
              <TableCell>{hygiene.infos.nomPrestataire}</TableCell>
              <TableCell>{hygiene.infos.balaiGammeSelected}</TableCell>
              <TableCell>{hygiene.quantites.nbDistribPoubelle}</TableCell>
              <TableCell>poubelle(s) </TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>
                {
                  locationDistribHygiene.find(
                    ({ id }) => id === hygiene.infos.dureeLocation,
                  )?.description
                }
              </TableCell>
              <TableCell className="text-end">
                {formatNumber(((totalHygiene.totalPoubelle ?? 0) * MARGE) / 12)}
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
              {formatNumber(((totalOptions ?? 0) * MARGE) / 12)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
};

export default DetailHygiene;
