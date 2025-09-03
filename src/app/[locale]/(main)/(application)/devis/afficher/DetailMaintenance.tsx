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
import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useContext } from "react";

const DetailMaintenance = () => {
  const { maintenance } = useContext(MaintenanceContext);
  const { totalMaintenance } = useContext(TotalMaintenanceContext);
  const total = Object.values(totalMaintenance)
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
        {totalMaintenance.totalService ? (
          <TableRow>
            <TableCell>Maintenance Multi-Tech</TableCell>
            <TableCell>{maintenance.infos.nomFournisseur}</TableCell>
            <TableCell>{maintenance.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>
              {maintenance.quantites.freqAnnuelle} passage(s) de{" "}
              {maintenance.quantites.hParPassage} h / an
            </TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber((totalMaintenance.totalService * MARGE) / 12)}
            </TableCell>
          </TableRow>
        ) : null}
        {totalMaintenance.totalQ18 ? (
          <TableRow>
            <TableCell>Contrôle Q18</TableCell>
            <TableCell>{maintenance.infos.nomFournisseur}</TableCell>
            <TableCell>{maintenance.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>
              {maintenance.quantites.freqAnnuelle} passage(s) de{" "}
              {maintenance.quantites.hParPassage} h / an
            </TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber((totalMaintenance.totalQ18 * MARGE) / 12)}
            </TableCell>
          </TableRow>
        ) : null}
        {totalMaintenance.totalLegio ? (
          <TableRow>
            <TableCell>Contrôle Legio</TableCell>
            <TableCell>{maintenance.infos.nomFournisseur}</TableCell>
            <TableCell>{maintenance.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>
              {maintenance.quantites.freqAnnuelle} passage(s) de{" "}
              {maintenance.quantites.hParPassage} h / an
            </TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber((totalMaintenance.totalLegio * MARGE) / 12)}
            </TableCell>
          </TableRow>
        ) : null}
        {totalMaintenance.totalQualiteAir ? (
          <TableRow>
            <TableCell>Contrôle Qualité Air</TableCell>
            <TableCell>{maintenance.infos.nomFournisseur}</TableCell>
            <TableCell>{maintenance.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>
              {maintenance.quantites.freqAnnuelle} passage(s) de{" "}
              {maintenance.quantites.hParPassage} h / an
            </TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber((totalMaintenance.totalQualiteAir * MARGE) / 12)}
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={7} className="font-bold">
            Total Maintenance
          </TableCell>
          <TableCell className="text-end font-bold">
            {formatNumber((total * MARGE) / 12)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default DetailMaintenance;
