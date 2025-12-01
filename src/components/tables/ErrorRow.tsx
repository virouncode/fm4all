import { TableCell, TableRow } from "@/components/ui/table";

type ErrorRowProps = {
  colSpan?: number;
};

const ErrorRow = ({ colSpan }: ErrorRowProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center text-red-500">
        Error loading data !
      </TableCell>
    </TableRow>
  );
};

export default ErrorRow;
