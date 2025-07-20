import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";

// Component for the CDC Nettoyage table
const CDCHygiene = () => {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-slate-200"
      id="cdc-hygiene"
    >
      <div>
        <Table className="border-collapse">
          <TableHeader className="sticky top-0 z-20 bg-white">
            <TableRow className="bg-white">
              <TableCell className="sticky left-0 z-10 p-0" colSpan={2}>
                <div className="bg-fm4allsecondary p-4 text-center text-white">
                  <h1 className="text-xl">Cahier des charges - Hygiene</h1>
                  <p>Finition des distributeurs</p>
                </div>
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                className={`sticky left-0 z-10 w-80 text-right font-bold text-white bg-${getFm4AllColor("essentiel")}`}
              >
                Essentiel
              </TableCell>
              <TableCell>Distributeurs blancs basiques</TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                className={`sticky left-0 z-10 w-80 text-right font-bold text-white bg-${getFm4AllColor("confort")}`}
              >
                Confort
              </TableCell>
              <TableCell>Distributeurs couleurs design</TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                className={`sticky left-0 z-10 w-80 text-right font-bold text-white bg-${getFm4AllColor("excellence")}`}
              >
                Excellence
              </TableCell>
              <TableCell>Distributeurs inox design</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CDCHygiene;
