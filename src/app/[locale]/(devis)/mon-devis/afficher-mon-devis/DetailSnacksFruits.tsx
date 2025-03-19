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
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const DetailSnacksFruits = () => {
  const { snacksFruits } = useContext(SnacksFruitsContext);
  const { totalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const totalFruits = totalSnacksFruits.totalFruits;
  const totalSnacks = totalSnacksFruits.totalSnacks;
  const totalBoissons = totalSnacksFruits.totalBoissons;
  const totalLivraison = totalSnacksFruits.totalLivraison ?? 0; //car on veut afficher même si 0
  const total = totalSnacksFruits.total;

  const previsionnelFruits =
    snacksFruits.infos.gammeSelected === "essentiel"
      ? "200g / personne / semaine"
      : snacksFruits.infos.gammeSelected === "confort"
      ? "300g / personne / semaine"
      : "400g / personne / semaine";
  const previsionnelSnacks =
    snacksFruits.infos.gammeSelected === "essentiel"
      ? "1 portion / personne / semaine"
      : snacksFruits.infos.gammeSelected === "confort"
      ? "2 portions / personne / semaine"
      : "4 snacks / personne / semaine";
  const previsionnelBoissons =
    snacksFruits.infos.gammeSelected === "essentiel"
      ? "1 boisson / personne / semaine"
      : snacksFruits.infos.gammeSelected === "confort"
      ? "2 boissons / personne / semaine"
      : "4 boissons / personne / semaine";

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
        {totalFruits ? (
          <TableRow>
            <TableCell>Fruits</TableCell>
            <TableCell>{snacksFruits.infos.nomFournisseur}</TableCell>
            <TableCell>{snacksFruits.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>{previsionnelFruits} </TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber((totalFruits * MARGE) / 12)}
            </TableCell>
          </TableRow>
        ) : null}
        {totalSnacks ? (
          <TableRow>
            <TableCell>Snacks</TableCell>
            <TableCell>{snacksFruits.infos.nomFournisseur}</TableCell>
            <TableCell>{snacksFruits.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>{previsionnelSnacks}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber((totalSnacks * MARGE) / 12)}
            </TableCell>
          </TableRow>
        ) : null}
        {totalBoissons ? (
          <TableRow>
            <TableCell>Boissons</TableCell>
            <TableCell>{snacksFruits.infos.nomFournisseur}</TableCell>
            <TableCell>{snacksFruits.infos.gammeSelected}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell>{previsionnelBoissons}</TableCell>
            <TableCell>N/A</TableCell>
            <TableCell className="text-end">
              {formatNumber((totalBoissons * MARGE) / 12)}
            </TableCell>
          </TableRow>
        ) : null}

        <TableRow>
          <TableCell>Livraison</TableCell>
          <TableCell>{snacksFruits.infos.nomFournisseur}</TableCell>
          <TableCell>N/A</TableCell>
          <TableCell>N/A</TableCell>
          <TableCell>N/A</TableCell>
          <TableCell>N/A</TableCell>
          <TableCell>N/A</TableCell>
          <TableCell className="text-end">
            {formatNumber(((totalLivraison ?? 0) * MARGE) / 12)}
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={7} className="font-bold">
            Total Snacks & Fruits
          </TableCell>
          <TableCell className="text-end font-bold">
            {formatNumber(((totalSnacksFruits.total ?? 0) * MARGE) / 12)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default DetailSnacksFruits;
