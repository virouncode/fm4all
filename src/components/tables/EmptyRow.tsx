import { TableCell, TableRow } from "../ui/table";

type EmptyRowProps = {
  colSpan?: number;
};

const EmptyRow = ({ colSpan }: EmptyRowProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-gray-500">
        No data available.
      </TableCell>
    </TableRow>
  );
};

export default EmptyRow;
