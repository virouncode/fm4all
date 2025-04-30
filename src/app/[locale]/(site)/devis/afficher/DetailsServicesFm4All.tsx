import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { TotalServicesFm4AllContext } from "@/context/TotalServicesFm4AllProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useContext } from "react";

const DetailServicesFm4All = () => {
  const { servicesFm4All } = useContext(ServicesFm4AllContext);
  const { totalServicesFm4All } = useContext(TotalServicesFm4AllContext);
  const {
    totalAssurance,
    totalPlateforme,
    totalSupportOp,
    totalSupportAdmin,
    totalAccountManager,
    totalRemiseCa,
    totalRemiseHof,
  } = totalServicesFm4All;

  const total =
    servicesFm4All.infos.gammeSelected === "essentiel"
      ? (totalAssurance ?? 0) +
        (totalPlateforme ?? 0) +
        (totalSupportAdmin ?? 0) -
        (totalRemiseCa ?? 0) -
        (totalRemiseHof ?? 0)
      : servicesFm4All.infos.gammeSelected === "confort"
        ? (totalAssurance ?? 0) +
          (totalPlateforme ?? 0) +
          (totalSupportAdmin ?? 0) +
          (totalSupportOp ?? 0) -
          (totalRemiseCa ?? 0) -
          (totalRemiseHof ?? 0)
        : (totalAssurance ?? 0) +
          (totalPlateforme ?? 0) +
          (totalSupportAdmin ?? 0) +
          (totalSupportOp ?? 0) +
          (totalAccountManager ?? 0) -
          (totalRemiseCa ?? 0) -
          (totalRemiseHof ?? 0);
  if (total === 0) return null;

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
        {totalAssurance ? (
          <TableRow>
            <TableCell>Assurance</TableCell>
            <TableCell>fm4all</TableCell>
            <TableCell>{servicesFm4All.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber(totalAssurance / 12)}
            </TableCell>
          </TableRow>
        ) : null}
        {totalPlateforme ? (
          <TableRow>
            <TableCell>Plateforme</TableCell>
            <TableCell>fm4all</TableCell>
            <TableCell>{servicesFm4All.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber(totalPlateforme / 12)}
            </TableCell>
          </TableRow>
        ) : null}

        <TableRow>
          <TableCell>Support Administratif</TableCell>
          <TableCell>fm4all</TableCell>
          <TableCell>{servicesFm4All.infos.gammeSelected}</TableCell>
          <TableCell>N/A</TableCell>
          <TableCell>N/A</TableCell>
          <TableCell>N/A</TableCell>
          <TableCell>N/A</TableCell>
          <TableCell className="text-end">inclus</TableCell>
        </TableRow>
        {servicesFm4All.infos.gammeSelected !== "essentiel" &&
        totalSupportOp ? (
          <TableRow>
            <TableCell>Support Opérationnel</TableCell>
            <TableCell>fm4all</TableCell>
            <TableCell>{servicesFm4All.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {servicesFm4All.infos.gammeSelected === "confort"
                ? `${formatNumber(totalSupportOp / 12)}`
                : "inclus"}
            </TableCell>
          </TableRow>
        ) : null}
        {servicesFm4All.infos.gammeSelected !== "excellence" &&
        totalAccountManager ? (
          <TableRow>
            <TableCell>Account Manager</TableCell>
            <TableCell>fm4all</TableCell>
            <TableCell>{servicesFm4All.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber(totalAccountManager / 12)}
            </TableCell>
          </TableRow>
        ) : null}
        {totalRemiseCa ? (
          <TableRow>
            <TableCell>Remise sur chiffres d&apos;affaires</TableCell>
            <TableCell>fm4all</TableCell>
            <TableCell>{servicesFm4All.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber(-totalRemiseCa / 12)}
            </TableCell>
          </TableRow>
        ) : null}
        {totalRemiseHof ? (
          <TableRow>
            <TableCell>Remise Office Manager</TableCell>
            <TableCell>fm4all</TableCell>
            <TableCell>{servicesFm4All.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber(-totalRemiseHof / 12)}
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={7} className="font-bold">
            Total ServicesFm4All
          </TableCell>
          <TableCell className="text-end font-bold">
            {formatNumber(total / 12)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default DetailServicesFm4All;
