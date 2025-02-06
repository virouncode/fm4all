import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { TotalOfficeManagerContext } from "@/context/TotalOfficeManagerProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const DetailOfficeManager = () => {
  const { officeManager } = useContext(OfficeManagerContext);
  const { totalOfficeManager } = useContext(TotalOfficeManagerContext);
  if (!totalOfficeManager.totalService) return null;
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
        {totalOfficeManager.totalService ? (
          <TableRow>
            <TableCell>Office/Hospitality Manager</TableCell>
            <TableCell>{officeManager.infos.nomFournisseur}</TableCell>
            <TableCell>{officeManager.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>
              {(officeManager.quantites.demiJParSemaine ?? 0) * 2} j / semaine,{" "}
              {officeManager.infos.remplace
                ? "Remplacé pendant congés"
                : "Non-remplacé pendant congés"}
            </TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber(totalOfficeManager.totalService / 12)}
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={7} className="font-bold">
            Total OfficeManager
          </TableCell>
          <TableCell className="text-end font-bold">
            {formatNumber(totalOfficeManager.totalService / 12)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default DetailOfficeManager;
