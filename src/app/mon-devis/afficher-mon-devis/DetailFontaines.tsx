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
import { locationFontaine } from "@/constants/locationFontaine";
import { typesPose } from "@/constants/typesPose";
import { FontainesContext } from "@/context/FontainesProvider";
import { TotalFontainesContext } from "@/context/TotalFontainesProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const DetailFontaines = () => {
  const { fontaines } = useContext(FontainesContext);
  const { totalFontaines } = useContext(TotalFontainesContext);
  const total = totalFontaines.totalEspaces
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);
  if (!total) return null;
  // const totalInstallation = totalFontaines.totalEspaces
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
        {fontaines.espaces.map((espace) => {
          const totalEspace = totalFontaines.totalEspaces.find(
            ({ espaceId }) => espace.infos.espaceId === espaceId
          );
          if (!totalEspace) return null;
          return (
            <TableRow key={espace.infos.espaceId}>
              <TableCell>{espace.infos.typeEau.join("/")}</TableCell>
              <TableCell>{fontaines.infos.nomFournisseur}</TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>{espace.quantites.nbPersonnes} personne(s)</TableCell>
              <TableCell>
                1 x {espace.infos.marque} {espace.infos.modele},{" "}
                {
                  typesPose.find(({ id }) => id === espace.infos.poseSelected)
                    ?.description
                }
              </TableCell>
              <TableCell>N/A</TableCell>
              <TableCell>
                {
                  locationFontaine.find(
                    ({ id }) => id === fontaines.infos.dureeLocation
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
            Total Fontaines à eau
          </TableCell>
          <TableCell className="text-end font-bold">
            {formatNumber((total * MARGE) / 12)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default DetailFontaines;
