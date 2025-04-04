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
import { typesBoissons } from "@/constants/typesBoissons";
import { CafeContext } from "@/context/CafeProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";
import { locationCafeMachine } from "../../../../constants/locationCafeMachine";

const DetailCafe = () => {
  const { cafe } = useContext(CafeContext);
  const { totalCafe } = useContext(TotalCafeContext);
  const total = totalCafe.totalEspaces
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);
  if (!total) return null;
  // const totalInstallation = totalCafe.totalEspaces
  //   .map(({ totalInstallation }) => totalInstallation ?? 0)
  //   .reduce((acc, curr) => acc + curr, 0);
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
        {cafe.espaces.map((espace) => {
          const totalEspace = totalCafe.totalEspaces.find(
            ({ espaceId }) => espace.infos.espaceId === espaceId
          );
          if (!totalEspace) return null;
          const typeBoisson = typesBoissons.find(
            ({ id }) => id === espace.infos.typeBoissons
          )?.description;
          return (
            <TableRow key={espace.infos.espaceId}>
              <TableCell>{typeBoisson}</TableCell>
              <TableCell>{cafe.infos.nomFournisseur}</TableCell>
              <TableCell>{espace.infos.gammeCafeSelected}</TableCell>
              <TableCell>{espace.quantites.nbPersonnes} personne(s)</TableCell>
              <TableCell>
                {espace.quantites.nbMachines} x {espace.infos.marque}{" "}
                {espace.infos.modele}
              </TableCell>
              <TableCell>
                ~{(espace.quantites.nbPersonnes ?? 0) * 2} tasses / j
              </TableCell>
              <TableCell>
                {
                  locationCafeMachine.find(
                    ({ id }) => id === cafe.infos.dureeLocation
                  )?.description
                }
              </TableCell>
              <TableCell className="text-end">
                {formatNumber(((totalEspace.total ?? 0) * MARGE) / 12)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={7} className="font-bold">
            Total Café
          </TableCell>
          <TableCell className="text-end font-bold">
            {formatNumber((total * MARGE) / 12)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default DetailCafe;
