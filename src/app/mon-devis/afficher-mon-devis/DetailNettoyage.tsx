import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { S_OUVREES_PAR_AN } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const DetailNettoyage = () => {
  const { nettoyage } = useContext(NettoyageContext);
  const { totalNettoyage } = useContext(TotalNettoyageContext);
  const total = Object.values(totalNettoyage)
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);
  if (!total) return null;
  return (
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
        {totalNettoyage.totalService ? (
          <TableRow>
            <TableCell>Nettoyage</TableCell>
            <TableCell>{nettoyage.infos.nomFournisseur}</TableCell>
            <TableCell>{nettoyage.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>
              {formatNumber(
                (nettoyage.quantites.freqAnnuelle ?? 0) / S_OUVREES_PAR_AN
              )}{" "}
              passage(s) de {nettoyage.quantites.hParPassage}h / semaine
            </TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber(totalNettoyage.totalService / 12)}
            </TableCell>
          </TableRow>
        ) : null}
        {totalNettoyage.totalRepasse ? (
          <TableRow>
            <TableCell>Repasse sanitaire</TableCell>
            <TableCell>{nettoyage.infos.nomFournisseur}</TableCell>
            <TableCell>{nettoyage.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>
              {formatNumber(
                (nettoyage.quantites.freqAnnuelle ?? 0) / S_OUVREES_PAR_AN
              )}{" "}
              passage(s) de {nettoyage.quantites.hParPassage} h / semaine
            </TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber(totalNettoyage.totalRepasse / 12)}
            </TableCell>
          </TableRow>
        ) : null}
        {totalNettoyage.totalSamedi ? (
          <TableRow>
            <TableCell>Nettoyage sup. Samedi</TableCell>
            <TableCell>{nettoyage.infos.nomFournisseur}</TableCell>
            <TableCell>{nettoyage.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>
              1 passage de {nettoyage.quantites.hParPassage} h / semaine en plus
            </TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber(totalNettoyage.totalSamedi / 12)}
            </TableCell>
          </TableRow>
        ) : null}
        {totalNettoyage.totalDimanche ? (
          <TableRow>
            <TableCell>Nettoyage sup. Dimanche</TableCell>
            <TableCell>{nettoyage.infos.nomFournisseur}</TableCell>
            <TableCell>{nettoyage.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>
              1 passage de {nettoyage.quantites.hParPassage} h / semaine en plus
            </TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber(totalNettoyage.totalDimanche / 12)}
            </TableCell>
          </TableRow>
        ) : null}
        {totalNettoyage.totalVitrerie ? (
          <TableRow>
            <TableCell>Lavage vitrerie</TableCell>
            <TableCell>{nettoyage.infos.nomFournisseur}</TableCell>
            <TableCell>{nettoyage.infos.gammeSelected}</TableCell>
            <TableCell>
              {nettoyage.quantites.surfaceVitres},{" "}
              {nettoyage.quantites.surfaceCloisons}
            </TableCell>
            <TableCell>m2 vitres, m2 cloisons</TableCell>
            <TableCell>
              {nettoyage.quantites.nbPassagesVitrerie} passages / an
            </TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber(totalNettoyage.totalVitrerie / 12)}
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={7} className="font-bold">
            Total Nettoyage
          </TableCell>
          <TableCell className="text-end font-bold">
            {formatNumber(total / 12)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default DetailNettoyage;
