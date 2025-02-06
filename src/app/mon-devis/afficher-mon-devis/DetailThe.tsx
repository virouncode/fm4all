import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CafeContext } from "@/context/CafeProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const DetailThe = () => {
  const { cafe } = useContext(CafeContext);
  const { the } = useContext(TheContext);
  const { totalThe } = useContext(TotalTheContext);
  if (!totalThe.totalService) return null;

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
        {totalThe.totalService ? (
          <TableRow>
            <TableCell>The</TableCell>
            <TableCell>{cafe.infos.nomFournisseur}</TableCell>
            <TableCell>{the.infos.gammeSelected}</TableCell>
            <TableCell>{the.quantites.nbPersonnes} personne(s)</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber(totalThe.totalService / 12)}
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={7} className="font-bold">
            Total Thé
          </TableCell>
          <TableCell className="text-end font-bold">
            {formatNumber((totalThe.totalService ?? 0) / 12)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default DetailThe;
