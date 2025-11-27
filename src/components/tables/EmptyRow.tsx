import { TableCell, TableRow } from "../ui/table";

type EmptyRowProps = {
  colSpan?: number;
};

const EmptyRow = ({ colSpan }: EmptyRowProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-gray-500">
        Pas de résultats à afficher.
      </TableCell>
    </TableRow>
  );
};

export default EmptyRow;
